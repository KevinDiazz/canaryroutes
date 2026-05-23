'use client';
import type { CartItem as CartItemType } from '@/hooks/use-cart';

interface CartItemProps {
  index: number;
  poi: CartItemType;
  onRemove: () => void;
}

export function CartItem({ index, poi, onRemove }: CartItemProps) {
  return (
    <li style={{ listStyle: 'none', margin: '8px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '8px',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
      >
        {/* Stop number */}
        <span
          style={{
            width: '32px',
            height: '32px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>

        {/* POI info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#1f2937',
            }}
          >
            {poi.emoji} {poi.name}
          </p>
          <small style={{ color: '#6b7280', fontSize: '12px', display: 'block', marginTop: '2px' }}>
            {poi.category}
          </small>
        </div>

        {/* Remove button */}
        <button
          onClick={onRemove}
          title={`Eliminar ${poi.name} del carrito`}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontSize: '18px',
            cursor: 'pointer',
            padding: 0,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s ease',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          ✕
        </button>
      </div>
    </li>
  );
}
