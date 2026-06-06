import Link from 'next/link';
import type { Route, Locale } from '@/lib/types';

export function RouteCard({ route, locale }: { route: Route; locale: Locale }) {
  return (
    <Link href={`/${locale}/${route.island}/routes/${route.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        background: 'white',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        borderLeft: '4px solid #1f9d61',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937', fontFamily: "'Outfit', sans-serif" }}>
            {route.name}
          </h3>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#1f9d61', whiteSpace: 'nowrap', marginLeft: '12px' }}>
            €{route.price}
          </span>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
          {route.description}
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>🕐 {route.duration}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>📏 {route.distance}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>🚗 {route.type}</span>
        </div>
        <div style={{ marginTop: '12px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#15803d',
            fontWeight: '600',
          }}>
            🎧 Audioguía premium
          </span>
        </div>
      </div>
    </Link>
  );
}
