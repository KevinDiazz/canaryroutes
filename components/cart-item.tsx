'use client';
import type { CartItem as CartItemType } from '@/hooks/use-cart';

const CATEGORY_COLORS: Record<string, string> = {
  nature:    '#2ea86e',
  beach:     '#2090c0',
  culture:   '#6e42b8',
  hiking:    '#2a9e60',
  viewpoint: '#c47a18',
  food:      '#c44038',
  other:     '#5a7a90',
};

const CATEGORY_LABELS: Record<string, string> = {
  nature:    'Naturaleza',
  beach:     'Playa',
  culture:   'Cultura',
  hiking:    'Senderismo',
  viewpoint: 'Mirador',
  food:      'Gastronomía',
  other:     'Lugar',
};

interface CartItemProps {
  index: number;
  poi: CartItemType;
  onRemove: () => void;
}

export function CartItem({ index, poi, onRemove }: CartItemProps) {
  const color = CATEGORY_COLORS[poi.category] ?? '#5a7a90';
  const label = CATEGORY_LABELS[poi.category] ?? poi.category;

  return (
    <li style={{ listStyle: 'none', margin: '10px 0' }}>
      <div style={{
        position: 'relative',
        height: '100px',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
      }}>
        {/* Foto de fondo */}
        <img
          src={poi.images?.hero ?? '/images/placeholder.avif'}
          alt={poi.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Gradiente para legibilidad */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.62) 100%)',
        }} />

        {/* Número de parada */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          width: '26px', height: '26px',
          background: color,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '800', color: 'white',
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}>
          {index + 1}
        </div>

        {/* Botón eliminar */}
        <button
          onClick={onRemove}
          title={`Eliminar ${poi.name}`}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,0,0,0.45)',
            border: 'none',
            borderRadius: '50%',
            width: '26px', height: '26px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          ✕
        </button>

        {/* Texto en la parte inferior */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '8px 12px 10px',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: '700',
            fontFamily: "'JetBrains Mono', monospace",
            color: color === '#2090c0' ? '#7dd3fc' : color === '#2ea86e' ? '#6ee7b7' : '#e2e8f0',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: '2px',
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '15px', fontWeight: '700',
            fontFamily: "'Outfit', sans-serif",
            color: 'white',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}>
            {poi.name}
          </div>
        </div>
      </div>
    </li>
  );
}
