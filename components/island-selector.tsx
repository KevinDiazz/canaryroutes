'use client';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/types';

// SVG paths exactos de gran-canaria-map-v2.jsx
const ISLAND_SVGS: Record<string, { path: string; fill: string; stroke: string; viewBox: string }> = {
  'gran-canaria': {
    viewBox: '0 0 400 420',
    path: 'M 350.33 142.67 L 355.75 147.88 L 369.29 154.39 L 372 159.61 L 369.29 171.33 L 363.87 185.67 L 361.17 198.7 L 372 211.73 L 372 216.94 L 363.87 220.85 L 358.46 227.36 L 350.33 244.3 L 358.46 254.73 L 361.17 269.06 L 361.17 280.79 L 347.62 286 L 339.5 291.21 L 315.12 318.58 L 304.28 327.7 L 250.11 343.33 L 241.98 347.24 L 239.28 347.24 L 220.31 368.09 L 209.48 372 L 201.35 368.09 L 195.94 362.88 L 187.81 358.97 L 155.31 357.67 L 141.76 353.76 L 128.22 348.55 L 87.59 317.27 L 82.17 309.45 L 79.46 304.24 L 63.21 296.42 L 57.8 291.21 L 55.09 287.3 L 30.71 243 L 28 227.36 L 30.71 211.73 L 28 202.61 L 28 190.88 L 28 179.15 L 30.71 170.03 L 38.83 162.21 L 68.63 147.88 L 82.17 138.76 L 98.43 123.12 L 111.97 103.58 L 109.26 85.33 L 117.39 77.52 L 120.09 64.48 L 117.39 48.85 L 114.68 37.12 L 122.8 37.12 L 130.93 37.12 L 139.06 38.42 L 144.47 42.33 L 155.31 39.73 L 195.94 52.76 L 252.82 52.76 L 298.87 63.18 L 317.83 57.97 L 315.12 31.91 L 336.79 28 L 339.5 29.3 L 344.91 39.73 L 344.91 44.94 L 336.79 47.55 L 331.37 57.97 L 334.08 78.82 L 336.79 108.79 L 339.5 114 L 342.2 123.12 L 344.91 133.55 L 350.33 142.67 Z',
    fill: '#bff4d2',
    stroke: '#1f9d61',
  },
  'tenerife': {
    viewBox: '0 0 440 320',
    path: 'M 80,180 C 90,140 115,100 150,75 C 185,50 225,45 265,55 C 305,65 335,90 345,125 C 355,160 340,200 315,225 C 290,250 250,265 210,268 C 170,270 130,258 108,235 C 85,210 72,215 80,180 Z',
    fill: '#fef3c7',
    stroke: '#f59e0b',
  },
};

const ISLAND_LABELS: Record<string, Record<Locale, string>> = {
  'gran-canaria': {
    es: 'Gran Canaria', en: 'Gran Canaria', de: 'Gran Canaria',
    no: 'Gran Canaria', da: 'Gran Canaria', fi: 'Gran Canaria', sv: 'Gran Canaria',
  },
  'tenerife': {
    es: 'Tenerife', en: 'Tenerife', de: 'Teneriffa',
    no: 'Tenerife', da: 'Tenerife', fi: 'Tenerife', sv: 'Teneriffa',
  },
};

const ISLAND_SUBTITLES: Record<string, Record<Locale, string>> = {
  'gran-canaria': {
    es: 'La isla redonda', en: 'The round island', de: 'Die runde Insel',
    no: 'Den runde øya', da: 'Den runde ø', fi: 'Pyöreä saari', sv: 'Den runda ön',
  },
  'tenerife': {
    es: 'La isla del Teide', en: 'Island of the Teide', de: 'Insel des Teide',
    no: 'Teide-øya', da: 'Teide-øen', fi: 'Teiden saari', sv: 'Teide-ön',
  },
};

export function IslandSelector({ locale }: { locale: Locale }) {
  const router = useRouter();

  const islands = ['gran-canaria', 'tenerife'] as const;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      gap: '16px',
    }}>
      {/* Título */}
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: '15px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#9ca3af',
        marginBottom: '8px',
      }}>
        {locale === 'es' ? 'Elige tu destino' :
         locale === 'de' ? 'Wähle dein Ziel' :
         locale === 'no' ? 'Velg destinasjon' :
         locale === 'da' ? 'Vælg destination' :
         locale === 'fi' ? 'Valitse kohde' :
         locale === 'sv' ? 'Välj destination' :
         'Choose your destination'}
      </p>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {islands.map((island) => {
          const svg = ISLAND_SVGS[island];
          return (
            <button
              key={island}
              onClick={() => router.push(`/${locale}/${island}`)}
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '24px',
                padding: '32px 40px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                width: '260px',
                transition: 'all 0.25s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = svg.stroke;
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.12)`;
                e.currentTarget.style.transform = 'translateY(-4px)';
                const svgEl = e.currentTarget.querySelector('path') as SVGPathElement;
                if (svgEl) svgEl.style.fill = svg.stroke;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
                const svgEl = e.currentTarget.querySelector('path') as SVGPathElement;
                if (svgEl) svgEl.style.fill = svg.fill;
              }}
            >
              {/* Mapa SVG de la isla */}
              <svg
                viewBox={svg.viewBox}
                style={{ width: '160px', height: '160px' }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d={svg.path}
                  fill={svg.fill}
                  stroke={svg.stroke}
                  strokeWidth="3"
                  style={{ transition: 'fill 0.25s ease' }}
                />
              </svg>

              {/* Nombre */}
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0,
                }}>
                  {ISLAND_LABELS[island][locale]}
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '14px',
                  color: '#9ca3af',
                  margin: '4px 0 0',
                  fontStyle: 'italic',
                }}>
                  {ISLAND_SUBTITLES[island][locale]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
