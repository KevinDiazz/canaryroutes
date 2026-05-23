'use client';

import { useState, useRef, useCallback } from 'react';
import type { POI, Municipio } from '@/lib/types';

type Island = 'gran-canaria' | 'tenerife';

// ── Bounds (must match island-map.tsx) ───────────────────────────────────────
const ISLAND_BOUNDS: Record<Island, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  'gran-canaria': { minLat: 27.70, maxLat: 28.20, minLng: -15.85, maxLng: -15.35 },
  'tenerife':     { minLat: 28.00, maxLat: 28.60, minLng: -16.95, maxLng: -16.10 },
};

// ── Island SVG paths (must match island-map.tsx) ─────────────────────────────
const ISLAND_PATHS: Record<Island, { path: string; fill: string; stroke: string }> = {
  'gran-canaria': {
    path: 'M 350.33 142.67 L 355.75 147.88 L 369.29 154.39 L 372 159.61 L 369.29 171.33 L 363.87 185.67 L 361.17 198.7 L 372 211.73 L 372 216.94 L 363.87 220.85 L 358.46 227.36 L 350.33 244.3 L 358.46 254.73 L 361.17 269.06 L 361.17 280.79 L 347.62 286 L 339.5 291.21 L 315.12 318.58 L 304.28 327.7 L 250.11 343.33 L 241.98 347.24 L 239.28 347.24 L 220.31 368.09 L 209.48 372 L 201.35 368.09 L 195.94 362.88 L 187.81 358.97 L 155.31 357.67 L 141.76 353.76 L 128.22 348.55 L 87.59 317.27 L 82.17 309.45 L 79.46 304.24 L 63.21 296.42 L 57.8 291.21 L 55.09 287.3 L 30.71 243 L 28 227.36 L 30.71 211.73 L 28 202.61 L 28 190.88 L 28 179.15 L 30.71 170.03 L 38.83 162.21 L 68.63 147.88 L 82.17 138.76 L 98.43 123.12 L 111.97 103.58 L 109.26 85.33 L 117.39 77.52 L 120.09 64.48 L 117.39 48.85 L 114.68 37.12 L 122.8 37.12 L 130.93 37.12 L 139.06 38.42 L 144.47 42.33 L 155.31 39.73 L 195.94 52.76 L 252.82 52.76 L 298.87 63.18 L 317.83 57.97 L 315.12 31.91 L 336.79 28 L 339.5 29.3 L 344.91 39.73 L 344.91 44.94 L 336.79 47.55 L 331.37 57.97 L 334.08 78.82 L 336.79 108.79 L 339.5 114 L 342.2 123.12 L 344.91 133.55 L 350.33 142.67 Z',
    fill: '#bff4d2',
    stroke: '#1f9d61',
  },
  tenerife: {
    path: 'M 80,180 C 90,140 115,100 150,75 C 185,50 225,45 265,55 C 305,65 335,90 345,125 C 355,160 340,200 315,225 C 290,250 250,265 210,268 C 170,270 130,258 108,235 C 85,210 72,215 80,180 Z',
    fill: '#fef3c7',
    stroke: '#f59e0b',
  },
};

// ── Coordinate helpers ────────────────────────────────────────────────────────
function coordsToSvg(lat: number, lng: number, island: Island) {
  const b = ISLAND_BOUNDS[island];
  const x = ((lng - b.minLng) / (b.maxLng - b.minLng)) * 340 + 30;
  const y = ((b.maxLat - lat) / (b.maxLat - b.minLat)) * 340 + 30;
  return { x, y };
}

function svgToCoords(svgX: number, svgY: number, island: Island) {
  const b = ISLAND_BOUNDS[island];
  const lng = b.minLng + ((svgX - 30) / 340) * (b.maxLng - b.minLng);
  const lat = b.maxLat - ((svgY - 30) / 340) * (b.maxLat - b.minLat);
  return {
    lat: parseFloat(lat.toFixed(5)),
    lng: parseFloat(lng.toFixed(5)),
  };
}

function screenToSvgPoint(svgEl: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Override = { lat: number; lng: number };
type DragTarget = { slug: string; type: 'poi' | 'municipio' };

interface Props {
  gcPois: POI[];
  gcMunicipios: Municipio[];
  tfPois: POI[];
  tfMunicipios: Municipio[];
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MapEditorClient({ gcPois, gcMunicipios, tfPois, tfMunicipios }: Props) {
  const [island, setIsland] = useState<Island>('gran-canaria');
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [dragging, setDragging] = useState<DragTarget | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOnlyMoved, setShowOnlyMoved] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const pois = island === 'gran-canaria' ? gcPois : tfPois;
  const municipios = island === 'gran-canaria' ? gcMunicipios : tfMunicipios;
  const cfg = ISLAND_PATHS[island];

  const getPoiCoords = (p: POI) =>
    overrides[p.slug] ?? p.coordinates ?? { lat: 27.95, lng: -15.59 };

  const getMuniCoords = (m: Municipio) =>
    overrides[m.slug] ?? m.coordinates;

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onMarkerMouseDown = useCallback((e: React.MouseEvent, slug: string, type: 'poi' | 'municipio') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ slug, type });
  }, []);

  const onSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const { x, y } = screenToSvgPoint(svgRef.current, e.clientX, e.clientY);
    const coords = svgToCoords(x, y, island);
    setOverrides(prev => ({ ...prev, [dragging.slug]: coords }));
  }, [dragging, island]);

  const onSvgMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Touch support
  const onMarkerTouchStart = useCallback((e: React.TouchEvent, slug: string, type: 'poi' | 'municipio') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ slug, type });
  }, []);

  const onSvgTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current) return;
    const touch = e.touches[0];
    const { x, y } = screenToSvgPoint(svgRef.current, touch.clientX, touch.clientY);
    const coords = svgToCoords(x, y, island);
    setOverrides(prev => ({ ...prev, [dragging.slug]: coords }));
  }, [dragging, island]);

  const onSvgTouchEnd = useCallback(() => {
    setDragging(null);
  }, []);

  // ── Copy JSON ─────────────────────────────────────────────────────────────
  const changedSlugs = Object.keys(overrides);
  const changedPois = pois.filter(p => overrides[p.slug]);
  const changedMunis = municipios.filter(m => overrides[m.slug]);

  const copyJson = () => {
    const output: Record<string, { lat: number; lng: number }> = {};
    changedSlugs.forEach(slug => { output[slug] = overrides[slug]; });
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetSlug = (slug: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
  };

  const resetAll = () => setOverrides({});

  // ── Render list ───────────────────────────────────────────────────────────
  const displayPois = showOnlyMoved ? changedPois : pois.filter(p => p.coordinates);
  const displayMunis = showOnlyMoved ? changedMunis : municipios;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      background: '#0f172a',
      color: '#f1f5f9',
    }}>

      {/* ── LEFT: Map ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
          background: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#94a3b8' }}>🗺️ MAP EDITOR</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['gran-canaria', 'tenerife'] as Island[]).map(isl => (
              <button
                key={isl}
                onClick={() => setIsland(isl)}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: island === isl ? '#3b82f6' : '#334155',
                  color: island === isl ? 'white' : '#94a3b8',
                }}
              >
                {isl === 'gran-canaria' ? 'Gran Canaria' : 'Tenerife'}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
            Arrastra los marcadores para reposicionar
          </span>
          {changedSlugs.length > 0 && (
            <span style={{
              background: '#f59e0b22', color: '#f59e0b', fontSize: 12, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20,
            }}>
              {changedSlugs.length} cambio{changedSlugs.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* SVG Map */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <svg
            ref={svgRef}
            viewBox="0 0 400 400"
            style={{
              width: '100%', height: '100%', maxWidth: 600, maxHeight: 600,
              cursor: dragging ? 'grabbing' : 'default',
              touchAction: 'none',
              userSelect: 'none',
            }}
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
            onTouchMove={onSvgTouchMove}
            onTouchEnd={onSvgTouchEnd}
          >
            {/* Ocean */}
            <rect x={0} y={0} width={400} height={400} fill="#1e3a5f" />

            {/* Island shape */}
            <path d={cfg.path} fill={cfg.fill} stroke={cfg.stroke} strokeWidth="2" />

            {/* Grid lines (faint) */}
            {[30, 100, 170, 240, 310, 370].map(v => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={400} stroke="#ffffff10" strokeWidth="0.5" />
                <line x1={0} y1={v} x2={400} y2={v} stroke="#ffffff10" strokeWidth="0.5" />
              </g>
            ))}

            {/* Municipality markers */}
            {municipios.map(m => {
              const coords = getMuniCoords(m);
              const { x, y } = coordsToSvg(coords.lat, coords.lng, island);
              const isDragging = dragging?.slug === m.slug;
              const isMoved = !!overrides[m.slug];
              return (
                <g
                  key={m.slug}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'grab' }}
                  onMouseDown={e => onMarkerMouseDown(e, m.slug, 'municipio')}
                  onTouchStart={e => onMarkerTouchStart(e, m.slug, 'municipio')}
                >
                  <circle
                    r={isDragging ? 14 : 11}
                    fill={isMoved ? '#f59e0b' : '#1f9d61'}
                    stroke="white"
                    strokeWidth={isDragging ? 3 : 1.5}
                    opacity={0.95}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isDragging ? 12 : 10}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {m.emoji ?? '📍'}
                  </text>
                  {isMoved && (
                    <circle r={isDragging ? 18 : 15} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.7} />
                  )}
                </g>
              );
            })}

            {/* POI markers */}
            {pois.filter(p => p.coordinates || overrides[p.slug]).map(p => {
              const coords = getPoiCoords(p);
              const { x, y } = coordsToSvg(coords.lat, coords.lng, island);
              const isDragging = dragging?.slug === p.slug;
              const isMoved = !!overrides[p.slug];
              const isTop = !!p.top;
              return (
                <g
                  key={p.slug}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'grab' }}
                  onMouseDown={e => onMarkerMouseDown(e, p.slug, 'poi')}
                  onTouchStart={e => onMarkerTouchStart(e, p.slug, 'poi')}
                >
                  <circle
                    r={isDragging ? 10 : isTop ? 8 : 6}
                    fill={isMoved ? '#f59e0b' : isTop ? '#ef4444' : '#3b82f6'}
                    stroke="white"
                    strokeWidth={isDragging ? 2.5 : 1.5}
                    opacity={0.9}
                  />
                  {isDragging && (
                    <>
                      <line x1={0} y1={-20} x2={0} y2={20} stroke="white" strokeWidth="0.8" opacity={0.6} />
                      <line x1={-20} y1={0} x2={20} y2={0} stroke="white" strokeWidth="0.8" opacity={0.6} />
                    </>
                  )}
                  {isMoved && !isDragging && (
                    <circle r={10} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.7} />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: 16, padding: '8px 16px', background: '#1e293b',
          borderTop: '1px solid #334155', fontSize: 12, color: '#94a3b8', flexShrink: 0,
        }}>
          <span>🟢 Municipio</span>
          <span>🔴 POI Top</span>
          <span>🔵 POI normal</span>
          <span>🟡 Movido</span>
        </div>
      </div>

      {/* ── RIGHT: Changes panel ──────────────────────────────────────── */}
      <div style={{
        width: 360, display: 'flex', flexDirection: 'column',
        background: '#1e293b', borderLeft: '1px solid #334155', overflow: 'hidden',
      }}>

        {/* Panel header */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #334155',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Coordenadas</span>
          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showOnlyMoved}
              onChange={e => setShowOnlyMoved(e.target.checked)}
            />
            Solo movidos
          </label>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

          {displayMunis.length > 0 && (
            <div style={{ padding: '4px 16px 2px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Municipios
            </div>
          )}
          {displayMunis.map(m => {
            const coords = getMuniCoords(m);
            const moved = !!overrides[m.slug];
            return (
              <CoordRow
                key={m.slug}
                slug={m.slug}
                label={`${m.emoji ?? ''} ${m.name}`}
                lat={coords.lat}
                lng={coords.lng}
                moved={moved}
                onReset={moved ? () => resetSlug(m.slug) : undefined}
              />
            );
          })}

          {displayPois.length > 0 && (
            <div style={{ padding: '8px 16px 2px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              POIs
            </div>
          )}
          {displayPois.map(p => {
            const coords = getPoiCoords(p);
            const moved = !!overrides[p.slug];
            return (
              <CoordRow
                key={p.slug}
                slug={p.slug}
                label={`${p.emoji ?? ''} ${p.name}`}
                lat={coords.lat}
                lng={coords.lng}
                moved={moved}
                onReset={moved ? () => resetSlug(p.slug) : undefined}
              />
            );
          })}

          {displayPois.length === 0 && displayMunis.length === 0 && (
            <div style={{ padding: 24, color: '#475569', fontSize: 13, textAlign: 'center' }}>
              {showOnlyMoved ? 'No hay cambios todavía.\nArrastra un marcador para empezar.' : 'No hay POIs con coordenadas.'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          padding: 12, borderTop: '1px solid #334155', display: 'flex', gap: 8, flexShrink: 0,
        }}>
          <button
            onClick={copyJson}
            disabled={changedSlugs.length === 0}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: changedSlugs.length > 0 ? 'pointer' : 'not-allowed',
              background: copied ? '#16a34a' : changedSlugs.length > 0 ? '#3b82f6' : '#334155',
              color: 'white', fontWeight: 700, fontSize: 13,
            }}
          >
            {copied ? '✅ Copiado!' : `📋 Copiar JSON (${changedSlugs.length})`}
          </button>
          {changedSlugs.length > 0 && (
            <button
              onClick={resetAll}
              style={{
                padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#334155', color: '#94a3b8', fontWeight: 600, fontSize: 13,
              }}
            >
              ✕ Reset
            </button>
          )}
        </div>

        {/* Help text */}
        <div style={{ padding: '8px 12px', fontSize: 11, color: '#475569', borderTop: '1px solid #334155', flexShrink: 0 }}>
          Copia el JSON y pégalo en pois.json como{' '}
          <code style={{ background: '#0f172a', padding: '1px 4px', borderRadius: 3 }}>"coordinates": &#123;"lat": x, "lng": y&#125;</code>
        </div>
      </div>
    </div>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────
function CoordRow({
  slug, label, lat, lng, moved, onReset,
}: {
  slug: string;
  label: string;
  lat: number;
  lng: number;
  moved: boolean;
  onReset?: () => void;
}) {
  return (
    <div style={{
      padding: '6px 16px',
      background: moved ? '#f59e0b08' : 'transparent',
      borderLeft: moved ? '3px solid #f59e0b' : '3px solid transparent',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: moved ? 700 : 400,
          color: moved ? '#fbbf24' : '#94a3b8',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      </div>
      {onReset && (
        <button
          onClick={onReset}
          title="Deshacer"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', fontSize: 14, padding: '2px 4px', borderRadius: 4,
            flexShrink: 0,
          }}
        >
          ↩
        </button>
      )}
    </div>
  );
}
