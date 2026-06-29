'use client';
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import type { POI, Locale } from '@/lib/types';
import type { CartState } from '@/hooks/use-cart';
import { useUiStrings } from '@/lib/ui-strings';
import { AvailabilityWidget } from '@/components/affiliate/availability-widget';
import { DiscoverCarsWidget } from '@/components/affiliate/discover-cars-widget';
import { GYG_PARTNER_ID } from '@/lib/affiliates';
import { getCreditForPhoto, PhotoCreditLine } from '@/components/photo-credits-carousel';
import type { PhotoCreditGroup } from '@/lib/image-credits';
import { getRelatedPois } from '@/lib/related-pois';
import type { Island } from '@/lib/types';

const CATEGORY_COLORS: Record<POI['category'], string> = {
  nature: '#2ea86e',
  beach: '#2090c0',
  culture: '#6e42b8',
  hiking: '#2a9e60',
  viewpoint: '#c47a18',
  food: '#c44038',
  transport: '#f59e0b',
  other: '#5a7a90',
};

// Color especial para POIs de actividad (con widget de GetYourGuide)
const ACTIVITY_COLOR = '#ff5533';
const ACTIVITY_COLOR_DARK = '#dd431f';

function getPoiColor(poi: POI): string {
  return poi.gygTourId ? ACTIVITY_COLOR : CATEGORY_COLORS[poi.category];
}

function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * amount)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function ringGradient(color: string): string {
  return `linear-gradient(135deg, ${shadeColor(color, 0.45)}, ${color}, ${shadeColor(color, -0.35)})`;
}

/**
 * Devuelve la URL del thumbnail 80×80 WebP generado para los bubbles.
 * /images/gran-canaria/cultural/foo.avif → /images/gran-canaria/thumbs/cultural/foo.webp
 * Si no existe la thumb (imagen externa u otro origen), devuelve la URL original.
 */
function getBubbleThumb(heroUrl: string): string {
  if (!heroUrl.startsWith('/images/')) return heroUrl;
  const parts = heroUrl.split('/');
  // ['', 'images', 'gran-canaria', 'cultural', 'foo.avif']
  if (parts.length < 5) return heroUrl;
  const category = parts[parts.length - 2];
  // Las imágenes de municipios no tienen carpeta thumbs — usar original
  if (category === 'municipios') return heroUrl;
  const filename = parts[parts.length - 1].replace(/\.[^.]+$/, '.webp');
  const island = parts[parts.length - 3];
  return `/images/${island}/thumbs/${category}/${filename}`;
}

const CATEGORY_LABELS: Record<POI['category'], string> = {
  nature: 'Naturaleza',
  beach: 'Playa',
  culture: 'Cultura',
  hiking: 'Senderismo',
  viewpoint: 'Mirador',
  food: 'Gastronomía',
  transport: 'Transporte',
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
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, '<li data-ul>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li data-ol>$2</li>')
    .replace(/(<li data-ul>[^]*?<\/li>(\n|$))+/g, m => `<ul>${m.replace(/ data-ul/g, '')}</ul>`)
    .replace(/(<li data-ol>[^]*?<\/li>(\n|$))+/g, m => `<ol>${m.replace(/ data-ol/g, '')}</ol>`)
    .split(/\n{2,}/)
    .map(block => {
      const b = block.trim();
      if (!b) return '';
      if (/^<(h[23]|ul|ol|li)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}

const RichText = memo(function RichText({ html }: { html: string }) {
  const parsed = useMemo(() => parseMarkdown(html), [html]);
  return (
    <div
      className="rich-poi-text"
      dangerouslySetInnerHTML={{ __html: parsed }}
    />
  );
});



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
              transition: 'transform 0.12s ease-out, opacity 0.12s ease-out, box-shadow 0.12s ease-out',
              position: 'relative',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                overflow: 'hidden', border: '2.5px solid white',
                background: ringColor + '33',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: compact ? '16px' : '24px',
                position: 'relative',
              }}>
                {poi.emoji ?? '📍'}
                <img
                  src={getBubbleThumb(poi.images.hero)}
                  alt={poi.name}
                  decoding="async"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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

const PhotoGallery = memo(function PhotoGallery({ poi, color, onActivePhotoChange }: PhotoGalleryProps) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // Guarda la src anterior para mantenerla visible durante el crossfade
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Ref para retener el hero del POI anterior y usarlo como fondo durante el switch
  const prevHeroRef = useRef<string | null>(null);

  const photos = [poi.images.hero, ...poi.images.gallery].filter(Boolean);

  // Reset al cambiar de POI — mantener hero anterior como fondo para crossfade suave
  useEffect(() => {
    const prev = prevHeroRef.current;
    prevHeroRef.current = photos[0] ?? null;
    setActivePhoto(0);
    setHasError(false);
    setIsLoaded(false);
    // Si la imagen ya está en caché (precargada), no mostrar la anterior
    setPrevSrc(prev !== photos[0] ? (prev ?? null) : null);
  }, [poi.slug]); // eslint-disable-line react-hooks/exhaustive-deps

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
});

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

// ── GYG widget container ─────────────────────────────────────────────────────
interface GygWidgetContainerProps {
  children: React.ReactNode;
  locale?: Locale;
}

const AFFILIATE_LABEL: Record<Locale, string> = {
  es: 'Enlace de afiliado · podemos recibir una comisión sin coste para ti',
  en: 'Affiliate link · we may earn a commission at no extra cost to you',
  de: 'Affiliate-Link · wir erhalten ggf. eine Provision ohne Mehrkosten für Sie',
};

function GygWidgetContainer({ children, locale }: GygWidgetContainerProps) {
  const label = locale ? (AFFILIATE_LABEL[locale] ?? AFFILIATE_LABEL.es) : AFFILIATE_LABEL.es;
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'white' }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as const }}>
        {children}
      </div>
      <div style={{
        padding: '6px 16px 8px',
        borderTop: '1px solid #f1f5f9',
        background: '#f8fafc',
      }}>
        <p style={{
          margin: 0, fontSize: '10px', color: '#94a3b8',
          fontFamily: "'Outfit', sans-serif", textAlign: 'center',
        }}>
          {label}
        </p>
      </div>
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
  island?: Island;
  allPois?: POI[];
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
  island,
  allPois,
  sectionContext,
  photoCreditGroups,
}: PoiDetailSheetProps) {
  const t = useUiStrings(locale);

  // Estado local optimista para el bubble activo:
  // se actualiza en el mismo tick del click sin esperar el round-trip al padre.
  const [activeBubbleSlug, setActiveBubbleSlug] = useState(selectedPoi.slug);
  // Sincroniza si el padre cambia selectedPoi por otra vía
  useEffect(() => { setActiveBubbleSlug(selectedPoi.slug); }, [selectedPoi.slug]);

  const handlePoiChange = useCallback((poi: POI) => {
    setActiveBubbleSlug(poi.slug); // visual inmediato
    onPoiChange(poi);               // actualiza el contenido
  }, [onPoiChange]);

  const color = getPoiColor(selectedPoi);
  const inCart = cart.items.some(i => i.slug === selectedPoi.slug);
  const canRoute = hasCoordinates(selectedPoi);
  const [showTranscript, setShowTranscript] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Precargar hero Y galería de todos los POIs del grupo en cuanto se abre el sheet.
  // Así el switch de burbuja y el scroll de galería no esperan red.
  useEffect(() => {
    pois.forEach(poi => {
      const srcs = [poi.images?.hero, ...(poi.images?.gallery ?? [])].filter(Boolean) as string[];
      srcs.forEach(src => {
        const img = new window.Image();
        img.src = src;
      });
    });
  }, [pois]);

  // Descripción plana (para el snippet de 2 líneas) — memoizada para no
  // recalcular parseMarkdown en cada render.
  const plainDescription = useMemo(() =>
    parseMarkdown(selectedPoi.description).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    [selectedPoi.description],
  );

  // Difiere contenido pesado SOLO en el primer mount para no bloquear la animación de apertura.
  // En switches posteriores (cambio de bubble) se muestra inmediatamente.
  // Fusionado con los resets de estado para evitar un commit extra.
  const [contentReady, setContentReady] = useState(false);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setContentReady(false);
      let id = requestAnimationFrame(() => {
        id = requestAnimationFrame(() => setContentReady(true));
      });
      return () => cancelAnimationFrame(id);
    }
    // Cambios de POI posteriores: contenido inmediato + resets en un solo commit
    setContentReady(true);
    setShowTranscript(false);
    setTextExpanded(false);
    setActivePhotoIndex(0);
  }, [selectedPoi.slug]); // eslint-disable-line react-hooks/exhaustive-deps

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
              const isActive = poi.slug === activeBubbleSlug;
              const ringColor = getPoiColor(poi);
              return (
                <button key={poi.slug} onClick={() => handlePoiChange(poi)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px 0',
                }}>
                  <div style={{ position: 'relative',
                    width: 80, height: 80, borderRadius: '50%',
                    padding: isActive ? 4 : 3, background: ringGradient(ringColor),
                    opacity: isActive ? 1 : 0.65,
                    boxShadow: 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'none',
                  }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: ringColor + '33' }}>
                      {poi.emoji ?? '📍'}
                      <img src={getBubbleThumb(poi.images.hero)} alt={poi.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                    maxWidth: '80px', textAlign: 'center',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {poi.name.length > 9 ? poi.name.slice(0, 8) + '…' : poi.name}
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
                const isActive = poi.slug === activeBubbleSlug;
                const ringColor = getPoiColor(poi);
                return (
                  <button key={poi.slug} onClick={() => handlePoiChange(poi)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
                  }}>
                    <div style={{ position: 'relative',
                      width: 88, height: 88, borderRadius: '50%',
                      padding: isActive ? 4 : 3, background: ringGradient(ringColor),
                      opacity: isActive ? 1 : 0.65,
                      boxShadow: 'none',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      transition: 'none',
                    }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', background: ringColor + '33' }}>
                        {poi.emoji ?? '📍'}
                        <img src={getBubbleThumb(poi.images.hero)} alt={poi.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                      maxWidth: '88px', textAlign: 'center',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {poi.name.length > 10 ? poi.name.slice(0, 9) + '…' : poi.name}
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

          {/* Title row: ← Mapa a la izquierda + nombre */}
          <div style={{
            padding: '8px 16px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: `1px solid ${color}20`,
            marginTop: '4px',
          }}>
            {/* ← Mapa — mismo estilo que botón LEER */}
            <button
              onClick={triggerClose}
              aria-label="Volver al mapa"
              style={{
                flexShrink: 0,
                border: 'none',
                background: color,
                color: 'white',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4,
                fontSize: '10px', fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
                transition: 'opacity 0.15s',
                padding: '8px 14px',
                borderRadius: 8,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              MAPA
            </button>

            {/* Nombre */}
            <h2 style={{
              margin: 0, flex: 1, minWidth: 0,
              fontSize: '24px', fontWeight: 700, color: '#0f172a',
              fontFamily: "'Outfit', sans-serif", lineHeight: 1.2,
            }}>
              {selectedPoi.name}
            </h2>
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
              overflow: (selectedPoi.gygTourId || selectedPoi.discoverCarsLocation) ? 'auto' : 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {contentReady && selectedPoi.gygTourId ? (
              <GygWidgetContainer locale={locale}>
                <div style={{ padding: '12px 16px 20px' }}>
                  <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <AvailabilityWidget key={selectedPoi.gygTourId} tourId={selectedPoi.gygTourId} locale={locale} variant="vertical" />
                  </div>
                </div>
              </GygWidgetContainer>
            ) : contentReady && selectedPoi.discoverCarsLocation ? (
              <GygWidgetContainer locale={locale}>
                <div style={{ padding: '12px 16px 20px' }}>
                  <DiscoverCarsWidget
                    key={selectedPoi.discoverCarsLocation}
                    location={selectedPoi.discoverCarsLocation}
                    locale={locale}
                  />
                </div>
              </GygWidgetContainer>
            ) : (
              contentReady && (showTranscript && selectedPoi.audioTranscript
                ? <TranscriptPanel html={selectedPoi.audioTranscript} color={color} />
                : <PhotoGallery poi={selectedPoi} color={color} onActivePhotoChange={setActivePhotoIndex} />)
            )}
          </div>

          {/* Créditos fotográficos — de la foto activa del carrusel, justo debajo de la foto */}
          {contentReady && photoCreditGroups && !selectedPoi.gygTourId && !selectedPoi.discoverCarsLocation && (() => {
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
            {/* 80% — texto preview (clickable → abre panel de lectura) */}
            <button
              onClick={() => setTextExpanded(true)}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{
                flex: '0 0 80%',
                padding: '10px 12px 10px 16px',
                display: 'flex', alignItems: 'center',
                overflow: 'hidden',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <p style={{
                margin: 0,
                fontSize: '13px', lineHeight: 1.55, color: '#6b7280',
                fontFamily: "'Outfit', sans-serif",
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical' as const,
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}>
                {contentReady && plainDescription}
              </p>
            </button>

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

              {/* ── Related POIs — internal linking ── */}
              {contentReady && allPois && island && (() => {
                const related = getRelatedPois(selectedPoi, allPois, locale, island, 4);
                if (!related.length) return null;
                const LABEL: Record<string, string> = {
                  es: 'También te puede interesar',
                  en: 'You might also like',
                  de: 'Das könnte dir auch gefallen',
                };
                return (
                  <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
                    <p style={{
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: '#9ca3af',
                      fontFamily: "'JetBrains Mono', monospace", marginBottom: '12px',
                    }}>
                      {LABEL[locale] ?? LABEL.es}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {related.map((r) => (
                        <a
                          key={r.slug}
                          href={r.href}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            textDecoration: 'none', color: 'inherit',
                            background: '#f8fafc', borderRadius: '12px',
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4f8')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        >
                          {r.thumb && (
                            <img
                              src={r.thumb}
                              alt={r.name}
                              loading="lazy"
                              style={{
                                width: '44px', height: '44px', borderRadius: '8px',
                                objectFit: 'cover', flexShrink: 0,
                              }}
                            />
                          )}
                          <span style={{
                            fontSize: '14px', fontWeight: 600, color: '#1f2937',
                            fontFamily: "'Outfit', sans-serif", lineHeight: 1.3,
                          }}>
                            {r.name}
                          </span>
                          <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '16px' }}>›</span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}

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
        {(canRoute || selectedPoi.track?.mapsUrl || selectedPoi.websiteUrl) && (
          <div style={{
            flexShrink: 0,
            padding: '10px 16px 16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', gap: '8px',
            background: 'white',
          }}>

            {/* Botón Visitar web — full-width, aparece cuando el POI tiene websiteUrl */}
            {selectedPoi.websiteUrl && (
              <a
                href={selectedPoi.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '9px', padding: '14px 16px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                  color: 'white', textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(15,118,110,0.38)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(15,118,110,0.50)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(15,118,110,0.38)';
                }}
              >
                {/* Globe icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {locale === 'es' ? 'Visitar web oficial' : locale === 'de' ? 'Offizielle Website' : 'Visit official website'}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 400, fontFamily: "'Inter', sans-serif", opacity: 0.88, letterSpacing: '0.01em' }}>
                    {selectedPoi.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                </span>
                {/* External link arrow */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 'auto' }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}

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

            {canRoute && !selectedPoi.websiteUrl && <div style={{ display: 'flex', gap: '10px' }}>
              {selectedPoi.gygTourId ? (
                <a
                  href={selectedPoi.gygUrl ?? `https://www.getyourguide.com/-t${selectedPoi.gygTourId}/?partner_id=${GYG_PARTNER_ID}`}
                  target="_blank"
                  rel="sponsored noopener"
                  className="poi-btn gyg-book-btn"
                  style={{
                    flex: 1, padding: '13px 16px', borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF5533 0%, #FF7043 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 4px 16px rgba(255,85,51,0.40)',
                    textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(255,85,51,0.50)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(255,85,51,0.40)';
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="3"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
                  </svg>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {t.sheet.book}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 400, fontFamily: "'Inter', sans-serif", opacity: 0.88, letterSpacing: '0.01em' }}>
                      via GetYourGuide
                    </span>
                  </span>
                </a>
              ) : selectedPoi.discoverCarsLocation ? (
                <a
                  href={selectedPoi.discoverCarsUrl ?? `https://www.discovercars.com/${selectedPoi.discoverCarsLocation}?a_aid=canaryroutes&currency=eur`}
                  target="_blank"
                  rel="sponsored noopener"
                  className="poi-btn"
                  style={{
                    flex: 1, padding: '13px 16px', borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #007ac2 0%, #0099e6 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 4px 16px rgba(0,122,194,0.40)',
                    textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(0,122,194,0.50)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,122,194,0.40)';
                  }}
                >
                  {/* Car icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
                    <circle cx="7.5" cy="17.5" r="2.5"/>
                    <circle cx="16.5" cy="17.5" r="2.5"/>
                  </svg>
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      {locale === 'es' ? 'Buscar coche' : locale === 'de' ? 'Auto suchen' : 'Search car'}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 400, fontFamily: "'Inter', sans-serif", opacity: 0.88, letterSpacing: '0.01em' }}>
                      via DiscoverCars
                    </span>
                  </span>
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
                      boxShadow: inCart ? 'none' : '0 4px 14px rgba(31,157,97,0.40)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}
                  >
                    {inCart ? t.sheet.inRoute : `+ ${t.sheet.addRoute}`}
                    <img
                      src="/icons/icons8-car-53.png"
                      alt=""
                      style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                    />
                  </button>
                </>
              )}
            </div>}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
