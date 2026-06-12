'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useCart } from '@/hooks/use-cart';
import { CartPanel } from './cart-panel';
import { LanguageSwitcher } from './language-switcher';
import { PoiDetailSheet } from './poi-detail-sheet';
import { CategoryBubbleNav } from './category-bubble-nav';
import type { POI, Island, Locale, Section, Municipio } from '@/lib/types';
import { FILTER_TO_CATEGORY_URL } from '@/lib/categories';
import { useUiStrings } from '@/lib/ui-strings';

// ── Pinch-zoom helpers ────────────────────────────────────────────────────────
interface ViewBox { x: number; y: number; w: number; h: number }

const SVG_CENTER = 200;          // centro del contenido (400×400)
const MIN_SIZE   = 80;           // zoom máximo (~5×)
const MOBILE_MAX_SIZE = 400;     // zoom mínimo móvil = vista original completa
const DESKTOP_MAX_SIZE = 560;    // zoom mínimo escritorio = más aire alrededor de la isla

// Top Y de la isla en coordenadas SVG (400×400)
const ISLAND_TOP_SVG: Record<Island, number> = {
  'gran-canaria': 28,
  'tenerife': 45,
};

// Vista inicial centrada
const getInitialVb = (maxSize = MOBILE_MAX_SIZE, centerY = SVG_CENTER): ViewBox => ({
  x: SVG_CENTER - maxSize / 2,
  y: centerY - maxSize / 2,
  w: maxSize,
  h: maxSize,
});

/** Limita el viewBox para que el mapa no se pierda y se centre al alejarse al máximo */
function clampVb(next: ViewBox, maxSize = MOBILE_MAX_SIZE, centerY = SVG_CENTER): ViewBox {
  const w = Math.min(Math.max(next.w, MIN_SIZE), maxSize);
  const h = Math.min(Math.max(next.h, MIN_SIZE), maxSize);

  // Al llegar al zoom mínimo → centrar el mapa
  if (w >= maxSize) {
    return { x: SVG_CENTER - w / 2, y: centerY - h / 2, w, h };
  }

  // Zoom intermedio: evitar salir más del 70% del mapa fuera de pantalla
  const minX = -w * 0.7;
  const maxX =  w * 0.7 + (maxSize - w);
  const minY = -h * 0.7;
  const maxY =  h * 0.7 + (maxSize - h);

  return {
    x: Math.min(Math.max(next.x, minX), maxX),
    y: Math.min(Math.max(next.y, minY), maxY),
    w,
    h,
  };
}

function touchDist(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}
function touchMid(a: Touch, b: Touch) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}
function screenToSvg(screenX: number, screenY: number, rect: DOMRect, vb: ViewBox) {
  return {
    x: vb.x + (screenX - rect.left) / rect.width  * vb.w,
    y: vb.y + (screenY - rect.top)  / rect.height * vb.h,
  };
}

// SVG position map for known POI slugs (x, y within 400x400 viewBox)
const KNOWN_POSITIONS: Record<string, { x: number; y: number }> = {
};

// ── Coordinate helpers ────────────────────────────────────────────────────────
const ISLAND_BOUNDS: Record<Island, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  'gran-canaria': { minLat: 27.70, maxLat: 28.20, minLng: -15.85, maxLng: -15.35 },
  'tenerife':     { minLat: 28.00, maxLat: 28.60, minLng: -16.95, maxLng: -16.10 },
};

function coordsToSvg(lat: number, lng: number, island: Island): { x: number; y: number } {
  const b = ISLAND_BOUNDS[island];
  const x = ((lng - b.minLng) / (b.maxLng - b.minLng)) * 340 + 30;
  const y = ((b.maxLat - lat) / (b.maxLat - b.minLat)) * 340 + 30;
  return { x, y };
}

function getCentroid(pois: POI[], island: Island): { x: number; y: number } {
  const pts = pois
    .filter(p => p.coordinates)
    .map(p => coordsToSvg(p.coordinates!.lat, p.coordinates!.lng, island));
  if (pts.length === 0) return { x: 200, y: 200 };
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  };
}

function isTopPoi(poi: POI): boolean {
  return !!poi.top;
}

// ── Marker separation ────────────────────────────────────────────────────────
// Pushes overlapping markers apart so they don't touch.
// Works on display coords only — does NOT modify underlying lat/lng.
function separateMarkers(
  markers: Array<{ id: string; x: number; y: number }>,
  minDist = 30,
  iterations = 30,
): Record<string, { x: number; y: number }> {
  if (markers.length === 0) return {};
  const pos = markers.map(m => ({ id: m.id, x: m.x, y: m.y }));
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x;
        const dy = pos[j].y - pos[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          pos[i].x -= nx * push;
          pos[i].y -= ny * push;
          pos[j].x += nx * push;
          pos[j].y += ny * push;
        }
      }
    }
  }
  const out: Record<string, { x: number; y: number }> = {};
  pos.forEach(m => { out[m.id] = { x: m.x, y: m.y }; });
  return out;
}

// ── Chip-category config (for clusters) ──────────────────────────────────────
const ACTIVITIES_CATS: POI['category'][] = ['viewpoint', 'food', 'other'];

const CHIP_CATEGORIES: Array<{
  id: string;
  icon: string;
  label: string;
  color: string;
  match: (p: POI) => boolean;
}> = [
  { id: 'beach',      icon: '/icons/icons8-beach-48.png',   label: 'Playas',      color: '#2090c0',
    match: (p) => p.category === 'beach' },
  { id: 'hiking',     icon: '/icons/icons8-hiking-48.png',  label: 'Senderos',    color: '#2a9e60',
    match: (p) => p.category === 'hiking' },
  { id: 'culture',    icon: '/icons/icons8-museum-64.png',     label: 'Cultura',     color: '#6e42b8',
    match: (p) => p.category === 'culture' },
  { id: 'activities', icon: '/icons/icons8-activities-48.png', label: 'Actividades', color: '#ff5533',
    match: (p) => ACTIVITIES_CATS.includes(p.category) },
  { id: 'nature',     icon: '/icons/icons8-forest-48.png',  label: 'Naturaleza',  color: '#2ea86e',
    match: (p) => p.category === 'nature' },
];

function getCategoryIcon(category: POI['category']): string {
  const chip = CHIP_CATEGORIES.find(c =>
    c.id === category || (c.id === 'activities' && ACTIVITIES_CATS.includes(category))
  );
  return chip?.icon ?? '/icons/icons8-activities-48.png';
}

const ISLAND_CONFIGS: Record<Island, {
  path: string;
  fill: string;
  stroke: string;
  viewBox: string;
  label: string;
}> = {
  'gran-canaria': {
    path: 'M 350.33 142.67 L 355.75 147.88 L 369.29 154.39 L 372 159.61 L 369.29 171.33 L 363.87 185.67 L 361.17 198.7 L 372 211.73 L 372 216.94 L 363.87 220.85 L 358.46 227.36 L 350.33 244.3 L 358.46 254.73 L 361.17 269.06 L 361.17 280.79 L 347.62 286 L 339.5 291.21 L 315.12 318.58 L 304.28 327.7 L 250.11 343.33 L 241.98 347.24 L 239.28 347.24 L 220.31 368.09 L 209.48 372 L 201.35 368.09 L 195.94 362.88 L 187.81 358.97 L 155.31 357.67 L 141.76 353.76 L 128.22 348.55 L 87.59 317.27 L 82.17 309.45 L 79.46 304.24 L 63.21 296.42 L 57.8 291.21 L 55.09 287.3 L 30.71 243 L 28 227.36 L 30.71 211.73 L 28 202.61 L 28 190.88 L 28 179.15 L 30.71 170.03 L 38.83 162.21 L 68.63 147.88 L 82.17 138.76 L 98.43 123.12 L 111.97 103.58 L 109.26 85.33 L 117.39 77.52 L 120.09 64.48 L 117.39 48.85 L 114.68 37.12 L 122.8 37.12 L 130.93 37.12 L 139.06 38.42 L 144.47 42.33 L 155.31 39.73 L 195.94 52.76 L 252.82 52.76 L 298.87 63.18 L 317.83 57.97 L 315.12 31.91 L 336.79 28 L 339.5 29.3 L 344.91 39.73 L 344.91 44.94 L 336.79 47.55 L 331.37 57.97 L 334.08 78.82 L 336.79 108.79 L 339.5 114 L 342.2 123.12 L 344.91 133.55 L 350.33 142.67 Z',
    fill: '#fdfdfc',
    stroke: '#f5c518',
    viewBox: '-60 -240 520 520',
    label: 'Gran Canaria',
  },
  tenerife: {
    path: 'M 80,180 C 90,140 115,100 150,75 C 185,50 225,45 265,55 C 305,65 335,90 345,125 C 355,160 340,200 315,225 C 290,250 250,265 210,268 C 170,270 130,258 108,235 C 85,210 72,215 80,180 Z',
    fill: '#fdfdfc',
    stroke: '#f5c518',
    viewBox: '-60 -200 520 520',
    label: 'Tenerife',
  },
};

const CATEGORY_COLORS: Record<POI['category'], string> = {
  nature:   '#2ea86e',
  beach:    '#2090c0',
  culture:  '#6e42b8',
  hiking:   '#2a9e60',
  viewpoint:'#c47a18',
  food:     '#c44038',
  other:    '#5a7a90',
};

// Aclara (percent > 0) u oscurece (percent < 0) un color hex un porcentaje dado
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  if (percent >= 0) {
    r = Math.round(r + (255 - r) * percent);
    g = Math.round(g + (255 - g) * percent);
    b = Math.round(b + (255 - b) * percent);
  } else {
    r = Math.round(r * (1 + percent));
    g = Math.round(g * (1 + percent));
    b = Math.round(b * (1 + percent));
  }
  const toHex = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Gama de colores (degradado claro -> oscuro) para cada categoría de POI
const CATEGORY_GRADIENTS: Record<POI['category'], { light: string; base: string; dark: string }> =
  Object.fromEntries(
    Object.entries(CATEGORY_COLORS).map(([cat, color]) => [
      cat,
      { light: shadeColor(color, 0.45), base: color, dark: shadeColor(color, -0.35) },
    ])
  ) as Record<POI['category'], { light: string; base: string; dark: string }>;

// Color base de los marcadores de municipio y su gama de degradado
const MUNICIPIO_COLOR = '#2090c0';
const MUNICIPIO_GRADIENT = {
  light: shadeColor(MUNICIPIO_COLOR, 0.45),
  base: MUNICIPIO_COLOR,
  dark: shadeColor(MUNICIPIO_COLOR, -0.35),
};

// Retrasa el montaje de imágenes de marcadores para evitar descargar
// decenas de fotos a la vez (lag al cargar/cambiar de isla).
// `index` permite escalonar la carga (primeros marcadores antes que el resto).
function useLazyMarkerImage(index: number) {
  // La animación de aparición ya escalona la entrada visual de cada marcador,
  // así que las imágenes empiezan a descargarse de inmediato (el navegador
  // las prioriza con loading="lazy"/decoding="async") para que la foto esté
  // lista lo antes posible cuando el marcador aparece.
  void index;
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return { ready: true, loaded, setLoaded, errored, setErrored };
}

// Las fotos "hero" son de alta resolución (para la card de detalle). Para los
// círculos diminutos del mapa usamos una miniatura pre-generada (~120px, 1-3KB)
// con el sufijo "-marker", generada con `scripts/generate-marker-thumbs.py`.
function markerThumb(src: string): string {
  const dot = src.lastIndexOf('.');
  if (dot === -1) return src;
  return `${src.slice(0, dot)}-marker${src.slice(dot)}`;
}

function getPoiPosition(poi: POI, island: Island): { x: number; y: number } {
  if (KNOWN_POSITIONS[poi.slug]) return KNOWN_POSITIONS[poi.slug];
  if (poi.coordinates) return coordsToSvg(poi.coordinates.lat, poi.coordinates.lng, island);
  return { x: 200, y: 200 };
}

interface PoiMarkerProps {
  poi: POI;
  island: Island;
  selected: boolean;
  onClick: () => void;
  displayX?: number;
  displayY?: number;
  showPhoto?: boolean;
  showCategoryIcon?: boolean;
  index?: number;
  animate?: boolean;
}

function PoiMarker({ poi, island, selected, onClick, displayX, displayY, showPhoto, showCategoryIcon, index = 0, animate = true }: PoiMarkerProps) {
  const computed = getPoiPosition(poi, island);
  const x = displayX ?? computed.x;
  const y = displayY ?? computed.y;
  const color = poi.gygTourId ? '#ff5533' : CATEGORY_COLORS[poi.category];
  const R = (showPhoto || showCategoryIcon) ? 14 : 10;
  const cy = y - R - 8;
  const clipId = `clip-poi-${poi.slug.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const { ready: imageReady, loaded: imageLoaded, setLoaded: setImageLoaded, errored: imageErrored, setErrored: setImageErrored } = useLazyMarkerImage(index);
  const appearDelay = Math.min(index * 50, 900);
  const showImage = showPhoto && !imageErrored;

  return (
    <g
      onPointerDown={(event) => {
        event.stopPropagation();
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        const start = pointerStartRef.current;
        pointerStartRef.current = null;
        if (!start) return;
        const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        if (moved < 10) onClick();
      }}
      onPointerCancel={() => { pointerStartRef.current = null; }}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      style={{
        cursor: 'pointer',
        transform: selected ? `scale(1.4)` : 'scale(1)',
        transformOrigin: `${x}px ${y}px`,
        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        touchAction: 'manipulation',
        ...(animate ? { animation: `markerFadeIn 0.3s ease-out ${appearDelay}ms both` } : {}),
      }}
    >
      {showPhoto && (
        <defs>
          <clipPath id={clipId}>
            <circle cx={x} cy={cy} r={R} />
          </clipPath>
        </defs>
      )}
      {/* Shadow */}
      <ellipse cx={x} cy={y + 3} rx={5} ry={2.5} fill="rgba(15,23,42,0.12)" />
      {/* Pin triangle */}
      <path d={`M ${x - 6} ${cy + R} L ${x + 6} ${cy + R} L ${x} ${y} Z`} fill={color} />
      {/* Circle background */}
      <circle cx={x} cy={cy} r={R + 2} fill={selected ? color : ((showImage || showCategoryIcon) ? shadeColor(color, 0.82) : '#ffffff')} stroke={`url(#poiGradient-${poi.category})`} strokeWidth="2.5" />
      {showImage && imageReady && (
        <image
          href={markerThumb(poi.images.hero)}
          x={x - R} y={cy - R}
          width={R * 2} height={R * 2}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageErrored(true)}
          style={{ userSelect: 'none', pointerEvents: 'none', opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.25s' }}
        />
      )}
      {showCategoryIcon && (
        <image
          href={getCategoryIcon(poi.category)}
          x={x - 9} y={cy - 9}
          width="18" height="18"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        />
      )}
      {selected && (showPhoto || showCategoryIcon) && (
        <circle cx={x} cy={cy} r={R + 2} fill="none" stroke="white" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      )}
    </g>
  );
}

// ── Municipio marker ─────────────────────────────────────────────────────────
interface MunicipioMarkerProps {
  municipio: Municipio;
  island: Island;
  count: number;
  selected: boolean;
  onClick: () => void;
  displayX?: number;
  displayY?: number;
  index?: number;
  animate?: boolean;
}

function MunicipioMarker({ municipio, island, count, selected, onClick, displayX, displayY, index = 0, animate = true }: MunicipioMarkerProps) {
  const computed = coordsToSvg(municipio.coordinates.lat, municipio.coordinates.lng, island);
  const x = displayX ?? computed.x;
  const y = displayY ?? computed.y;
  const R = 14;
  const cy = y - R - 8;
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const appearDelay = Math.min(index * 50, 900);

  return (
    <g
      onPointerDown={(e) => { e.stopPropagation(); pointerStartRef.current = { x: e.clientX, y: e.clientY }; }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const start = pointerStartRef.current; pointerStartRef.current = null;
        if (!start) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) onClick();
      }}
      onPointerCancel={() => { pointerStartRef.current = null; }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        cursor: 'pointer',
        transform: selected ? 'scale(1.35)' : 'scale(1)',
        transformOrigin: `${x}px ${y}px`,
        transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        ...(animate ? { animation: `markerFadeIn 0.3s ease-out ${appearDelay}ms both` } : {}),
      }}
    >
      <ellipse cx={x} cy={y + 3} rx={5} ry={2.5} fill="rgba(15,23,42,0.12)" />
      <path d={`M ${x - 6} ${cy + R} L ${x + 6} ${cy + R} L ${x} ${y} Z`} fill="#2090c0" />
      <circle cx={x} cy={cy} r={R + 2} fill={selected ? '#2090c0' : '#ffffff'} stroke="url(#poiGradient-municipio)" strokeWidth="2.5" />
      <image
        href="/icons/icons8-houses-48.png"
        x={x - 9} y={cy - 9}
        width="18" height="18"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      />
      {/* count badge */}
      <circle cx={x + R - 1} cy={cy - R + 1} r={8} fill="#FFAD5C" />
      <text x={x + R - 1} y={cy - R + 4} textAnchor="middle" fontSize="7"
        fill="white" fontWeight="700"
        style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'monospace' }}>
        {count}
      </text>
    </g>
  );
}

// ── Category cluster marker ───────────────────────────────────────────────────
interface CategoryClusterProps {
  icon: string;
  color: string;
  count: number;
  x: number;
  y: number;
  onClick: () => void;
}

function CategoryClusterMarker({ icon, color, count, x, y, onClick }: CategoryClusterProps) {
  const R = 20;
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <g
      onPointerDown={(e) => {
        e.stopPropagation();
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const start = pointerStartRef.current;
        pointerStartRef.current = null;
        if (!start) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) onClick();
      }}
      onPointerCancel={() => { pointerStartRef.current = null; }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{ cursor: 'pointer' }}
    >
      {/* Pulse ring */}
      <circle cx={x} cy={y} r={R + 7} fill={color} opacity={0.12} />
      {/* Shadow */}
      <ellipse cx={x} cy={y + R + 3} rx={R * 0.7} ry={4} fill="rgba(0,0,0,0.10)" />
      {/* Main circle */}
      <circle cx={x} cy={y} r={R} fill="white" stroke={color} strokeWidth="2.5" />
      {/* Icon */}
      {icon.startsWith('/') ? (
        <image href={icon} x={x - 10} y={y - 10} width="20" height="20"
          style={{ userSelect: 'none', pointerEvents: 'none' }} />
      ) : (
        <text x={x} y={y + 5} textAnchor="middle" fontSize="15"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {icon}
        </text>
      )}
      {/* Count badge */}
      <circle cx={x + R - 1} cy={y - R + 1} r={9} fill={color} />
      <text x={x + R - 1} y={y - R + 5} textAnchor="middle" fontSize="8"
        fill="white" fontWeight="700"
        style={{ userSelect: 'none', pointerEvents: 'none', fontFamily: 'monospace' }}>
        {count}
      </text>
    </g>
  );
}

interface IslandMapProps {
  locale: Locale;
  poisByIsland: Record<Island, POI[]>;
  sectionsByIsland: Record<Island, Section[]>;
  municipiosByIsland: Record<Island, Municipio[]>;
  initialIsland?: Island;
  initialFilter?: string;
  islandName?: string;
  showLanguageSwitcher?: boolean;
}

export function IslandMap({ locale, poisByIsland, sectionsByIsland, municipiosByIsland, initialIsland = 'gran-canaria', initialFilter, islandName, showLanguageSwitcher = true }: IslandMapProps) {
  const t = useUiStrings(locale);
  const router = useRouter();
  const [activeIsland, setActiveIsland] = useState<Island>(initialIsland);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(initialFilter ?? 'top');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
  const [detailPois, setDetailPois] = useState<POI[]>([]);
  // La animación de aparición de los marcadores solo debe verse una vez,
  // al cargar el mapa. Tras la primera tanda (índices hasta ~900ms + 300ms
  // de duración), los marcadores se muestran ya estáticos sin re-animarse
  // al cambiar de filtro/categoría.
  const [markersAnimated, setMarkersAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMarkersAnimated(true), 1300);
    return () => clearTimeout(t);
  }, []);
  const [detailSheetKey, setDetailSheetKey] = useState(0);
  const cart = useCart();
  const [mapMaxSize, setMapMaxSize] = useState(MOBILE_MAX_SIZE);
  const mapCenterYRef = useRef(SVG_CENTER);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // ── Zoom / Pan ─────────────────────────────────────────────────────────────
  const [vb, setVb] = useState<ViewBox>(() => getInitialVb());
  const svgRef = useRef<SVGSVGElement>(null);
  const touchState = useRef<{
    type: 'none' | 'pan' | 'pinch';
    lastTouches: Touch[];
    lastDist: number;
  }>({ type: 'none', lastTouches: [], lastDist: 0 });

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const updateMaxSize = () => {
      setMapMaxSize(media.matches ? DESKTOP_MAX_SIZE : MOBILE_MAX_SIZE);
    };

    updateMaxSize();
    media.addEventListener('change', updateMaxSize);
    return () => media.removeEventListener('change', updateMaxSize);
  }, []);

  // Calcula mapCenterY para que la isla arranque 5% por debajo del último chip
  useEffect(() => {
    const compute = () => {
      const filterBar = filterBarRef.current;
      if (!filterBar) return;

      const filterBarBottom = filterBar.getBoundingClientRect().bottom;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const targetIslandTop = filterBarBottom + 0.05 * vh;

      // Con preserveAspectRatio="xMidYMid meet": scale = min(vw,vh) / maxSize
      const scale = Math.min(vw, vh) / mapMaxSize;
      const renderedSize = mapMaxSize * scale;
      // Offset vertical del contenido SVG dentro del viewport
      const offsetY = (vh - renderedSize) / 2;

      // islandTopSvg mapea a targetIslandTop en pantalla:
      //   targetIslandTop = offsetY + (islandTopSvg - viewBox.y) * scale
      //   → viewBox.y = islandTopSvg - (targetIslandTop - offsetY) / scale
      const islandTopSvg = ISLAND_TOP_SVG[activeIsland];
      const viewBoxY = islandTopSvg - (targetIslandTop - offsetY) / scale;
      mapCenterYRef.current = viewBoxY + mapMaxSize / 2;
    };

    compute();

    const filterBar = filterBarRef.current;
    if (!filterBar) return;
    const ro = new ResizeObserver(compute);
    ro.observe(filterBar);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [mapMaxSize, activeIsland]);

  // Reset viewBox when island or screen size changes
  useEffect(() => { setVb(getInitialVb(mapMaxSize, mapCenterYRef.current)); }, [activeIsland, mapMaxSize]);


  // Non-passive touch listeners so we can preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchState.current = { type: 'pan', lastTouches: [e.touches[0]], lastDist: 0 };
      } else if (e.touches.length === 2) {
        e.preventDefault();
        touchState.current = {
          type: 'pinch',
          lastTouches: [e.touches[0], e.touches[1]],
          lastDist: touchDist(e.touches[0], e.touches[1]),
        };
      }
    };

    const onMove = (e: TouchEvent) => {
      const ts = touchState.current;
      if (ts.type === 'none') return;
      e.preventDefault();

      const rect = svg.getBoundingClientRect();

      if (ts.type === 'pinch' && e.touches.length === 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        const newDist = touchDist(t0, t1);
        const factor = ts.lastDist / newDist;           // <1 = zoom in, >1 = zoom out
        const mid = touchMid(t0, t1);
        const pivot = screenToSvg(mid.x, mid.y, rect, vb);

        // Zoom hacia el pivote
        setVb(prev => {
          const newW = prev.w * factor;
          const newH = prev.h * factor;
          const scaleW = newW / prev.w;
          const scaleH = newH / prev.h;
          const candidate: ViewBox = {
            x: pivot.x - (pivot.x - prev.x) * scaleW,
            y: pivot.y - (pivot.y - prev.y) * scaleH,
            w: newW,
            h: newH,
          };
          return clampVb(candidate, mapMaxSize, mapCenterYRef.current);
        });

        // Pan simultáneo mientras se hace pinch
        const lastMid = touchMid(ts.lastTouches[0], ts.lastTouches[1]);
        const dxScreen = mid.x - lastMid.x;
        const dyScreen = mid.y - lastMid.y;
        setVb(prev => clampVb({
          ...prev,
          x: prev.x - dxScreen / rect.width  * prev.w,
          y: prev.y - dyScreen / rect.height * prev.h,
        }, mapMaxSize, mapCenterYRef.current));

        touchState.current = { type: 'pinch', lastTouches: [t0, t1], lastDist: newDist };

      } else if (ts.type === 'pan' && e.touches.length === 1) {
        const t = e.touches[0];
        const prev0 = ts.lastTouches[0];
        const dx = (t.clientX - prev0.clientX) / rect.width  * vb.w;
        const dy = (t.clientY - prev0.clientY) / rect.height * vb.h;
        setVb(prev => clampVb({ ...prev, x: prev.x - dx, y: prev.y - dy }, mapMaxSize, mapCenterYRef.current));
        touchState.current = { ...ts, lastTouches: [t] };
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) touchState.current = { type: 'none', lastTouches: [], lastDist: 0 };
    };

    svg.addEventListener('touchstart', onStart, { passive: false });
    svg.addEventListener('touchmove',  onMove,  { passive: false });
    svg.addEventListener('touchend',   onEnd,   { passive: true  });
    return () => {
      svg.removeEventListener('touchstart', onStart);
      svg.removeEventListener('touchmove',  onMove);
      svg.removeEventListener('touchend',   onEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIsland, vb, mapMaxSize]);

  const pois = poisByIsland[activeIsland] ?? [];
  const mapPois = pois.filter((poi) => !poi.sectionOnly);
  const sections = sectionsByIsland[activeIsland] ?? [];
  const islandConfig = ISLAND_CONFIGS[activeIsland];
  const activeSection = activeSectionId
    ? sections.find((section) => section.id === activeSectionId) ?? null
    : null;

  const municipios = municipiosByIsland[activeIsland] ?? [];

  // ── Lógica de marcadores visibles ──────────────────────────────────────────
  //
  // Sin filtro / Municipios → marcador por municipio (con badge de nº de POIs)
  // Top                     → pines individuales de POIs top
  // Chip de categoría       → UN cluster con el total de esa categoría
  // Sección                 → pines individuales de la sección

  const CATEGORY_CHIP_IDS = ['beach', 'hiking', 'culture', 'nature', 'activities'];
  const activeCategoryChip = activeFilter && CATEGORY_CHIP_IDS.includes(activeFilter)
    ? activeFilter : null;

  // Marcadores de municipio: sin filtro o con "municipios"
  const showMunicipioMarkers = !activeFilter || activeFilter === 'municipios';
  const municipioMarkers = showMunicipioMarkers
    ? municipios.map(m => ({
        ...m,
        count: mapPois.filter(p => p.municipio === m.slug).length,
      }))
    : [];

  // Pines individuales (Top / secciones / categoría con sheet abierta)
  const filteredPois = (() => {
    if (activeFilter === 'top') return mapPois.filter(p => isTopPoi(p));
    if (activeCategoryChip && selectedPoi) {
      // Cluster ya fue pulsado → mostrar bubbles individuales de la categoría
      const chip = CHIP_CATEGORIES.find(c => c.id === activeCategoryChip);
      return chip ? mapPois.filter(p => chip.match(p)) : [];
    }
    if (activeFilter?.startsWith('sec:')) {
      const sectionId = activeFilter.slice(4);
      const section = sections.find(s => s.id === sectionId);
      return section ? mapPois.filter(p => section.pois.includes(p.slug)) : [];
    }
    return [];
  })();

  // Cluster único por categoría (solo cuando la sheet está cerrada)
  const categoryClusters = (() => {
    if (!activeCategoryChip || selectedPoi) return [];
    const chip = CHIP_CATEGORIES.find(c => c.id === activeCategoryChip);
    if (!chip) return [];
    const clusterPois = mapPois.filter(p => chip.match(p));
    if (clusterPois.length === 0) return [];
    return [{ ...chip, count: clusterPois.length, x: SVG_CENTER, y: SVG_CENTER, pois: clusterPois }];
  })();

  // Adjusted display positions — prevents marker overlap without touching lat/lng data
  const adjustedPositions = useMemo(() => {
    const all: Array<{ id: string; x: number; y: number }> = [];
    municipioMarkers.forEach(m => {
      const pos = coordsToSvg(m.coordinates.lat, m.coordinates.lng, activeIsland);
      all.push({ id: m.slug, x: pos.x, y: pos.y });
    });
    filteredPois.forEach(p => {
      const pos = getPoiPosition(p, activeIsland);
      all.push({ id: p.slug, x: pos.x, y: pos.y });
    });
    const separated = separateMarkers(all, 46, 80);
    // Desplaza visualmente todos los marcadores un poco hacia abajo,
    // sin tocar las coordenadas lat/lng reales.
    const MARKER_Y_OFFSET = 10;
    Object.values(separated).forEach(p => { p.y += MARKER_Y_OFFSET; });
    return separated;
  }, [municipioMarkers, filteredPois, activeIsland]);

  const handleSectionSelect = useCallback((sectionId: string) => {
    const section = sections.find((item) => item.id === sectionId);
    const sectionPois = section
      ? section.pois
          .map((slug) => pois.find((poi) => poi.slug === slug))
          .filter((poi): poi is POI => Boolean(poi))
      : [];
    const firstPoi = sectionPois[0];

    if (!firstPoi) return;

    setActiveFilter(null);
    setActiveSectionId(sectionId);
    setDetailPois(sectionPois);
    setDetailSheetKey((key) => key + 1);
    setSelectedPoi(firstPoi);
  }, [pois, sections]);

  const handleFilterToggle = useCallback((filterId: string) => {
    setActiveSectionId(null);
    setDetailPois([]);
    setSelectedPoi(null);
    // Calcular next fuera del updater (los updaters deben ser puros)
    setActiveFilter((current) => {
      const next = current === filterId ? null : filterId;
      return next;
    });
    // Side effect de URL separado del state update
    const next = activeFilter === filterId ? null : filterId;
    const CHIP_IDS = ['beach', 'hiking', 'culture', 'nature', 'activities', 'top'];
    if (next && CHIP_IDS.includes(next) && FILTER_TO_CATEGORY_URL[next]) {
      window.history.replaceState(null, '', `/${locale}/${activeIsland}/${FILTER_TO_CATEGORY_URL[next]}`);
    } else {
      window.history.replaceState(null, '', `/${locale}/${activeIsland}`);
    }
  }, [locale, activeIsland, activeFilter]);

  const handleCloseSheet = useCallback(() => {
    setSelectedPoi(null);
    setActiveSectionId(null);
    setSelectedMunicipio(null);
    setDetailPois([]);
    // Al cerrar la card de descripción, el mapa vuelve a "Top" — excepto si
    // estábamos viendo un municipio, en cuyo caso se mantiene esa vista.
    if (activeFilter === 'municipios') return;
    setActiveFilter('top');
    window.history.replaceState(null, '', `/${locale}/${activeIsland}/${FILTER_TO_CATEGORY_URL['top']}`);
  }, [locale, activeIsland, activeFilter]);

  const handlePoiClick = useCallback((poi: POI) => {
    const CHIP_IDS = ['beach', 'hiking', 'culture', 'nature', 'activities'];
    const categorySlug = activeFilter && CHIP_IDS.includes(activeFilter)
      ? FILTER_TO_CATEGORY_URL[activeFilter]
      : null;
    if (categorySlug) {
      router.push(`/${locale}/${activeIsland}/${categorySlug}/${poi.slug}`);
    } else {
      router.push(`/${locale}/${activeIsland}/${poi.slug}`);
    }
  }, [router, locale, activeIsland, activeFilter]);

  // Tocar un cluster de categoría → muestra bubbles individuales + abre sheet del primer POI
  const handleClusterClick = useCallback((chipId: string) => {
    const chip = CHIP_CATEGORIES.find(c => c.id === chipId);
    if (!chip) return;
    const categoryPois = mapPois.filter(p => chip.match(p));
    if (categoryPois.length === 0) return;
    setDetailPois(categoryPois);
    setDetailSheetKey(k => k + 1);
    setSelectedPoi(categoryPois[0]);
  }, [mapPois]);

  // Tocar un municipio → abre la sheet con el propio municipio + todos sus POIs
  const handleMunicipioClick = useCallback((municipioSlug: string) => {
    const muni = municipios.find(m => m.slug === municipioSlug);
    const mPois = mapPois.filter(p => p.municipio === municipioSlug);
    if (!muni) return;

    const allPois = [
      {
        slug: muni.slug,
        name: muni.name,
        description: muni.description ?? muni.name,
        shortDescription: muni.shortDescription ?? '',
        island: activeIsland,
        category: 'culture' as const,
        coordinates: muni.coordinates,
        images: muni.images ?? { hero: muni.heroImage ?? '/images/placeholder.avif', gallery: [] },
        hasPremiumAudio: false,
        tags: [],
        emoji: muni.emoji,
        municipio: muni.slug,
      } satisfies POI,
      ...mPois,
    ];

    setActiveSectionId(null);
    setSelectedMunicipio(municipioSlug);
    setDetailPois(allPois);
    setDetailSheetKey(k => k + 1);
    setSelectedPoi(allPois[0]);
  }, [mapPois, municipios, activeIsland]);

  const handleAddToCart = useCallback((poi: POI) => {
    cart.addPoi(poi);
  }, [cart]);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      backgroundColor: '#e8edf0',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='70'%3E%3Cpath d='M0 35 Q35 10 70 35 Q105 60 140 35' fill='none' stroke='%2370c4e4' stroke-width='1.1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    }}>

      {/* Nav fijo — dentro del mapa para acceder al estado del cart */}
      <nav className="nav-floating" style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        background: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
        zIndex: 130,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Fila 1: logo ← → carrito */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 0 16px', gap: '8px' }}>
          <a href={`/${locale}`} style={{ lineHeight: 0 }}>
            <Image
              src="/logo/file.svg"
              alt="CanaryRoutes"
              width={240}
              height={36}
              style={{ height: '85px', width: 'auto' }}
              priority
              unoptimized
            />
          </a>

          {/* Línea ruta curva POI */}
          <svg viewBox="0 0 200 30" style={{ flex: 1, height: '30px' }} preserveAspectRatio="xMidYMid meet">
            <path
              d="M0,15 Q25,6 50,15 Q75,24 100,15 Q125,6 150,15 Q175,22 200,15"
              fill="none" stroke="#2090c0" strokeWidth="1.8" strokeDasharray="5,7"
              strokeLinecap="round" opacity="0.35"
            />
            <circle cx="40" cy="13" r="5" fill="white" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="40" cy="13" r="2.5" fill="#f5c518" opacity="0.7"/>
            <circle cx="100" cy="15" r="5" fill="white" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="100" cy="15" r="2.5" fill="#f5c518" opacity="0.7"/>
            <circle cx="168" cy="18" r="5" fill="white" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="168" cy="18" r="2.5" fill="#f5c518" opacity="0.7"/>
          </svg>

          {/* Botón carrito */}
          <button
            onClick={() => setCartOpen((v) => !v)}
            style={{
              position: 'relative', background: 'none', border: 'none',
              cursor: 'pointer', padding: '6px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Mi Ruta"
          >
            <img src="/icons/icons8-car-53.png" alt="Mi Ruta" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            {cart.count > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                background: '#1f9d61', color: 'white',
                fontSize: '10px', fontWeight: '700', lineHeight: 1,
                minWidth: '16px', height: '16px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px', fontFamily: "'JetBrains Mono', monospace",
              }}>
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* SVG mapa — ocupa toda la pantalla, zoom/pan por touch */}
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        onWheel={(event) => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const pivot = screenToSvg(event.clientX, event.clientY, rect, vb);
          const factor = event.deltaY > 0 ? 1.12 : 0.88;

          setVb(prev => {
            const newW = prev.w * factor;
            const newH = prev.h * factor;
            const scaleW = newW / prev.w;
            const scaleH = newH / prev.h;
            const candidate: ViewBox = {
              x: pivot.x - (pivot.x - prev.x) * scaleW,
              y: pivot.y - (pivot.y - prev.y) * scaleH,
              w: newW,
              h: newH,
            };
            return clampVb(candidate, mapMaxSize, mapCenterYRef.current);
          });
        }}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', userSelect: 'none', background: 'transparent' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="islandStroke"    gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#ffd100" />
            <stop offset="50%"  stopColor="#ffb300" />
            <stop offset="100%" stopColor="#079dde" />
          </linearGradient>
          {Object.entries(CATEGORY_GRADIENTS).map(([cat, shades]) => (
            <linearGradient key={cat} id={`poiGradient-${cat}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={shades.light} />
              <stop offset="50%"  stopColor={shades.base} />
              <stop offset="100%" stopColor={shades.dark} />
            </linearGradient>
          ))}
          <linearGradient id="poiGradient-municipio" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={MUNICIPIO_GRADIENT.light} />
            <stop offset="50%"  stopColor={MUNICIPIO_GRADIENT.base} />
            <stop offset="100%" stopColor={MUNICIPIO_GRADIENT.dark} />
          </linearGradient>
        </defs>
        <style>{`
          @keyframes markerFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `}</style>
        <path
          d={islandConfig.path}
          fill={islandConfig.fill}
          stroke="url(#islandStroke)"
          strokeWidth="2.5"
        />
        {/* Marcadores de municipio */}
        {municipioMarkers.map((m, i) => (
          <MunicipioMarker
            key={m.slug}
            municipio={m}
            island={activeIsland}
            count={m.count}
            selected={selectedMunicipio === m.slug}
            onClick={() => handleMunicipioClick(m.slug)}
            displayX={adjustedPositions[m.slug]?.x}
            displayY={adjustedPositions[m.slug]?.y}
            index={i}
            animate={!markersAnimated}
          />
        ))}
        {/* Pines individuales: Top o sección */}
        {filteredPois.map((poi, i) => (
          <PoiMarker
            key={poi.slug}
            poi={poi}
            island={activeIsland}
            selected={selectedPoi?.slug === poi.slug}
            onClick={() => handlePoiClick(poi)}
            displayX={adjustedPositions[poi.slug]?.x}
            displayY={adjustedPositions[poi.slug]?.y}
            showCategoryIcon={activeFilter === 'top'}
            index={i}
            animate={!markersAnimated}
          />
        ))}
        {/* Cluster de categoría */}
        {categoryClusters.map((cluster) => (
          <CategoryClusterMarker
            key={cluster.id}
            icon={cluster.icon}
            color={cluster.color}
            count={cluster.count}
            x={cluster.x}
            y={cluster.y}
            onClick={() => handleClusterClick(cluster.id)}
          />
        ))}
      </svg>

      {/* ── Filter bar — flotante sobre el mapa, bajo el nav ── */}
      <div ref={filterBarRef} style={{
        position: 'fixed',
        top: '109px',
        left: 0,
        right: 0,
        zIndex: 140,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>

        {/* Fila 1: píldora unificada — Municipios · Top · │ · 🌍 */}
        <div style={{ padding: '0 12px', pointerEvents: 'auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width:'auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent:'center',
            background: '#ffffff',
            borderRadius: '50px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.06)',
            padding: '6px',
            gap: '2px',
          }}>
            {/* Botones de acción */}
            {([
              { id: 'municipios', icon: '/icons/icons8-houses-48.png', label: t.chips.municipios },
              { id: 'top',        icon: '/icons/icons8-star-48.png',   label: t.chips.top        },
            ] as const).map(btn => {
              const isActive = activeFilter === btn.id;
              return (
                <div key={btn.label}>
                <button
                  key={btn.id}
                  onPointerUp={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleFilterToggle(btn.id);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 14px', borderRadius: '40px',
                    background: isActive ? '#1f9d61' : 'transparent',
                    color: isActive ? 'white' : '#374151',
                    border: 'none',
                    fontSize: '14px', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(31,157,97,0.4)' : 'none',
                  }}
                >
                  {btn.icon.startsWith('/') ? (
                    <img src={btn.icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '15px' }}>{btn.icon}</span>
                  )}
                  <span>{btn.label}</span>
                </button>
          </div>
          );
            })}
                            <div style={{
              width: 1, alignSelf: 'stretch',
              background: 'rgba(26,61,43,0.15)',
              margin: '6px 4px',
              flexShrink: 0,
            }}> </div>
            {/* Language switcher — integrado en la píldora */}
            {showLanguageSwitcher && (
              <div style={{ flexShrink: 0}}>
                <LanguageSwitcher currentLocale={locale} />
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: chips de categoría — centrados, scroll si no caben */}
        <div style={{
          overflowX: 'auto', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          padding: '0 12px 4px',
          pointerEvents: 'auto',
        }}>
        <div style={{
          display: 'flex', gap: '7px',
          flexWrap: 'nowrap',
          width: 'max-content',
          margin: '0 auto',
        }}>
          {([
            { id: 'beach',      icon: '/icons/icons8-beach-48.png',      label: t.chips.beach,      color: '#2090c0' },
            { id: 'hiking',     icon: '/icons/icons8-hiking-48.png',     label: t.chips.hiking,     color: '#2a9e60' },
            { id: 'culture',    icon: '/icons/icons8-museum-64.png',     label: t.chips.culture,    color: '#6e42b8' },
            { id: 'activities', icon: '/icons/icons8-activities-48.png', label: t.chips.activities, color: '#ff5533' },
            { id: 'nature',     icon: '/icons/icons8-forest-48.png',     label: t.chips.nature,     color: '#2ea86e' },
          ] as const).map(chip => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onPointerUp={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleFilterToggle(chip.id);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 13px', borderRadius: '20px', flexShrink: 0,
                  background: isActive
                    ? `linear-gradient(135deg, ${shadeColor(chip.color, 0.45)}, ${chip.color}, ${shadeColor(chip.color, -0.35)})`
                    : 'rgba(255,255,255,0.92)',
                  color: isActive ? 'white' : '#4b5563',
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.10)',
                  boxShadow: isActive
                    ? `0 3px 10px ${chip.color}55`
                    : '0 1px 3px rgba(0,0,0,0.08)',
                  fontSize: '11px', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'all 0.18s',
                  backdropFilter: isActive ? 'none' : 'blur(4px)',
                }}
              >
                {chip.icon.startsWith('/') ? (
                  <img src={chip.icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '13px' }}>{chip.icon}</span>
                )}
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {chip.label}
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* Nombre isla — footer fijo */}
      {islandName && (
        <div style={{
          position: 'fixed',
          bottom: '24px', left: 0, right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 120,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffd100, #ffb300, #079dde)',
            borderRadius: '22px',
            padding: '2px',
          }}>
            <div style={{
              background: '#000',
              borderRadius: '20px',
              padding: '5px 16px',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                fontWeight: '700',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                backgroundImage: 'linear-gradient(135deg, #ffd100, #ffb300, #079dde)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {islandName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet — detalle del POI seleccionado */}
      {selectedPoi && (
        <PoiDetailSheet
          key={detailSheetKey}
          pois={detailPois.length ? detailPois : mapPois}
          selectedPoi={selectedPoi}
          onPoiChange={(poi) => {
            setSelectedPoi(poi);
            // Actualizar URL cuando se navega entre POIs de una categoría
            if (activeCategoryChip && FILTER_TO_CATEGORY_URL[activeCategoryChip]) {
              const catSlug = FILTER_TO_CATEGORY_URL[activeCategoryChip];
              window.history.replaceState(null, '', `/${locale}/${activeIsland}/${catSlug}/${poi.slug}`);
            }
          }}
          onClose={handleCloseSheet}
          cart={cart}
          onAddToCart={handleAddToCart}
          locale={locale}
          sectionContext={activeSection ? {
            label: activeSection.label,
            emoji: activeSection.emoji,
            color: activeSection.color,
          } : undefined}
        />
      )}

      {/* Cart panel */}
      <CartPanel cart={cart} isOpen={cartOpen} onClose={() => setCartOpen(false)} locale={locale} />

    </div>
  );
}
