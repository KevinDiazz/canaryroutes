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
import type { PhotoCreditGroup } from '@/lib/image-credits';
import { FILTER_TO_CATEGORY_URL } from '@/lib/categories';
import { useUiStrings } from '@/lib/ui-strings';

// ── Pinch-zoom helpers ────────────────────────────────────────────────────────
interface ViewBox { x: number; y: number; w: number; h: number }

const SVG_CENTER = 200;          // centro del contenido (400×400)
const MIN_SIZE   = 80;           // zoom máximo (~5×)
const MOBILE_MAX_SIZE = 400;     // zoom mínimo móvil = vista original completa
const DESKTOP_MAX_SIZE = 640;    // zoom mínimo escritorio = más aire alrededor de la isla
const ISLAND_BAR_H = 110;       // altura del div nombre-isla (bottom bar)

// Top Y de la isla en coordenadas SVG (400×400)
const ISLAND_TOP_SVG: Record<Island, number> = {
  'gran-canaria': 28,
  'tenerife': 50,
};

// Vista inicial centrada
const getInitialVb = (maxSize = MOBILE_MAX_SIZE, centerY = SVG_CENTER): ViewBox => ({
  x: SVG_CENTER - maxSize / 2,
  y: centerY - maxSize / 2,
  w: maxSize,
  h: maxSize,
});

/** Limita el viewBox para que el mapa no se pierda y se centre al alejarse al máximo */
function clampVb(next: ViewBox, maxSize = MOBILE_MAX_SIZE, centerY = SVG_CENTER, minVb?: ViewBox): ViewBox {
  // Si hay initVb, el zoom mínimo se basa en sus dimensiones
  const effectiveMax = minVb ? Math.max(minVb.w, minVb.h) : maxSize;
  const w = Math.min(Math.max(next.w, MIN_SIZE), effectiveMax);
  const h = Math.min(Math.max(next.h, MIN_SIZE), effectiveMax);

  // Al llegar al zoom mínimo → usar initVb si existe (para islas con viewBox no cuadrado)
  if (w >= effectiveMax) {
    if (minVb) return minVb;
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
  'tenerife':     { minLat: 27.87, maxLat: 28.62, minLng: -16.92, maxLng: -16.13 },
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
  { id: 'beach',      icon: '/icons/icons8-beach-48.png',      label: 'Playas',      color: '#2090c0',
    match: (p) => p.category === 'beach' },
  { id: 'activities', icon: '/icons/icons8-activities-48.png', label: 'Actividades', color: '#ff5533',
    match: (p) => ACTIVITIES_CATS.includes(p.category) },
  { id: 'culture',    icon: '/icons/icons8-museum-64.png',     label: 'Cultura',     color: '#6e42b8',
    match: (p) => p.category === 'culture' },
  { id: 'transport',  icon: '/icons/icons8-car-53.png',        label: 'Transporte',  color: '#f59e0b',
    match: (p) => p.category === 'transport' },
  { id: 'nature',     icon: '/icons/icons8-forest-48.png',     label: 'Naturaleza',  color: '#2ea86e',
    match: (p) => p.category === 'nature' },
  { id: 'hiking',     icon: '/icons/icons8-hiking-48.png',     label: 'Senderos',    color: '#2a9e60',
    match: (p) => p.category === 'hiking' },
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
  /** ViewBox ajustado al bounding box real de la isla (sin margen cuadrado extra) */
  initVb?: ViewBox;
  /** Dimensiones del ViewBox para desktop (x/y se calculan dinámicamente centrados en el área visible) */
  initVbDesktop?: { w: number; h: number };
}> = {
  'gran-canaria': {
    path: 'M 350.33 142.67 L 355.75 147.88 L 369.29 154.39 L 372 159.61 L 369.29 171.33 L 363.87 185.67 L 361.17 198.7 L 372 211.73 L 372 216.94 L 363.87 220.85 L 358.46 227.36 L 350.33 244.3 L 358.46 254.73 L 361.17 269.06 L 361.17 280.79 L 347.62 286 L 339.5 291.21 L 315.12 318.58 L 304.28 327.7 L 250.11 343.33 L 241.98 347.24 L 239.28 347.24 L 220.31 368.09 L 209.48 372 L 201.35 368.09 L 195.94 362.88 L 187.81 358.97 L 155.31 357.67 L 141.76 353.76 L 128.22 348.55 L 87.59 317.27 L 82.17 309.45 L 79.46 304.24 L 63.21 296.42 L 57.8 291.21 L 55.09 287.3 L 30.71 243 L 28 227.36 L 30.71 211.73 L 28 202.61 L 28 190.88 L 28 179.15 L 30.71 170.03 L 38.83 162.21 L 68.63 147.88 L 82.17 138.76 L 98.43 123.12 L 111.97 103.58 L 109.26 85.33 L 117.39 77.52 L 120.09 64.48 L 117.39 48.85 L 114.68 37.12 L 122.8 37.12 L 130.93 37.12 L 139.06 38.42 L 144.47 42.33 L 155.31 39.73 L 195.94 52.76 L 252.82 52.76 L 298.87 63.18 L 317.83 57.97 L 315.12 31.91 L 336.79 28 L 339.5 29.3 L 344.91 39.73 L 344.91 44.94 L 336.79 47.55 L 331.37 57.97 L 334.08 78.82 L 336.79 108.79 L 339.5 114 L 342.2 123.12 L 344.91 133.55 L 350.33 142.67 Z',
    fill: '#fdfdfc',
    stroke: '#f5c518',
    viewBox: '-60 -240 520 520',
    label: 'Gran Canaria',
  },
  tenerife: {
    // Path trazado desde silueta PNG real (1255×1024 px) con OpenCV + Douglas-Peucker + Catmull-Rom→Bézier.
    // Transformación afín calibrada con 3 puntos geográficos:
    //   Punta de Anaga (28.578°N, 16.148°W), Punta de Teno (28.345°N, 16.917°W), Punta de la Rasca (27.985°N, 16.574°W)
    // Sistema de coordenadas: espacio SVG 400×400 (ISLAND_BOUNDS calibrados a estos valores)
    // Path trazado desde isla-tenerife.png con OpenCV + Douglas-Peucker + Catmull-Rom→Bézier (54 puntos).
    path: 'M 372.7,53.2 C 370.4,50.9 366.8,50.4 362.1,51.7 C 357.4,53.0 342.1,61.7 337.7,63.2 C 333.3,64.7 332.8,63.9 329.2,63.2 C 325.6,62.5 315.9,58.7 310.7,57.9 C 305.5,57.1 294.3,55.9 290.4,57.3 C 286.5,58.7 284.6,66.3 281.3,68.2 C 278.0,70.1 268.7,70.5 265.5,71.7 C 262.3,72.9 259.1,75.3 257.0,77.3 C 254.9,79.3 251.2,83.4 249.6,86.4 C 248.0,89.4 248.6,94.6 244.9,99.6 C 241.2,104.6 227.4,118.8 222.0,123.7 C 216.6,128.6 208.9,134.4 204.4,136.3 C 199.9,138.2 192.6,136.3 188.0,138.0 C 183.4,139.7 176.7,147.9 169.8,149.2 C 162.9,150.5 142.7,147.2 136.0,148.0 C 129.3,148.8 124.3,153.7 119.2,155.4 C 114.1,157.1 103.2,159.9 97.5,160.4 C 91.8,160.9 81.8,160.2 76.7,158.9 C 71.6,157.6 66.7,149.2 59.3,150.4 C 51.9,151.6 26.4,164.6 21.2,167.7 C 16.0,170.8 18.8,171.7 20.6,173.9 C 22.4,176.1 29.9,179.1 34.7,184.1 C 39.5,189.1 53.3,206.8 56.4,211.5 C 59.5,216.2 58.3,216.9 58.2,219.7 C 58.1,222.5 55.5,229.5 55.5,232.3 C 55.5,235.1 54.3,233.8 57.9,240.8 C 61.5,247.8 76.6,276.4 82.5,284.9 C 88.4,293.4 99.2,300.0 102.2,304.5 C 105.2,309.0 103.1,315.6 104.9,318.6 C 106.7,321.6 114.0,323.8 115.4,326.9 C 116.8,330.0 115.3,339.5 115.7,342.1 C 116.1,344.7 116.5,345.4 118.1,346.2 C 119.7,347.0 124.0,348.3 127.8,348.0 C 131.6,347.7 141.9,345.7 146.9,343.9 C 151.9,342.1 160.4,335.9 165.6,334.5 C 170.8,333.1 180.0,337.0 186.2,333.3 C 192.4,329.6 204.6,315.0 212.0,306.6 C 219.4,298.2 237.1,278.6 241.4,270.5 C 245.7,262.4 242.0,253.5 244.6,245.5 C 247.2,237.5 257.0,217.6 260.8,210.6 C 264.6,203.6 271.4,196.3 273.1,193.0 C 274.8,189.7 274.3,188.9 273.7,185.9 C 273.1,182.9 268.4,173.8 268.4,170.3 C 268.4,166.8 271.6,162.3 273.4,159.5 C 275.2,156.7 278.9,151.5 282.2,149.2 C 285.5,146.9 292.8,146.1 298.1,141.9 C 303.4,137.7 318.5,122.3 322.2,117.8 C 325.9,113.3 324.8,109.9 326.0,107.8 C 327.2,105.7 328.3,103.6 331.3,101.9 C 334.3,100.2 345.7,96.4 348.6,94.9 C 351.5,93.4 349.4,92.5 352.7,90.5 C 356.0,88.5 369.6,83.1 373.2,80.2 C 376.8,77.3 379.8,72.6 379.7,69.0 C 379.6,65.4 375.0,55.5 372.7,53.2 Z',
    fill: '#fdfdfc',
    stroke: '#f5c518',
    viewBox: '-60 -200 520 520',
    label: 'Tenerife',
    // Bounding box real: x=[16,380] y=[50,348] → 364×298. 5px padding cada lado.
    initVb: { x: 11, y: 45, w: 374, h: 308 },
    // Desktop: viewBox más amplio → la isla aparece más pequeña y con aire. x/y se calculan en compute().
    initVbDesktop: { w: 620, h: 510 },
  },
};


const CATEGORY_COLORS: Record<POI['category'], string> = {
  nature:    '#2ea86e',
  beach:     '#2090c0',
  culture:   '#6e42b8',
  hiking:    '#2a9e60',
  viewpoint: '#c47a18',
  food:      '#c44038',
  other:     '#5a7a90',
  transport: '#f59e0b',
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
  // En top filter, los POIs de actividades (GYG o categorías secundarias) usan el degradado naranja
  const isActivityPoi = poi.gygTourId || ACTIVITIES_CATS.includes(poi.category);
  const strokeGradId = (showCategoryIcon && isActivityPoi)
    ? 'poiGradient-activities'
    : `poiGradient-${poi.category}`;
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
      <circle cx={x} cy={cy} r={R + 2} fill={selected ? color : ((showImage || showCategoryIcon) ? shadeColor(color, 0.82) : '#ffffff')} stroke={`url(#${strokeGradId})`} strokeWidth="2.5" />
      {showImage && imageReady && (
        <image
          href={markerThumb(poi.images.hero)}
          x={x - R} y={cy - R}
          width={R * 2} height={R * 2}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
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
  photoCreditsBySlug?: Record<string, PhotoCreditGroup[]>;
}

export function IslandMap({ locale, poisByIsland, sectionsByIsland, municipiosByIsland, initialIsland = 'gran-canaria', initialFilter, islandName, showLanguageSwitcher = true, photoCreditsBySlug }: IslandMapProps) {
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
  const [filterBarBottom, setFilterBarBottom] = useState(0);
  const mapCenterYRef = useRef(SVG_CENTER);
  /** ViewBox mínimo (zoom máximo hacia fuera): calculado dinámicamente en compute() */
  const minVbRef = useRef<ViewBox | undefined>(undefined);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // ── Zoom / Pan ─────────────────────────────────────────────────────────────
  const [vb, setVb] = useState<ViewBox>(() => ISLAND_CONFIGS[activeIsland].initVb ?? getInitialVb());
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

  // Calcula mapCenterY para centrar la isla en el área visible (entre filter bar y name bar)
  useEffect(() => {
    const compute = () => {
      const filterBar = filterBarRef.current;
      if (!filterBar) return;

      const fbBottom = filterBar.getBoundingClientRect().bottom;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isDesktop = mapMaxSize === DESKTOP_MAX_SIZE;

      setFilterBarBottom(fbBottom);

      if (isDesktop) {
        // SVG ocupa el shell completo (top:0, bottom:0, height=vh).
        // Con xMidYMid meet: rendered content size = min(vw, vh); offsetY = (vh-rdSize)/2.
        const rdSize = Math.min(vw, vh);
        const offY = (vh - rdSize) / 2;
        // Centro del área visible (entre filter bar y name bar) en pixels de pantalla:
        const visibleCenter = fbBottom + (vh - ISLAND_BAR_H - fbBottom) / 2;
        // Queremos que SVG_CENTER (centro de la isla) aparezca en visibleCenter.
        // Fórmula: mapCenterYRef = SVG_CENTER + mapMaxSize/2 - (visibleCenter - offY) * maxSize / rdSize
        mapCenterYRef.current = SVG_CENTER + mapMaxSize / 2
          - (visibleCenter - offY) * mapMaxSize / rdSize;

        // minVb: ViewBox inicial desktop — dimensiones de initVbDesktop centradas en mapCenterYRef
        const cfg = ISLAND_CONFIGS[activeIsland];
        if (cfg.initVbDesktop) {
          const { w, h } = cfg.initVbDesktop;
          minVbRef.current = {
            x: SVG_CENTER - w / 2,
            y: mapCenterYRef.current - h / 2,
            w,
            h,
          };
        } else {
          minVbRef.current = undefined;
        }
        return;
      }

      // Área real del SVG (móvil): desde fbBottom hasta encima del name bar
      // El wrapper SVG ya está recortado → el área SVG ES el área visible.
      const svgH = vh - fbBottom - ISLAND_BAR_H;

      // Misma fórmula que desktop: centrar la isla en el área visible.
      // En móvil: visibleCenter = centro del SVG = svgH / 2
      const rdSize = Math.min(vw, svgH);
      const offY = (svgH - rdSize) / 2;
      const visibleCenter = svgH / 2;
      mapCenterYRef.current = SVG_CENTER + mapMaxSize / 2
        - (visibleCenter - offY) * mapMaxSize / rdSize;

      // minVb móvil: initVb de la isla (si existe) o undefined (usa getInitialVb)
      minVbRef.current = ISLAND_CONFIGS[activeIsland].initVb;
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
  // minVbRef.current ya fue actualizado por compute() que corre antes que este effect
  useEffect(() => {
    setVb(minVbRef.current ?? getInitialVb(mapMaxSize, mapCenterYRef.current));
  }, [activeIsland, mapMaxSize]);


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
          return clampVb(candidate, mapMaxSize, mapCenterYRef.current, minVbRef.current);
        });

        // Pan simultáneo mientras se hace pinch
        const lastMid = touchMid(ts.lastTouches[0], ts.lastTouches[1]);
        const dxScreen = mid.x - lastMid.x;
        const dyScreen = mid.y - lastMid.y;
        setVb(prev => clampVb({
          ...prev,
          x: prev.x - dxScreen / rect.width  * prev.w,
          y: prev.y - dyScreen / rect.height * prev.h,
        }, mapMaxSize, mapCenterYRef.current, minVbRef.current));

        touchState.current = { type: 'pinch', lastTouches: [t0, t1], lastDist: newDist };

      } else if (ts.type === 'pan' && e.touches.length === 1) {
        const t = e.touches[0];
        const prev0 = ts.lastTouches[0];
        const dx = (t.clientX - prev0.clientX) / rect.width  * vb.w;
        const dy = (t.clientY - prev0.clientY) / rect.height * vb.h;
        setVb(prev => clampVb({ ...prev, x: prev.x - dx, y: prev.y - dy }, mapMaxSize, mapCenterYRef.current, minVbRef.current));
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

  const CATEGORY_CHIP_IDS = ['beach', 'hiking', 'culture', 'nature', 'activities', 'transport'];
  const activeCategoryChip = activeFilter && CATEGORY_CHIP_IDS.includes(activeFilter)
    ? activeFilter : null;

  // Marcadores de municipio: sin filtro, con "municipios", o con "top" (solo los top)
  const showMunicipioMarkers = !activeFilter || activeFilter === 'municipios' || activeFilter === 'top';
  const municipioMarkers = showMunicipioMarkers
    ? municipios
        .filter(m => activeFilter === 'top' ? !!m.top : true)
        .map(m => ({
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
      backgroundColor: '#eef4f8',
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
              src="/logo/file.png"
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

      {/* SVG mapa — en móvil limitado al área visible; en desktop ocupa el shell completo */}
      <div style={{
        position: 'absolute',
        top: mapMaxSize === MOBILE_MAX_SIZE ? filterBarBottom : 0,
        left: 0,
        right: 0,
        bottom: mapMaxSize === MOBILE_MAX_SIZE && islandName && !selectedPoi ? ISLAND_BAR_H : 0,
      }}>
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
            return clampVb(candidate, mapMaxSize, mapCenterYRef.current, minVbRef.current);
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
          {/* Degradado actividades (GYG + viewpoint/food/other) — usado en top filter */}
          <linearGradient id="poiGradient-activities" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={shadeColor('#ff5533', 0.45)} />
            <stop offset="50%"  stopColor="#ff5533" />
            <stop offset="100%" stopColor={shadeColor('#ff5533', -0.35)} />
          </linearGradient>
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
      </div>{/* /SVG wrapper — área visible entre filter bar y name bar */}

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
            border: '1.5px solid #000000',
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
                    background: isActive ? '#1f9d61' : 'rgba(0,0,0,0.04)',
                    color: isActive ? 'white' : '#374151',
                    border: 'none',
                    fontSize: '14px', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive
                      ? '0 2px 8px rgba(31,157,97,0.4)'
                      : 'inset 0 2px 4px rgba(0,0,0,0.14), inset 0 1px 2px rgba(0,0,0,0.10)',
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
            { id: 'activities', icon: '/icons/icons8-activities-48.png', label: t.chips.activities, color: '#ff5533' },
            { id: 'hiking',     icon: '/icons/icons8-hiking-48.png',     label: t.chips.hiking,     color: '#2a9e60' },
            { id: 'transport',  icon: '/icons/icons8-car-53.png',        label: t.chips.transport,  color: '#f59e0b' },
            { id: 'culture',    icon: '/icons/icons8-museum-64.png',     label: t.chips.culture,    color: '#6e42b8' },
            { id: 'nature',     icon: '/icons/icons8-forest-48.png',     label: t.chips.nature,     color: '#2ea86e' },
          ] as const).map(chip => {
            const isActive = activeFilter === chip.id;
            const grad = `linear-gradient(135deg, ${shadeColor(chip.color, 0.45)}, ${chip.color}, ${shadeColor(chip.color, -0.35)})`;
            return (
              /* Wrapper con borde degradado (1px padding + fondo sólido interior) */
              <div
                key={chip.id}
                style={{
                  background: grad,
                  borderRadius: '21px',
                  padding: '1px',
                  boxShadow: isActive
                    ? `0 3px 10px ${chip.color}55`
                    : '0 1px 3px rgba(0,0,0,0.08)',
                  flexShrink: 0,
                }}
              >
                <button
                  onPointerUp={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleFilterToggle(chip.id);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 13px', borderRadius: '20px',
                    background: isActive ? grad : '#ffffff',
                    color: isActive ? 'white' : '#4b5563',
                    border: 'none',
                    fontSize: '11px', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.18s',
                    backdropFilter: isActive ? 'none' : 'blur(4px)',
                    whiteSpace: 'nowrap',
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
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* Nombre isla — barra inferior */}
      {islandName && !selectedPoi && (
        <>
          {/* ClipPath de olas — objectBoundingBox: coords relativas al elemento (0–1) */}
          <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
            <defs>
              <clipPath id="islandBarWave" clipPathUnits="objectBoundingBox">
                <path d="M 0,1 L 0,0.24 Q 0.071,0.04 0.143,0.24 Q 0.214,0.44 0.286,0.24 Q 0.357,0.04 0.429,0.24 Q 0.500,0.44 0.571,0.24 Q 0.643,0.04 0.714,0.24 Q 0.786,0.44 0.857,0.24 Q 0.929,0.04 1.000,0.24 L 1,1 Z" />
              </clipPath>
            </defs>
          </svg>

          <div style={{
            position: 'fixed',
            bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% + 80px)',
            maxWidth: 'calc(min(900px, 100vw) + 80px)',
            zIndex: 10,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 -6px 18px rgba(0,0,0,0.30))',
          }}>
            <div style={{
              backgroundImage: 'url(/images/arena-negra.avif)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              clipPath: 'url(#islandBarWave)',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              minHeight: '110px',
              height: '110px',
              paddingBottom: '18px',
            }}>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '26px',
                fontWeight: '700',
                letterSpacing: '0.12em',
                color: 'white',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                textTransform: 'uppercase',
              }}>
                {islandName}
              </span>
            </div>
          </div>
        </>
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
          photoCreditGroups={photoCreditsBySlug?.[selectedPoi.slug]}
        />
      )}

      {/* Cart panel */}
      <CartPanel cart={cart} isOpen={cartOpen} onClose={() => setCartOpen(false)} locale={locale} />

    </div>
  );
}
