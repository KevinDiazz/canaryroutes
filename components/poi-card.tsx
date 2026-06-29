import Link from 'next/link';
import type { POI, Locale } from '@/lib/types';

export function POICard({ poi, locale }: { poi: POI; locale: Locale }) {
  return (
    <Link href={`/${locale}/${poi.island}/${poi.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        background: 'white',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{poi.emoji ?? '📍'}</div>
        <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#1f2937', fontFamily: "'Outfit', sans-serif" }}>
          {poi.name}
        </h3>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>{poi.shortDescription}</p>
        {poi.visitDuration && (
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>⏱ {poi.visitDuration}</span>
        )}
      </div>
    </Link>
  );
}
