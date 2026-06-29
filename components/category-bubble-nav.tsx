'use client';
import type { Section } from '@/lib/types';

function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * amount)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface CategoryBubbleNavProps {
  sections: Section[];
  activeSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
}

export function CategoryBubbleNav({ sections, activeSectionId, onSectionSelect }: CategoryBubbleNavProps) {
  if (!sections.length) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 150,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        padding: '10px 0 12px',
        gap: '16px',
        height: '140px',
        alignItems: 'center',
      }}>
        {sections.map((section) => {
          const isActive = activeSectionId === section.id;
          return (
            <button
              key={section.id}
              onPointerUp={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSectionSelect(section.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                minWidth: 64,
              }}
            >
              {/* Bubble — halo con gradiente de categoría cuando activo */}
              <div style={{
                borderRadius: '50%',
                padding: isActive ? '3px' : '2.5px',
                background: isActive
                  ? `linear-gradient(135deg, ${shadeColor(section.color, 0.45)}, ${section.color}, ${shadeColor(section.color, -0.35)})`
                  : '#e5e7eb',
                transform: isActive ? 'translateY(-3px) scale(1.08)' : 'scale(1)',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                boxShadow: isActive ? `0 4px 12px ${section.color}40` : '0 1px 3px rgba(0,0,0,0.07)',
                flexShrink: 0,
              }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: isActive ? section.color + '18' : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}>
                  {section.emoji}
                </div>
              </div>

              {/* Label */}
              <span style={{
                fontSize: '9px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? section.color : '#6b7280',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: 72,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'color 0.18s',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}>
                {section.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
