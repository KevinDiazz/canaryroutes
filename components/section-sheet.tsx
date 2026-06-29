'use client';
import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { POI, Section } from '@/lib/types';

interface SectionSheetProps {
  section: Section;
  pois: POI[];               // all POIs for this section (map + section-only)
  onClose: () => void;
  onPoiSelect: (poi: POI) => void;
}

function RichText({ html }: { html: string }) {
  return (
    <div
      style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function SectionSheet({ section, pois, onClose, onPoiSelect }: SectionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const introPoi = pois[0]?.sectionOnly && pois[0].slug === section.id ? pois[0] : null;
  const listedPois = introPoi ? pois.slice(1) : pois;

  const triggerClose = useCallback(() => {
    if (sheetRef.current) sheetRef.current.style.pointerEvents = 'none';
    onClose();
  }, [onClose]);

  return (
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
        top: '56px',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#f8fafc',
        borderRadius: '20px 20px 0 0',
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

      {/* Header */}
      <div style={{
        padding: '14px 16px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
        background: 'white',
        borderBottom: `1px solid ${section.color}30`,
      }}>
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: section.color + '15',
          border: `2.5px solid ${section.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
          boxShadow: `0 4px 14px ${section.color}33`,
        }}>
          {section.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{
            margin: 0, fontSize: '20px', fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            color: '#0f172a', lineHeight: 1.2,
          }}>
            {section.label}
          </h2>
          <p style={{
            margin: '2px 0 0', fontSize: '11px',
            color: section.color,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            {listedPois.length} {listedPois.length === 1 ? 'lugar' : 'lugares'}
          </p>
        </div>
        <button
          onClick={triggerClose}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#f1f5f9', border: 'none',
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', color: '#64748b',
          }}
        >✕</button>
      </div>

      {/* POI list */}
      <div style={{ padding: '12px 12px 80px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {introPoi && (
          <article
            style={{
              borderRadius: '18px',
              overflow: 'hidden',
              background: 'white',
              border: `1px solid ${section.color}30`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            }}
          >
            <div style={{
              height: 150,
              background: section.color + '18',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <img
                src={introPoi.images.hero}
                alt={introPoi.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15,23,42,0.7), rgba(15,23,42,0.05))',
              }} />
              <div style={{
                position: 'absolute',
                left: 14,
                right: 14,
                bottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
              }}>
                <span style={{ fontSize: '24px' }}>{introPoi.emoji ?? section.emoji}</span>
                <h3 style={{
                  margin: 0,
                  color: 'white',
                  fontSize: '24px',
                  lineHeight: 1.1,
                  fontFamily: "'Outfit', sans-serif",
                }}>
                  {introPoi.name}
                </h3>
              </div>
            </div>
            <div style={{ padding: '14px 15px 16px' }}>
              <RichText html={introPoi.description} />
            </div>
          </article>
        )}

        {listedPois.length > 0 && (
          <section
            style={{
              borderRadius: '18px',
              background: 'white',
              border: '1px solid #e8edf2',
              padding: '14px 12px 16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))',
              gap: '14px 10px',
            }}>
              {listedPois.map(poi => (
                <button
                  key={poi.slug}
                  onClick={() => {
                    triggerClose();
                    setTimeout(() => onPoiSelect(poi), 60);
                  }}
                  style={{
                    minWidth: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '7px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    border: `2.5px solid ${section.color}55`,
                    background: section.color + '12',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: `0 7px 18px -10px ${section.color}`,
                  }}>
                    <img
                      src={poi.images.hero}
                      alt={poi.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </span>
                  <span style={{
                    maxWidth: 90,
                    color: '#334155',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    overflowWrap: 'anywhere',
                  }}>
                    {poi.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
