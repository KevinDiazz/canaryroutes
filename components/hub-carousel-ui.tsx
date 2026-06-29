'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CardData = {
  href: string;
  color: string;
  badge: string;
  label: string;
  sub: string;
  ariaLabel: string;
  island: string;
  comingSoon: boolean;
  svgViewBox: string;
  svgPath: string;
};

// ── Island silhouette ─────────────────────────────────────────────────────────

function IslandSilhouette({
  viewBox,
  path,
  comingSoon,
}: {
  viewBox: string;
  path: string;
  comingSoon: boolean;
}) {
  return (
    <svg
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '55%',
        height: '55%',
        opacity: comingSoon ? 0.05 : 0.09,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <path d={path} fill="#000000" />
    </svg>
  );
}

// ── Single card ───────────────────────────────────────────────────────────────

function HubCard({ card }: { card: CardData }) {
  const { href, color, badge, label, sub, ariaLabel, comingSoon, svgViewBox, svgPath } = card;

  const cardStyle: React.CSSProperties = {
    flexShrink: 0,
    width: '140px',
    height: '158px',
    borderRadius: '12px',
    overflow: 'hidden',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    background: comingSoon ? '#f9fafb' : 'white',
    border: '0.5px solid #e5e7eb',
    borderLeft: `3px solid ${comingSoon ? '#d1d5db' : color}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    cursor: comingSoon ? 'default' : 'pointer',
    opacity: comingSoon ? 0.72 : 1,
  };

  const inner = (
    <>
      <IslandSilhouette viewBox={svgViewBox} path={svgPath} comingSoon={comingSoon} />

      {/* Badge */}
      <div style={{ position: 'absolute', top: '12px', left: '14px', zIndex: 1 }}>
        <span style={{
          fontSize: '9px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: comingSoon ? '#9ca3af' : color,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {badge}
        </span>
      </div>

      {/* Title + sub */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 12px 14px 14px', width: '100%' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: '600',
          color: comingSoon ? '#9ca3af' : '#111827',
          margin: sub ? '0 0 3px' : '0',
          lineHeight: '1.25',
          fontFamily: "'Outfit', sans-serif",
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
        }}>
          {label}
        </p>
        {sub && (
          <p style={{
            fontSize: '10px',
            fontWeight: '500',
            color: '#d1d5db',
            margin: 0,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.02em',
          }}>
            {sub}
          </p>
        )}
      </div>
    </>
  );

  if (comingSoon) {
    return (
      <div aria-label={ariaLabel} style={cardStyle} className="hub-card hub-card--soon">
        {inner}
      </div>
    );
  }

  return (
    <a href={href} aria-label={ariaLabel} style={cardStyle} className="hub-card">
      {inner}
    </a>
  );
}

// ── Scroll button ─────────────────────────────────────────────────────────────

function ScrollBtn({
  dir,
  onClick,
  visible,
}: {
  dir: 'left' | 'right';
  onClick: () => void;
  visible: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'left' ? 'Anterior' : 'Siguiente'}
      style={{
        position: 'absolute',
        top: '50%',
        [dir]: '0px',
        transform: 'translateY(-50%)',
        zIndex: 10,
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '1px solid #e5e7eb',
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
        padding: 0,
        color: '#374151',
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: dir === 'left' ? 'none' : 'rotate(180deg)' }}
      >
        <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Main UI component ─────────────────────────────────────────────────────────

export function HubCarouselUI({ cards }: { cards: CardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener('scroll', updateButtons, { passive: true });
    const ro = new ResizeObserver(updateButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateButtons);
      ro.disconnect();
    };
  }, [updateButtons]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  if (cards.length === 0) return null;

  return (
    <section style={{ padding: '0 0 8px', marginLeft: '10px' }}>
      {/* Outer wrapper: limits width on desktop, centers */}
      <div
        style={{
          position: 'relative',
          maxWidth: '820px',
          margin: '0 auto',
          padding: '0 36px',
        }}
        className="hub-carousel-wrapper"
      >
        {/* Scroll buttons — only visible on desktop */}
        <ScrollBtn dir="left" onClick={() => scroll('left')} visible={canLeft} />
        <ScrollBtn dir="right" onClick={() => scroll('right')} visible={canRight} />

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="hub-carousel-row"
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '8px 0 12px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{ scrollSnapAlign: 'start', flexShrink: 0 }}
            >
              <HubCard card={card} />
            </div>
          ))}
          {/* Trailing spacer */}
          <div style={{ minWidth: '16px', flexShrink: 0 }} aria-hidden="true" />
        </div>
      </div>

      <style>{`
        .hub-carousel-row::-webkit-scrollbar { display: none; }

        .hub-carousel-row > div:first-child { margin-left: 16px; }
        .hub-carousel-row > div:last-child  { margin-right: 16px; }

        .hub-card:hover {
          transform: translateY(-3px) scale(1.025);
          box-shadow: 0 8px 24px rgba(0,0,0,0.13);
        }
        .hub-card--soon {
          pointer-events: none;
        }

        /* Mobile: full-width, left-aligned, padding inside the row */
        @media (max-width: 640px) {
          .hub-carousel-wrapper {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
