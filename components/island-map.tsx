'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/use-cart';
import { CartPanel } from './cart-panel';
import { LanguageSwitcher } from './language-switcher';
import { PoiDetailSheet } from './poi-detail-sheet';
import { CategoryBubbleNav } from './category-bubble-nav';
import type { POI, Island, Locale, Section, Municipio } from '@/lib/types';

// ── Pinch-zoom helpers ────────────────────────────────────────────────────────
interface ViewBox { x: number; y: number; w: number; h: number }

const SVG_CENTER = 200;          // centro del contenido (400×400)
const MIN_SIZE   = 80;           // zoom máximo (~5×)
const MAX_SIZE   = 400;          // zoom mínimo = vista original completa

// Vista inicial centrada
const INITIAL_VB: ViewBox = { x: 0, y: 0, w: MAX_SIZE, h: MAX_SIZE };

/** Limita el viewBox para que el mapa no se pierda y se centre al alejarse al máximo */
function clampVb(next: ViewBox): ViewBox {
  const w = Math.min(Math.max(next.w, MIN_SIZE), MAX_SIZE);
  const h = Math.min(Math.max(next.h, MIN_SIZE), MAX_SIZE);

  // Al llegar al zoom mínimo → centrar el mapa
  if (w >= MAX_SIZE) {
    return { x: SVG_CENTER - w / 2, y: SVG_CENTER - h / 2, w, h };
  }

  // Zoom intermedio: evitar salir más del 70% del mapa fuera de pantalla
  const minX = -w * 0.7;
  const maxX =  w * 0.7 + (MAX_SIZE - w);
  const minY = -h * 0.7;
  const maxY =  h * 0.7 + (MAX_SIZE - h);

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
  minDist = 38,
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
  { id: 'beach',      icon: '🏖',  label: 'Playas',      color: '#0ea5e9',
    match: (p) => p.category === 'beach' },
  { id: 'hiking',     icon: '🥾',  label: 'Senderos',    color: '#16a34a',
    match: (p) => p.category === 'hiking' },
  { id: 'culture',    icon: '🏛',  label: 'Cultura',     color: '#7c3aed',
    match: (p) => p.category === 'culture' },
  { id: 'activities', icon: '🎯',  label: 'Actividades', color: '#f59e0b',
    match: (p) => ACTIVITIES_CATS.includes(p.category) },
  { id: 'nature',     icon: '🌿',  label: 'Naturaleza',  color: '#22c55e',
    match: (p) => p.category === 'nature' },
];

const ISLAND_CONFIGS: Record<Island, {
  path: string;
  fill: string;
  stroke: string;
  viewBox: string;
  label: string;
}> = {
  'gran-canaria': {
    path: 'M 350.33 142.67 L 355.75 147.88 L 369.29 154.39 L 372 159.61 L 369.29 171.33 L 363.87 185.67 L 361.17 198.7 L 372 211.73 L 372 216.94 L 363.87 220.85 L 358.46 227.36 L 350.33 244.3 L 358.46 254.73 L 361.17 269.06 L 361.17 280.79 L 347.62 286 L 339.5 291.21 L 315.12 318.58 L 304.28 327.7 L 250.11 343.33 L 241.98 347.24 L 239.28 347.24 L 220.31 368.09 L 209.48 372 L 201.35 368.09 L 195.94 362.88 L 187.81 358.97 L 155.31 357.67 L 141.76 353.76 L 128.22 348.55 L 87.59 317.27 L 82.17 309.45 L 79.46 304.24 L 63.21 296.42 L 57.8 291.21 L 55.09 287.3 L 30.71 243 L 28 227.36 L 30.71 211.73 L 28 202.61 L 28 190.88 L 28 179.15 L 30.71 170.03 L 38.83 162.21 L 68.63 147.88 L 82.17 138.76 L 98.43 123.12 L 111.97 103.58 L 109.26 85.33 L 117.39 77.52 L 120.09 64.48 L 117.39 48.85 L 114.68 37.12 L 122.8 37.12 L 130.93 37.12 L 139.06 38.42 L 144.47 42.33 L 155.31 39.73 L 195.94 52.76 L 252.82 52.76 L 298.87 63.18 L 317.83 57.97 L 315.12 31.91 L 336.79 28 L 339.5 29.3 L 344.91 39.73 L 344.91 44.94 L 336.79 47.55 L 331.37 57.97 L 334.08 78.82 L 336.79 108.79 L 339.5 114 L 342.2 123.12 L 344.91 133.55 L 350.33 142.67 Z',
    fill: '#bff4d2',
    stroke: '#1f9d61',
    viewBox: '0 0 400 400',
    label: 'Gran Canaria',
  },
  tenerife: {
    path: 'M 80,180 C 90,140 115,100 150,75 C 185,50 225,45 265,55 C 305,65 335,90 345,125 C 355,160 340,200 315,225 C 290,250 250,265 210,268 C 170,270 130,258 108,235 C 85,210 72,215 80,180 Z',
    fill: '#fef3c7',
    stroke: '#f59e0b',
    viewBox: '0 0 400 400',
    label: 'Tenerife',
  },
};

const CATEGORY_COLORS: Record<POI['category'], string> = {
  nature: '#16a34a',
  beach: '#0ea5e9',
  culture: '#7c3aed',
  hiking: '#16a34a',
  viewpoint: '#f59e0b',
  food: '#ef4444',
  other: '#6b7280',
};

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
}

function PoiMarker({ poi, island, selected, onClick, displayX, displayY }: PoiMarkerProps) {
  const computed = getPoiPosition(poi, island);
  const x = displayX ?? computed.x;
  const y = displayY ?? computed.y;
  const color = CATEGORY_COLORS[poi.category];
  const R = 14;
  const cy = y - R - 8;
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

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
      onPointerCancel={() => {
        pointerStartRef.current = null;
      }}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      style={{
        cursor: 'pointer',
        transform: selected ? `scale(1.4)` : 'scale(1)',
        transformOrigin: `${x}px ${y}px`,
        transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        touchAction: 'manipulation',
      }}
    >
      {/* Shadow */}
      <ellipse cx={x} cy={y + 3} rx={5} ry={2.5} fill="rgba(15,23,42,0.12)" />
      {/* Pin triangle */}
      <path
        d={`M ${x - 6} ${cy + R} L ${x + 6} ${cy + R} L ${x} ${y} Z`}
        fill={color}
      />
      {/* Circle background */}
      <circle cx={x} cy={cy} r={R + 2} fill={selected ? color : '#ffffff'} stroke={color} strokeWidth="2.5" />
      {/* Emoji label */}
      <text
        x={x}
        y={cy + 5}
        textAnchor="middle"
        fontSize="12"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {poi.emoji ?? '📍'}
      </text>
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
}

function MunicipioMarker({ municipio, island, count, selected, onClick, displayX, displayY }: MunicipioMarkerProps) {
  const computed = coordsToSvg(municipio.coordinates.lat, municipio.coordinates.lng, island);
  const x = displayX ?? computed.x;
  const y = displayY ?? computed.y;
  const R = 16;
  const cy = y - R - 8;
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

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
      }}
    >
      <ellipse cx={x} cy={y + 3} rx={5} ry={2.5} fill="rgba(15,23,42,0.12)" />
      <path d={`M ${x - 6} ${cy + R} L ${x + 6} ${cy + R} L ${x} ${y} Z`} fill="#1f9d61" />
      <circle cx={x} cy={cy} r={R + 2} fill={selected ? '#1f9d61' : '#ffffff'} stroke="#1f9d61" strokeWidth="2.5" />
      <text x={x} y={cy + 5} textAnchor="middle" fontSize="12"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {municipio.emoji ?? '🏘️'}
      </text>
      {/* count badge */}
      <circle cx={x + R - 1} cy={cy - R + 1} r={8} fill="#1f9d61" />
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
      {/* Emoji */}
      <text x={x} y={y + 5} textAnchor="middle" fontSize="15"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {icon}
      </text>
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
  islandName?: string;
  showLanguageSwitcher?: boolean;
}

export function IslandMap({ locale, poisByIsland, sectionsByIsland, municipiosByIsland, initialIsland = 'gran-canaria', islandName, showLanguageSwitcher = true }: IslandMapProps) {
  const [activeIsland, setActiveIsland] = useState<Island>(initialIsland);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
  const [detailPois, setDetailPois] = useState<POI[]>([]);
  const [detailSheetKey, setDetailSheetKey] = useState(0);
  const cart = useCart();

  // ── Zoom / Pan ─────────────────────────────────────────────────────────────
  const [vb, setVb] = useState<ViewBox>(INITIAL_VB);
  const svgRef = useRef<SVGSVGElement>(null);
  const touchState = useRef<{
    type: 'none' | 'pan' | 'pinch';
    lastTouches: Touch[];
    lastDist: number;
  }>({ type: 'none', lastTouches: [], lastDist: 0 });
  // Reset viewBox when island changes
  useEffect(() => { setVb(INITIAL_VB); }, [activeIsland]);

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
          return clampVb(candidate);
        });

        // Pan simultáneo mientras se hace pinch
        const lastMid = touchMid(ts.lastTouches[0], ts.lastTouches[1]);
        const dxScreen = mid.x - lastMid.x;
        const dyScreen = mid.y - lastMid.y;
        setVb(prev => clampVb({
          ...prev,
          x: prev.x - dxScreen / rect.width  * prev.w,
          y: prev.y - dyScreen / rect.height * prev.h,
        }));

        touchState.current = { type: 'pinch', lastTouches: [t0, t1], lastDist: newDist };

      } else if (ts.type === 'pan' && e.touches.length === 1) {
        const t = e.touches[0];
        const prev0 = ts.lastTouches[0];
        const dx = (t.clientX - prev0.clientX) / rect.width  * vb.w;
        const dy = (t.clientY - prev0.clientY) / rect.height * vb.h;
        setVb(prev => clampVb({ ...prev, x: prev.x - dx, y: prev.y - dy }));
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
  }, [activeIsland, vb]);

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
      })).filter(m => m.count > 0)
    : [];

  // Pines individuales (Top / secciones)
  const filteredPois = (() => {
    if (activeFilter === 'top') return mapPois.filter(p => isTopPoi(p));
    if (activeFilter?.startsWith('sec:')) {
      const sectionId = activeFilter.slice(4);
      const section = sections.find(s => s.id === sectionId);
      return section ? mapPois.filter(p => section.pois.includes(p.slug)) : [];
    }
    return [];
  })();

  // Cluster: solo con chip de categoría activo
  const categoryClusters = (() => {
    if (!activeCategoryChip) return [];
    const chip = CHIP_CATEGORIES.find(c => c.id === activeCategoryChip);
    if (!chip) return [];
    const clusterPois = mapPois.filter(p => chip.match(p));
    if (clusterPois.length === 0) return [];
    const pos = getCentroid(clusterPois, activeIsland);
    return [{ ...chip, count: clusterPois.length, x: pos.x, y: pos.y, pois: clusterPois }];
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
    return separateMarkers(all);
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
    setActiveFilter((current) => current === filterId ? null : filterId);
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedPoi(null);
    setActiveSectionId(null);
    setSelectedMunicipio(null);
    setDetailPois([]);
  }, []);

  const handlePoiClick = useCallback((poi: POI) => {
    setActiveSectionId(null);
    setDetailPois(filteredPois.length > 1 ? filteredPois : [poi]);
    setDetailSheetKey((key) => key + 1);
    setSelectedPoi(poi);
  }, [filteredPois]);

  // Tocar un cluster de categoría → abre la sheet con todos los POIs de esa categoría
  const handleClusterClick = useCallback((chipId: string) => {
    const chip = CHIP_CATEGORIES.find(c => c.id === chipId);
    if (!chip) return;
    const pois = mapPois.filter(p => chip.match(p));
    if (pois.length === 0) return;
    setActiveSectionId(null);
    setActiveFilter(chipId);
    setDetailPois(pois);
    setDetailSheetKey(k => k + 1);
    setSelectedPoi(pois[0]);
  }, [mapPois]);

  // Tocar un municipio → abre la sheet con todos sus POIs
  const handleMunicipioClick = useCallback((municipioSlug: string) => {
    const muni = municipios.find(m => m.slug === municipioSlug);
    const mPois = mapPois.filter(p => p.municipio === municipioSlug);
    if (mPois.length === 0) return;

    const allPois = muni
      ? [
          {
            slug: muni.slug,
            name: muni.name,
            description: muni.description ?? muni.name,
            shortDescription: muni.shortDescription ?? '',
            island: activeIsland,
            category: 'culture' as const,
            coordinates: muni.coordinates,
            images: { hero: muni.heroImage ?? '/images/placeholder.avif', gallery: [] },
            hasPremiumAudio: false,
            tags: [],
            emoji: muni.emoji,
            municipio: muni.slug,
          } satisfies POI,
          ...mPois,
        ]
      : mPois;

    setActiveSectionId(null);
    setSelectedMunicipio(municipioSlug);
    setDetailPois(allPois);
    setDetailSheetKey(k => k + 1);
    setSelectedPoi(allPois[0]);
  }, [mapPois, municipios, activeIsland]);

  const handleAddToCart = useCallback((poi: POI) => {
    const result = cart.addPoi(poi);
    showNotification(result.message);
  }, [cart, showNotification]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#e0f2fe' }}>

      {/* Nav fijo — dentro del mapa para acceder al estado del cart */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        padding: '0 12px 0 16px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 130,
      }}>
        {/* Atrás */}
        <a href={`/${locale}`} style={{
          color: '#9ca3af',
          textDecoration: 'none',
          fontSize: '20px',
          lineHeight: 1,
          flexShrink: 0,
        }}>
          ←
        </a>

        {/* Logo + isla */}
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '20px',
          fontWeight: '700',
          color: '#1f9d61',
          flexShrink: 0,
        }}>
          CanaryRoutes
        </span>
        {islandName && (
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '16px',
            color: '#9ca3af',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            · {islandName}
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Botón carrito Mi Ruta */}
        <button
          onClick={() => setCartOpen((v) => !v)}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}
          title="Mi Ruta"
        >
          🗺️
          {cart.count > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#1f9d61',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              lineHeight: 1,
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {cart.count}
            </span>
          )}
        </button>
      </nav>

      {/* SVG mapa — ocupa toda la pantalla, zoom/pan por touch */}
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', userSelect: 'none' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="#cce9f9" />
        <path
          d={islandConfig.path}
          fill={islandConfig.fill}
          stroke={islandConfig.stroke}
          strokeWidth="2"
        />
        {/* Marcadores de municipio */}
        {municipioMarkers.map((m) => (
          <MunicipioMarker
            key={m.slug}
            municipio={m}
            island={activeIsland}
            count={m.count}
            selected={selectedMunicipio === m.slug}
            onClick={() => handleMunicipioClick(m.slug)}
            displayX={adjustedPositions[m.slug]?.x}
            displayY={adjustedPositions[m.slug]?.y}
          />
        ))}
        {/* Pines individuales: Top o sección */}
        {filteredPois.map((poi) => (
          <PoiMarker
            key={poi.slug}
            poi={poi}
            island={activeIsland}
            selected={selectedPoi?.slug === poi.slug}
            onClick={() => handlePoiClick(poi)}
            displayX={adjustedPositions[poi.slug]?.x}
            displayY={adjustedPositions[poi.slug]?.y}
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
      <div style={{
        position: 'fixed',
        top: '64px',
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
            background: 'white',
            borderRadius: '50px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.06)',
            padding: '6px',
            gap: '2px',
          }}>
            {/* Botones de acción */}
            {([
              { id: 'municipios', icon: '🏘️', label: 'Municipios' },
              { id: 'top',        icon: '⭐',  label: 'Top'        },
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
                  <span style={{ fontSize: '15px' }}>{btn.icon}</span>
                  <span>{btn.label}</span>
                </button>
          </div>
          );
            })}
                            <div style={{
              width: 1, alignSelf: 'stretch',
              background: '#e5e7eb',
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

        {/* Fila 2: chips de categoría — carrusel horizontal */}
        <div style={{
          display: 'flex', gap: '7px',
          overflowX: 'auto', scrollbarWidth: 'none',
          padding: '0 12px 4px',
          pointerEvents: 'auto',
        }}>
          {([
            { id: 'beach',      icon: '🏖', label: 'Playas',      color: '#0ea5e9' },
            { id: 'hiking',     icon: '🥾', label: 'Senderos',    color: '#16a34a' },
            { id: 'culture',    icon: '🏛', label: 'Cultura',     color: '#7c3aed' },
            { id: 'activities', icon: '🎯', label: 'Actividades', color: '#f59e0b' },
            { id: 'nature',     icon: '🌿', label: 'Naturaleza',  color: '#22c55e' },
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
                  background: isActive ? chip.color : 'rgba(255,255,255,0.92)',
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
                <span style={{ fontSize: '13px' }}>{chip.icon}</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {chip.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '132px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1f2937',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 300,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {notification}
        </div>
      )}

      {/* Bottom sheet — detalle del POI seleccionado */}
      <AnimatePresence>
        {selectedPoi && (
          <PoiDetailSheet
            key={detailSheetKey}
            pois={detailPois.length ? detailPois : mapPois}
            selectedPoi={selectedPoi}
            onPoiChange={(poi) => setSelectedPoi(poi)}
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
      </AnimatePresence>

      {/* Cart panel */}
      <CartPanel cart={cart} isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Bottom category bubble nav — activo en feature/audioguides */}
      <CategoryBubbleNav
        sections={sections}
        activeSectionId={activeSectionId}
        onSectionSelect={handleSectionSelect}
      />
    </div>
  );
}
