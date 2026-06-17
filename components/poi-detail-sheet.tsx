'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { POI, Locale } from '@/lib/types';
import type { CartState } from '@/hooks/use-cart';
import { useUiStrings } from '@/lib/ui-strings';
import { AvailabilityWidget } from '@/components/affiliate/availability-widget';
import { GYG_PARTNER_ID } from '@/lib/affiliates';
import { getCreditForPhoto, PhotoCreditLine } from '@/components/photo-credits-carousel';
import type { PhotoCreditGroup } from '@/lib/image-credits';

const CATEGORY_COLORS: Record<POI['category'], string> = {
  nature: '#2ea86e',
  beach: '#2090c0',
  culture: '#6e42b8',
  hiking: '#2a9e60',
  viewpoint: '#c47a18',
  food: '#c44038',
  other: '#5a7a90',
};

// Color especial para POIs de actividad (con widget de GetYourGuide)
const ACTIVITY_COLOR = '#ff5533';
const ACTIVITY_COLOR_DARK = '#dd431f';

function getPoiColor(poi: POI): string {
  return poi.gygTourId ? ACTIVITY_COLOR : CATEGORY_COLORS[poi.category];
}

const CATEGORY_LABELS: Record<POI['category'], string> = {
  nature: 'Naturaleza',
  beach: 'Playa',
  culture: 'Cultura',
  hiking: 'Senderismo',
  viewpoint: 'Mirador',
  food: 'Gastronomía',
  other: 'Lugar',
};

function hasCoordinates(poi: POI): poi is POI & { coordinates: NonNullable<POI['coordinates']> } {
  return (
    typeof poi.coordinates?.lat === 'number' &&
    Number.isFinite(poi.coordinates.lat) &&
    typeof poi.coordinates?.lng === 'number' &&
    Number.isFinite(poi.coordinates.lng)
  );
}

function parseMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^]*?<\/li>(\n|$))+/g, m => `<ul>${m}</ul>`)
    .split(/\n{2,}/)
    .map(block => {
      const b = block.trim();
      if (!b) return '';
      if (/^<(h[23]|ul|li)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

function RichText({ html }: { html: string }) {
  return (
    <div
      className="rich-poi-text"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(html) }}
    />
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
  const size = compact ? 40 : 56;
  return (
    <div className="story-bubbles-container" style={{
      display: 'flex', flexDirection: 'column', gap: compact ? '8px' : '10px',
      padding: compact ? '0' : '10px 14px 6px', scrollbarWidth: 'none',
      width: '100%', alignItems: 'center',
    }}>
      {pois.map((poi) => {
        const isActive = poi.slug === activePoi.slug;
        const ringColor = getPoiColor(poi);
        return (
          <button
            key={poi.slug}
            onClick={() => onSelect(poi)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none',
              cursor: 'pointer', flexShrink: 0, padding: 0,
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
            {!compact && <span style={{
              fontSize: '13px',
              fontFamily: "'Outfit', sans-serif",
              color: isActive ? '#0f172a' : '#6b7280',
              lineHeight: 1.3,
              fontWeight: isActive ? 700 : 400,
              transition: 'color 0.15s',
              flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {poi.name.length > 10 ? poi.name.slice(0, 9) + '…' : poi.name}
            </span>
      }</button>
      );
      })}
    </div>
  );
}

// ── Photo Gallery ────────────────────────────────────────────────────────────
interface PhotoGalleryProps {
  poi: POI;
  color: string;
  onActivePhotoChange?: (index: number) => void;
}

function PhotoGallery({ poi, color, onActivePhotoChange }: PhotoGalleryProps) {
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

  // Notifica al padre qué foto está activa (para mostrar su crédito)
  useEffect(() => {
    onActivePhotoChange?.(activePhoto);
  }, [activePhoto, onActivePhotoChange]);

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
            <polyline points="15 18 9 12 15 6" />
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
            <polyline points="9 18 15 12 9 6" />
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
  photoCreditGroups?: PhotoCreditGroup[];
}

export function PoiDetailSheet({
  pois,
  selectedPoi,
  onPoiChange,
  onClose,
  cart,
  onAddToCart,
  locale,
  sectionContext,
  photoCreditGroups,
}: PoiDetailSheetProps) {
  const t = useUiStrings(locale);
  const color = getPoiColor(selectedPoi);
  const inCart = cart.items.some(i => i.slug === selectedPoi.slug);
  const canRoute = hasCoordinates(selectedPoi);
  const [showTranscript, setShowTranscript] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

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
    setTextExpanded(false);
    setActivePhotoIndex(0);
  }, [selectedPoi.slug]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
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
    const url = selectedPoi.mapsUrl
      ? selectedPoi.mapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${selectedPoi.coordinates.lat},${selectedPoi.coordinates.lng}`;
    window.open(url, '_blank');
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
        className="poi-sheet"
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
        {/* ── SIDEBAR IZQUIERDO — solo desktop ── */}
        {pois.length > 1 && (
          <div className="bubbles-left-sidebar">
            {pois.map((poi, idx) => {
              const isActive = poi.slug === selectedPoi.slug;
              const ringColor = getPoiColor(poi);
              return (
                <button key={poi.slug} onClick={() => onPoiChange(poi)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '4px 0',
                }}>
                  <div style={{ position: 'relative',
                    width: 64, height: 64, borderRadius: '50%',
                    padding: isActive ? 3 : 2, background: ringColor,
                    opacity: isActive ? 1 : 0.5,
                    boxShadow: isActive ? `0 4px 12px ${ringColor}66` : 'none',
                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid white' }}>
                      <img src={poi.images.hero} alt={poi.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <span style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: isActive ? ringColor : 'white',
                      border: `2px solid ${ringColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 800,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isActive ? 'white' : ringColor, lineHeight: 1,
                    }}>{idx + 1}</span>
                  </div>
                  <span style={{
                    fontSize: '10px', fontFamily: "'Inter', sans-serif",
                    color: isActive ? '#0f172a' : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    maxWidth: '64px', textAlign: 'center',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {poi.name.length > 8 ? poi.name.slice(0, 7) + '…' : poi.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── CONTENIDO PRINCIPAL ── */}
        <div className="sheet-main-content">

        {/* ── HEADER — fijo, no scrollea ── */}
        <div style={{ flexShrink: 0 }}>
          {/* Drag handle */}
          <div style={{ padding: '12px 0 4px', textAlign: 'center', cursor: 'grab' }}>
            <div style={{ width: 42, height: 4, background: '#e2e8f0', borderRadius: 99, display: 'inline-block' }} />
          </div>

          {/* Story bubbles — fila horizontal, solo mobile ── */}
          {pois.length > 1 && (
            <div className="bubbles-top" style={{ scrollbarWidth: 'none' }}>
              {pois.map((poi, idx) => {
                const isActive = poi.slug === selectedPoi.slug;
                const ringColor = getPoiColor(poi);
                return (
                  <button key={poi.slug} onClick={() => onPoiChange(poi)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
                  }}>
                    <div style={{ position: 'relative',
                      width: 72, height: 72, borderRadius: '50%',
                      padding: isActive ? 3 : 2, background: ringColor,
                      opacity: isActive ? 1 : 0.5,
                      boxShadow: isActive ? `0 4px 12px ${ringColor}66` : 'none',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid white' }}>
                        <img src={poi.images.hero} alt={poi.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <span style={{
                        position: 'absolute', bottom: -2, right: -2,
                        width: 20, height: 20, borderRadius: '50%',
                        background: isActive ? ringColor : 'white',
                        border: `2px solid ${ringColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 800,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isActive ? 'white' : ringColor, lineHeight: 1,
                      }}>{idx + 1}</span>
                    </div>
                    <span style={{
                      fontSize: '10px', fontFamily: "'Inter', sans-serif",
                      color: isActive ? '#0f172a' : '#94a3b8', fontWeight: isActive ? 600 : 400,
                      maxWidth: '72px', textAlign: 'center',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {poi.name.length > 8 ? poi.name.slice(0, 7) + '…' : poi.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Contenido diferido */}
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

          {/* Title + close */}
          <div style={{
            padding: '4px 16px 10px',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            borderBottom: `1px solid ${color}22`,
            marginTop: "5px",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a',
                fontFamily: "'Outfit', sans-serif", lineHeight: 1.2,
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

        {/* ── ÁREA PRINCIPAL ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

          {/* Foto — ocupa todo el espacio disponible, sin nada encima */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${color}33, ${color}11)`,
              overflow: selectedPoi.gygTourId ? 'auto' : 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {contentReady && selectedPoi.gygTourId ? (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: 'white' }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{
                    fontSize: '10px', fontWeight: 700, color: '#64748b',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px',
                  }}>{t.sheet.bookExperience}</div>
                  <AvailabilityWidget tourId={selectedPoi.gygTourId} locale={locale} variant="vertical" />
                </div>
              </div>
            ) : (
              contentReady && (showTranscript && selectedPoi.audioTranscript
                ? <TranscriptPanel html={selectedPoi.audioTranscript} color={color} />
                : <PhotoGallery poi={selectedPoi} color={color} onActivePhotoChange={setActivePhotoIndex} />)
            )}
          </div>

          {/* Créditos fotográficos — de la foto activa del carrusel, justo debajo de la foto */}
          {contentReady && photoCreditGroups && (() => {
            const activeCredit = getCreditForPhoto(photoCreditGroups, activePhotoIndex);
            if (!activeCredit) return null;
            return (
              <div style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderTop: `1px solid ${color}14`,
                background: 'white',
              }}>
                <PhotoCreditLine group={activeCredit} locale={locale} />
              </div>
            );
          })()}

          {/* Barra inferior: 80% texto preview + 20% botón LEER */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'stretch',
            borderTop: '1px solid #f1f5f9',
            background: 'white',
            minHeight: 64,
          }}>
            {/* 80% — texto preview */}
            <div style={{
              flex: '0 0 80%',
              padding: '10px 12px 10px 16px',
              display: 'flex', alignItems: 'center',
              overflow: 'hidden',
            }}>
              <p style={{
                margin: 0,
                fontSize: '13px', lineHeight: 1.55, color: '#6b7280',
                fontFamily: "'Outfit', sans-serif",
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical' as const,
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}>
                {contentReady && parseMarkdown(selectedPoi.description).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
              </p>
            </div>

            {/* 20% — botón LEER */}
            <button
              onClick={() => setTextExpanded(true)}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{
                flex: '0 0 20%',
                border: 'none',
                borderLeft: `2px solid ${color}22`,
                background: selectedPoi.gygTourId ? ACTIVITY_COLOR_DARK : color,
                color: 'white',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4,
                fontSize: '10px', fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
                transition: 'opacity 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {t.sheet.read}
            </button>
          </div>

          {/* Panel texto completo — entra desde abajo sobre la foto */}
          <div
            style={{
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              height: '100%',
              transform: textExpanded ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
              background: 'white',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -6px 32px rgba(0,0,0,0.13)',
            }}
          >
            {/* Handle + cerrar */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                flexShrink: 0, padding: '10px 18px 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `1px solid ${color}18`,
              }}
            >
              <div style={{ width: 36, height: 4, background: '#e2e8f0', borderRadius: 99 }} />
              <button
                onClick={() => setTextExpanded(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#f1f5f9', border: 'none', borderRadius: 20,
                  padding: '6px 14px', cursor: 'pointer',
                  fontSize: '11px', fontWeight: 700, color: '#374151',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                {t.sheet.close}
              </button>
            </div>

            {/* Texto scrollable */}
            <div
              ref={(el) => setScrollEl(el)}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{
                flex: 1, overflowY: 'scroll', scrollbarWidth: 'none',
                padding: '16px 18px 24px',
              }}
            >
              {contentReady && (
                <div style={{ fontSize: '15px', lineHeight: 1.72, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>
                  <RichText html={selectedPoi.description} />
                </div>
              )}
              {contentReady && selectedPoi.audioPreview && (
                <div style={{
                  marginTop: '16px', background: '#f8fafc', borderRadius: '14px',
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
            </div>
          </div>
        </div>

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
                className="poi-btn-track"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', padding: '13px 10px', borderRadius: '11px',
                  background: '#fcb800', color: 'white',
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
                }}
              >
                <img src="/icons/icons8-track-order-64.png" alt="" style={{ width: '20px', height: '22px', objectFit: 'contain' }} />
                {t.sheet.viewTrail}
                {selectedPoi.track.distance && (
                  <span style={{
                    background: '#facc50', padding: '2px 8px',
                    borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    color:"black",
                    border:"1px dotted black"
                  }}>
                    {selectedPoi.track.distance}
                  </span>
                )}
              </a>
            )}

            {canRoute && <div style={{ display: 'flex', gap: '10px' }}>
              {selectedPoi.gygTourId ? (
                <a
                  href={selectedPoi.gygUrl ?? `https://www.getyourguide.com/-t${selectedPoi.gygTourId}/?partner_id=${GYG_PARTNER_ID}`}
                  target="_blank"
                  rel="sponsored noopener"
                  className="poi-btn"
                  style={{
                    flex: 1, padding: '12px', borderRadius: '14px',
                    border: 'none', background: color, color: 'white',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: `0 4px 14px ${color}55`,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                  🎟️ {t.sheet.book}
                </a>
              ) : (
                <>
                  <button onClick={openMaps} className="poi-btn" style={{
                    flex: 1, padding: '12px', borderRadius: '14px',
                    border: 'none', background: color, color: 'white',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: `0 4px 14px ${color}55`,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    <img src="/icons/icons8-location-48.png" alt="" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                    {t.sheet.openMaps}
                  </button>
                  <button
                    onClick={() => onAddToCart(selectedPoi)}
                    disabled={inCart}
                    className="poi-btn"
                    style={{
                      flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
                      background: inCart ? '#d1fae5' : '#1f9d61',
                      color: inCart ? '#059669' : 'white',
                      fontWeight: 700, fontSize: '12px',
                      cursor: inCart ? 'default' : 'pointer',
                      fontFamily: "'JetBrains Mono', monospace",
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'background 0.2s',
                      boxShadow: inCart ? 'none' : '0 4px 14px rgba(31,157,97,0.28)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}
                  >
                    {inCart
                      ? t.sheet.inRoute
                      : <><span style={{ fontSize: '18px', lineHeight: 1, fontWeight: 800 }}>+</span>{t.sheet.addRoute}<img src="/icons/icons8-car-53.png" alt="" style={{ width: '30px', height: '30px', objectFit: 'contain' }} /></>
                    }
                  </button>
                </>
              )}
            </div>}
          </div>
        )}
        </div>{/* sheet-main-content */}
      </div>
    </>)
}