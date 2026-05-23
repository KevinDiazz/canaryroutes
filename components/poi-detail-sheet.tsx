'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
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

// ── Story Bubbles ────────────────────────────────────────────────────────────
interface StoryBubblesProps {
  pois: POI[];
  activePoi: POI;
  onSelect: (poi: POI) => void;
}

function StoryBubbles({ pois, activePoi, onSelect }: StoryBubblesProps) {
  return (
    <div style={{
      display: 'flex', gap: '12px', overflowX: 'auto',
      padding: '10px 14px 6px', scrollbarWidth: 'none',
    }}>
      {pois.map((poi) => {
        const isActive = poi.slug === activePoi.slug;
        const ringColor = CATEGORY_COLORS[poi.category];
        return (
          <button
            key={poi.slug}
            onClick={() => onSelect(poi)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              padding: isActive ? 3 : 2,
              background: ringColor,
              opacity: isActive ? 1 : 0.55,
              boxShadow: isActive
                ? `0 10px 24px -8px ${ringColor}88, 0 0 0 3px ${ringColor}22`
                : 'none',
              transform: isActive ? 'translateY(-3px) scale(1.06)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              position: 'relative',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                overflow: 'hidden', border: '2.5px solid white',
                background: ringColor + '33',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>
                <img
                  src={poi.images.hero}
                  alt={poi.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <span style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: 22, height: 22, borderRadius: '50%',
                background: 'white', border: `2px solid ${ringColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', lineHeight: 1,
              }}>
                {poi.emoji ?? '📍'}
              </span>
            </div>
            <span style={{
              fontSize: '10px', fontFamily: "'JetBrains Mono', monospace",
              color: isActive ? '#0f172a' : '#94a3b8',
              textAlign: 'center', maxWidth: '64px', lineHeight: 1.2,
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

  useEffect(() => {
    setActivePhoto(0);
    setHasError(false);
  }, [poi.slug]);

  const photos = [poi.images.hero, ...poi.images.gallery].filter(Boolean);

  return (
    <div style={{
      margin: '4px 12px 0', borderRadius: '18px', overflow: 'hidden',
      height: 220, position: 'relative',
      background: `linear-gradient(135deg, ${color}44, ${color}22)`,
      flexShrink: 0,
    }}>
      {!hasError && photos.length > 0 && (
        <img
          key={`${poi.slug}-${activePhoto}`}
          src={photos[activePhoto]}
          alt={poi.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            animation: 'storyIn 0.22s ease',
          }}
          onError={() => setHasError(true)}
        />
      )}
      {(hasError || photos.length === 0) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '64px',
        }}>
          {poi.emoji ?? '📍'}
        </div>
      )}

      {/* Gradient */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.82) 100%)',
      }} />

      {/* Photo dots */}
      {photos.length > 1 && (
        <div style={{
          position: 'absolute', top: 12, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', gap: '6px',
        }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActivePhoto(i)}
              style={{
                width: i === activePhoto ? 26 : 20,
                height: i === activePhoto ? 26 : 20,
                borderRadius: '50%',
                border: `2px solid ${i <= activePhoto ? color : 'rgba(255,255,255,0.3)'}`,
                background: i <= activePhoto ? color : 'rgba(0,0,0,0.4)',
                color: 'white', fontSize: '9px', fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{i + 1}</button>
          ))}
        </div>
      )}

      {/* Category + name overlay */}
      <div style={{ position: 'absolute', bottom: 12, left: 14, pointerEvents: 'none' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
          background: color + 'dd', color: 'white',
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
          marginBottom: '6px',
        }}>
          {poi.emoji ?? '📍'} {CATEGORY_LABELS[poi.category]}
        </span>
        <h2 style={{
          margin: 0, fontSize: '22px', fontWeight: 700, color: 'white',
          textShadow: '0 2px 14px rgba(0,0,0,0.85)',
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          lineHeight: 1.2,
        }}>
          {poi.name}
        </h2>
      </div>

      {/* Arrows */}
      {activePhoto > 0 && (
        <button onClick={() => setActivePhoto(p => p - 1)} style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: '20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
      )}
      {activePhoto < photos.length - 1 && (
        <button onClick={() => setActivePhoto(p => p + 1)} style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: '20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
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

  useEffect(() => {
    setShowTranscript(false);
  }, [selectedPoi.slug]);

  // Direct DOM ref — bypasses React render cycle and framer-motion prop handling.
  // We set pointerEvents on the real element the moment close is triggered,
  // so the exit animation runs with the sheet fully transparent to taps.
  const sheetRef = useRef<HTMLDivElement>(null);

  const triggerClose = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.pointerEvents = 'none';
    }
    onClose();
  }, [onClose]);

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
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.02, bottom: 0.45 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 520) triggerClose();
        }}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: 0,
          boxShadow: '0 -6px 40px rgba(0,0,0,0.18)',
          zIndex: 200,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: '12px 0 0', textAlign: 'center', flexShrink: 0, cursor: 'grab' }}>
          <div style={{ width: 42, height: 4, background: '#e2e8f0', borderRadius: 99, display: 'inline-block' }} />
        </div>

        {/* Story bubbles */}
        <div style={{ flexShrink: 0 }}>
          {sectionContext && (
            <div style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              padding: '8px 14px 4px',
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${sectionContext.color}22`,
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: sectionContext.color,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{sectionContext.emoji}</span>
                <span>{sectionContext.label}</span>
              </div>
            </div>
          )}
          <StoryBubbles pois={pois} activePoi={selectedPoi} onSelect={onPoiChange} />
        </div>

        {/* Title + close button */}
        <div style={{
          padding: '4px 16px 12px',
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          flexShrink: 0,
          borderBottom: `1px solid ${color}22`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', padding: '2px 9px', borderRadius: '20px',
              background: color + 'dd', color: 'white',
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              marginBottom: '6px',
            }}>
              {selectedPoi.emoji ?? '📍'} {CATEGORY_LABELS[selectedPoi.category]}
            </span>
            <h2 style={{
              margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              lineHeight: 1.2,
            }}>
              {selectedPoi.name}
            </h2>
          </div>
          <button
            onClick={triggerClose}
            style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.08)',
              color: '#374151', cursor: 'pointer', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '2px',
            }}
          >✕</button>
        </div>

        {/* Scrollable content: description → meta → photos → audio → buttons */}
        <div style={{ padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Description first — fixed height, scrollable if long */}
          <div style={{
            maxHeight: '130px',
            overflowY: 'auto',
            paddingRight: '6px',
            scrollbarWidth: 'thin',
            scrollbarColor: `${color}44 transparent`,
          }}>
            <RichText html={selectedPoi.description} />
          </div>

          {/* Meta chips */}
          {(selectedPoi.visitDuration || selectedPoi.difficulty) && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {selectedPoi.visitDuration && (
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                  background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>⏱ {selectedPoi.visitDuration}</span>
              )}
              {selectedPoi.difficulty && (
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                  background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {selectedPoi.difficulty === 'easy' ? '🟢 Fácil' : selectedPoi.difficulty === 'moderate' ? '🟡 Media' : '🔴 Alta'}
                </span>
              )}
            </div>
          )}

          {/* Photo gallery — after description */}
          <div style={{ margin: '0 -16px' }}>
            {showTranscript && selectedPoi.audioTranscript
              ? <TranscriptPanel html={selectedPoi.audioTranscript} color={color} />
              : <PhotoGallery poi={selectedPoi} color={color} />}
          </div>

          {/* Audio preview */}
          {selectedPoi.audioPreview && (
            <div style={{
              background: '#f8fafc', borderRadius: '14px',
              padding: '12px 14px', border: '1px solid #e2e8f0',
            }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: '#64748b',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace", marginBottom: '8px',
              }}>🎧 Audioguía preview</div>
              <audio controls style={{ width: '100%', height: '40px' }} src={selectedPoi.audioPreview} />
              {selectedPoi.audioTranscript && (
                <button
                  onClick={() => setShowTranscript((value) => !value)}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: `1px solid ${color}33`,
                    background: showTranscript ? color : 'white',
                    color: showTranscript ? 'white' : color,
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {showTranscript ? 'Ver fotos' : 'Ver transcripción'}
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          {canRoute && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={openMaps} style={{
                flex: 1, padding: '10px 12px', borderRadius: '11px',
                border: 'none', background: color, color: 'white',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
              }}>🗺️ Abrir Maps</button>
              <button onClick={openDir} style={{
                flex: 1, padding: '10px 12px', borderRadius: '11px',
                border: '1px solid #e2e8f0', background: 'white', color: '#475569',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap',
              }}>🧭 Cómo llegar</button>
            </div>
          )}

          {/* Add to cart */}
          {canRoute && (
            <button
              onClick={() => onAddToCart(selectedPoi)}
              disabled={inCart || (cart.isFull && !inCart)}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: inCart ? '#d1fae5' : cart.isFull ? '#f3f4f6' : '#1f9d61',
                color: inCart ? '#059669' : cart.isFull ? '#9ca3af' : 'white',
                fontWeight: 700, fontSize: '14px',
                cursor: (cart.isFull && !inCart) ? 'not-allowed' : 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'background 0.2s',
                boxShadow: inCart || cart.isFull ? 'none' : '0 4px 14px rgba(31,157,97,0.28)',
              }}
            >
              {inCart ? '✓ En tu ruta' : cart.isFull ? `Ruta completa (${cart.count}/4)` : `➕ Añadir a Mi Ruta · ${cart.count}/4`}
            </button>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes storyIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        .rich-poi-text {
          color: #475569;
          font-size: 14px;
          line-height: 1.75;
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
