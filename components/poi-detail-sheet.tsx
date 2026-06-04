'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { POI, Locale } from '@/lib/types';
import type { CartState } from '@/hooks/use-cart';

const CATEGORY_COLORS: Record<POI['category'], string> = {
  nature:    '#16a34a',
  beach:     '#0ea5e9',
  culture:   '#7c3aed',
  hiking:    '#16a34a',
  viewpoint: '#f59e0b',
  food:      '#ef4444',
  other:     '#6b7280',
};

const CATEGORY_LABELS: Record<POI['category'], string> = {
  nature:    'Naturaleza',
  beach:     'Playa',
  culture:   'Cultura',
  hiking:    'Senderismo',
  viewpoint: 'Mirador',
  food:      'Gastronomía',
  other:     'Lugar',
};

function hasCoordinates(poi: POI): poi is POI & { coordinates: NonNullable<POI['coordinates']> } {
  return (
    typeof poi.coordinates?.lat === 'number' &&
    Number.isFinite(poi.coordinates.lat) &&
    typeof poi.coordinates?.lng === 'number' &&
    Number.isFinite(poi.coordinates.lng)
  );
}

function RichText({ html }: { html: string }) {
  return (
    <div
      className="rich-poi-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Scroll fade hint ─────────────────────────────────────────────────────────
function ScrollFade() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: '48px',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%)',
      pointerEvents: 'none',
      zIndex: 2,
    }} />
  );
}

// ── Expandable description ───────────────────────────────────────────────────
const COLLAPSED_LINES = 4;

function ExpandableDescription({ html, color }: { html: string; color: string }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExpanded(false);
  }, [html]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Comprueba si el contenido es más alto que las líneas colapsadas
    setClamped(el.scrollHeight > el.clientHeight + 2);
  }, [html, expanded]);

  return (
    <div>
      <div
        ref={ref}
        className="rich-poi-text"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: expanded ? 'unset' : COLLAPSED_LINES,
          overflow: 'hidden',
          transition: 'all 0.25s ease',
        } as React.CSSProperties}
      />
      {(clamped || expanded) && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'none', border: 'none', padding: '4px 0 0',
            cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            color, fontFamily: "'JetBrains Mono', monospace",
            display: 'block',
          }}
        >
          {expanded ? 'ver menos' : '... ver más'}
        </button>
      )}
    </div>
  );
}

// ── Story Bubbles ────────────────────────────────────────────────────────────
interface StoryBubblesProps {
  pois: POI[];
  activePoi: POI;
  onSelect: (poi: POI) => void;
  compact?: boolean;
}

function StoryBubbles({ pois, activePoi, onSelect, compact }: StoryBubblesProps) {
  const size = compact ? 44 : 64;
  return (
    <div style={{
      display: 'flex', gap: compact ? '8px' : '12px', overflowX: 'auto',
      padding: compact ? '6px 14px 4px' : '10px 14px 6px', scrollbarWidth: 'none',
    }}>
      {pois.map((poi) => {
        const isActive = poi.slug === activePoi.slug;
        const ringColor = CATEGORY_COLORS[poi.category];
        return (
          <button
            key={poi.slug}
            onClick={() => onSelect(poi)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
            }}
          >
            <div style={{
              width: size, height: size, borderRadius: '50%',
              padding: isActive ? 3 : 2,
              background: ringColor,
              opacity: isActive ? 1 : 0.55,
              boxShadow: isActive
                ? `0 10px 24px -8px ${ringColor}88, 0 0 0 3px ${ringColor}22`
                : 'none',
              transform: isActive ? 'translateY(-2px) scale(1.06)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                overflow: 'hidden', border: '2.5px solid white',
                background: ringColor + '33',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: compact ? '16px' : '24px',
              }}>
                <img
                  src={poi.images.hero}
                  alt={poi.name}
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              {/* Badge numérico */}
              <span style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: compact ? 16 : 20, height: compact ? 16 : 20,
                borderRadius: '50%',
                background: isActive ? ringColor : 'white',
                border: `2px solid ${ringColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: compact ? '8px' : '10px',
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                color: isActive ? 'white' : ringColor,
                lineHeight: 1,
              }}>
                {pois.indexOf(poi) + 1}
              </span>
            </div>
            <span style={{
              fontSize: compact ? '9px' : '10px', fontFamily: "'JetBrains Mono', monospace",
              color: isActive ? '#0f172a' : '#94a3b8',
              textAlign: 'center', maxWidth: `${size}px`, lineHeight: 1.2,
              fontWeight: isActive ? 700 : 400, transition: 'color 0.15s',
            }}>
              {poi.name.length > 10 ? poi.name.slice(0, 9) + '…' : poi.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Photo Gallery ────────────────────────────────────────────────────────────
interface PhotoGalleryProps {
  poi: POI;
  color: string;
}

function PhotoGallery({ poi, color }: PhotoGalleryProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // Guarda la src anterior para mantenerla visible durante el crossfade
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const photos = [poi.images.hero, ...poi.images.gallery].filter(Boolean);

  // Reset completo al cambiar de POI
  useEffect(() => {
    setActivePhoto(0);
    setHasError(false);
    setIsLoaded(false);
    setPrevSrc(null);
  }, [poi.slug]);

  // Al cambiar foto, comprueba caché
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    const id = requestAnimationFrame(() => {
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
        setPrevSrc(null);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [poi.slug, activePhoto]);

  // Navega guardando la foto actual como fondo para el crossfade
  const goTo = (idx: number) => {
    if (idx === activePhoto || idx < 0 || idx >= photos.length) return;
    setPrevSrc(photos[activePhoto]);
    setActivePhoto(idx);
  };

  const showFallback = hasError || photos.length === 0;

  return (
    <div style={{
      margin: 0, borderRadius: 0, overflow: 'hidden',
      height: '100%', position: 'relative',
      background: '#e2e8f0',   // fondo neutro, sin color de categoría
      flexShrink: 0,
    }}>
      {/* Shimmer — solo en la primera carga (sin foto anterior) */}
      {!showFallback && !isLoaded && !prevSrc && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, ${color}22 25%, ${color}44 50%, ${color}22 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
        }} />
      )}

      {/* Emoji fallback */}
      {showFallback && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '64px', pointerEvents: 'none',
        }}>
          {poi.emoji ?? '📍'}
        </div>
      )}

      {/* Foto anterior — permanece visible hasta que la nueva esté lista */}
      {prevSrc && !isLoaded && (
        <img
          src={prevSrc}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
          }}
        />
      )}

      {/* Foto activa — hace crossfade sobre la anterior */}
      {!showFallback && (
        <img
          ref={imgRef}
          key={`${poi.slug}-${activePhoto}`}
          src={photos[activePhoto]}
          alt={poi.name}
          decoding="async"
          fetchPriority="high"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
          onLoad={() => { setIsLoaded(true); setPrevSrc(null); }}
          onError={() => setHasError(true)}
        />
      )}

      {/* Indicadores */}
      {photos.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '7px',
          pointerEvents: 'none',
        }}>
          {photos.map((_, i) => (
            <div key={i} style={{
              width: i === activePhoto ? 10 : 7,
              height: i === activePhoto ? 10 : 7,
              borderRadius: '50%',
              background: i === activePhoto ? 'white' : 'rgba(255,255,255,0.45)',
              border: i === activePhoto ? '2px solid rgba(255,255,255,0.9)' : '1.5px solid rgba(255,255,255,0.3)',
              boxShadow: i === activePhoto ? '0 1px 6px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.22s ease',
            }} />
          ))}
        </div>
      )}

      {/* Flechas */}
      {activePhoto > 0 && (
        <button onClick={() => goTo(activePhoto - 1)} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '14px',
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      {activePhoto < photos.length - 1 && (
        <button onClick={() => goTo(activePhoto + 1)} style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '14px',
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function TranscriptPanel({ html, color }: { html: string; color: string }) {
  return (
    <div style={{
      margin: '4px 12px 0',
      borderRadius: '18px',
      height: 220,
      overflowY: 'auto',
      background: '#f8fafc',
      border: `1px solid ${color}33`,
      padding: '16px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
    }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 800,
        color,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: "'JetBrains Mono', monospace",
        marginBottom: '10px',
      }}>
        Transcripción
      </div>
      <RichText html={html} />
    </div>
  );
}

// ── Main sheet ───────────────────────────────────────────────────────────────
interface PoiDetailSheetProps {
  pois: POI[];
  selectedPoi: POI;
  onPoiChange: (poi: POI) => void;
  onClose: () => void;
  cart: CartState;
  onAddToCart: (poi: POI) => void;
  locale: Locale;
  sectionContext?: {
    label: string;
    emoji: string;
    color: string;
  };
}

export function PoiDetailSheet({
  pois,
  selectedPoi,
  onPoiChange,
  onClose,
  cart,
  onAddToCart,
  locale: _locale,
  sectionContext,
}: PoiDetailSheetProps) {
  const color = CATEGORY_COLORS[selectedPoi.category];
  const inCart = cart.items.some(i => i.slug === selectedPoi.slug);
  const canRoute = hasCoordinates(selectedPoi);
  const [showTranscript, setShowTranscript] = useState(false);

  // Difiere contenido pesado al frame siguiente para no bloquear la animación CSS
  const [contentReady, setContentReady] = useState(false);
  useEffect(() => {
    setContentReady(false);
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setContentReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, [selectedPoi.slug]);

  useEffect(() => {
    setShowTranscript(false);
  }, [selectedPoi.slug]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  const triggerClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => { setIsExiting(false); onClose(); }, 260);
  }, [onClose]);

  // Swipe-to-close nativo — sin framer-motion
  const swipeStartRef = useRef<{ y: number; t: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartRef.current = { y: e.touches[0].clientY, t: Date.now() };
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = swipeStartRef.current;
    if (!start) return;
    swipeStartRef.current = null;
    const dy = e.changedTouches[0].clientY - start.y;
    const velocity = dy / Math.max(Date.now() - start.t, 1);
    if (dy > 80 || velocity > 0.5) triggerClose();
  }, [triggerClose]);

  const openMaps = () => {
    if (!canRoute) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${selectedPoi.coordinates.lat},${selectedPoi.coordinates.lng}`,
      '_blank'
    );
  };
  const openDir = () => {
    if (!canRoute) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${selectedPoi.coordinates.lat},${selectedPoi.coordinates.lng}`,
      '_blank'
    );
  };

  return (
    <>
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          top: 0, bottom: 0, left: 0, right: 0,
          background: 'white',
          boxShadow: '0 -6px 40px rgba(0,0,0,0.18)',
          zIndex: 200,
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          willChange: 'transform',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: isExiting
            ? 'sheetDown 0.26s cubic-bezier(0.25,0.46,0.45,0.94) both'
            : 'sheetUp 0.26s cubic-bezier(0.25,0.46,0.45,0.94) both',
        }}
      >
        {/* ── HEADER — fijo, no scrollea ── */}
        <div style={{ flexShrink: 0 }}>
          {/* Drag handle */}
          <div style={{ padding: '12px 0 4px', textAlign: 'center', cursor: 'grab' }}>
            <div style={{ width: 42, height: 4, background: '#e2e8f0', borderRadius: 99, display: 'inline-block' }} />
          </div>

          {/* Contenido diferido — se monta tras el primer frame para no bloquear la animación */}
          {contentReady && sectionContext && (
            <div style={{
              padding: '6px 14px 4px',
              borderBottom: `1px solid ${sectionContext.color}22`,
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                color: sectionContext.color,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{sectionContext.emoji}</span>
                <span>{sectionContext.label}</span>
              </div>
            </div>
          )}
          <StoryBubbles pois={pois} activePoi={selectedPoi} onSelect={onPoiChange} />

          {/* Title + close */}
          <div style={{
            padding: '4px 16px 10px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            borderBottom: `1px solid ${color}22`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', padding: '2px 9px', borderRadius: '20px',
                background: color + 'dd', color: 'white',
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                marginBottom: '5px',
              }}>
                {selectedPoi.emoji ?? '📍'} {CATEGORY_LABELS[selectedPoi.category]}
              </span>
              <h2 style={{
                margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a',
                fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.2,
              }}>
                {selectedPoi.name}
              </h2>
            </div>
            <button onClick={triggerClose} style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.08)',
              color: '#374151', cursor: 'pointer', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '2px',
            }}>✕</button>
          </div>
        </div>

        {/* ── FOTO — 40vh, diferida ── */}
        <div style={{
          flexShrink: 0, height: '40vh',
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        }}>
          {contentReady && (showTranscript && selectedPoi.audioTranscript
            ? <TranscriptPanel html={selectedPoi.audioTranscript} color={color} />
            : <PhotoGallery poi={selectedPoi} color={color} />)}
        </div>

        {/* ── TEXTO — flex 1, scroll con fade ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ScrollFade />
          <div
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
            height: '100%',
            overflowY: 'scroll',
            padding: '12px 16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            scrollbarWidth: 'none',
          }}>
          {contentReady && <ExpandableDescription html={selectedPoi.description} color={color} />}


          {contentReady && selectedPoi.audioPreview && (
            <div style={{
              background: '#f8fafc', borderRadius: '14px',
              padding: '10px 12px', border: '1px solid #e2e8f0',
            }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: '#64748b',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace", marginBottom: '6px',
              }}>🎧 Audioguía preview</div>
              <audio controls style={{ width: '100%', height: '36px' }} src={selectedPoi.audioPreview} />
            </div>
          )}
          </div>{/* inner scroll */}
        </div>{/* outer fade wrapper */}

        {/* ── BOTONES — fijos al fondo ── */}
        {(canRoute || selectedPoi.track?.mapsUrl) && (
          <div style={{
            flexShrink: 0,
            padding: '10px 16px 16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', gap: '8px',
            background: 'white',
          }}>

          {/* Botón Ver recorrido — solo para POIs con track */}
          {selectedPoi.track?.mapsUrl && (
            <a
              href={selectedPoi.track.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '13px 10px', borderRadius: '11px',
                background: '#0f172a', color: 'white',
                fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
              }}
            >
              🥾 Ver recorrido
              {selectedPoi.track.distance && (
                <span style={{
                  background: 'rgba(255,255,255,0.15)', padding: '2px 8px',
                  borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                }}>
                  {selectedPoi.track.distance}
                </span>
              )}
              {selectedPoi.track.duration && (
                <span style={{
                  background: 'rgba(255,255,255,0.15)', padding: '2px 8px',
                  borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                }}>
                  {selectedPoi.track.duration}
                </span>
              )}
            </a>
          )}

          {canRoute && <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={openMaps} style={{
              flex: 1, padding: '13px 10px', borderRadius: '11px',
              border: 'none', background: color, color: 'white',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
            }}>🗺️ Abrir Maps</button>
            <button
              onClick={() => onAddToCart(selectedPoi)}
              disabled={inCart || (cart.isFull && !inCart)}
              style={{
                flex: 1, padding: '13px 10px', borderRadius: '11px', border: 'none',
                background: inCart ? '#d1fae5' : cart.isFull ? '#f3f4f6' : '#1f9d61',
                color: inCart ? '#059669' : cart.isFull ? '#9ca3af' : 'white',
                fontWeight: 700, fontSize: '13px',
                cursor: (cart.isFull && !inCart) ? 'not-allowed' : 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'background 0.2s', whiteSpace: 'nowrap',
                boxShadow: inCart || cart.isFull ? 'none' : '0 4px 14px rgba(31,157,97,0.28)',
              }}
            >
              {inCart ? '✓ En tu ruta' : cart.isFull ? `Completa (${cart.count}/4)` : `➕ Mi Ruta · ${cart.count}/4`}
            </button>
          </div>}
          </div>
        )}
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes sheetDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .rich-poi-text {
          color: #374151;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.8;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .rich-poi-text p {
          margin: 0 0 10px;
        }
        .rich-poi-text p:last-child {
          margin-bottom: 0;
        }
        .rich-poi-text strong,
        .rich-poi-text b {
          color: #0f172a;
          font-weight: 800;
        }
        .rich-poi-text em,
        .rich-poi-text i {
          color: #334155;
        }
        .rich-poi-text mark {
          background: #fef3c7;
          color: #92400e;
          border-radius: 4px;
          padding: 0 3px;
        }
        .rich-poi-text a {
          color: #0ea5e9;
          font-weight: 700;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
