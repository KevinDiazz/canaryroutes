'use client';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/types';

type IslandSelectorLocale = Locale | 'no' | 'da' | 'fi' | 'sv';

interface IslandConfig {
  id: string;
  active: boolean;
  viewBox: string;
  path: string;
  fill: string;
  stroke: string;
}

const ISLANDS: IslandConfig[] = [
  // ── Active ─────────────────────────────────────────────────────────────
  {
    id: 'gran-canaria',
    active: true,
    viewBox: '0 0 400 420',
    path: 'M 350.33 142.67 L 355.75 147.88 L 369.29 154.39 L 372 159.61 L 369.29 171.33 L 363.87 185.67 L 361.17 198.7 L 372 211.73 L 372 216.94 L 363.87 220.85 L 358.46 227.36 L 350.33 244.3 L 358.46 254.73 L 361.17 269.06 L 361.17 280.79 L 347.62 286 L 339.5 291.21 L 315.12 318.58 L 304.28 327.7 L 250.11 343.33 L 241.98 347.24 L 239.28 347.24 L 220.31 368.09 L 209.48 372 L 201.35 368.09 L 195.94 362.88 L 187.81 358.97 L 155.31 357.67 L 141.76 353.76 L 128.22 348.55 L 87.59 317.27 L 82.17 309.45 L 79.46 304.24 L 63.21 296.42 L 57.8 291.21 L 55.09 287.3 L 30.71 243 L 28 227.36 L 30.71 211.73 L 28 202.61 L 28 190.88 L 28 179.15 L 30.71 170.03 L 38.83 162.21 L 68.63 147.88 L 82.17 138.76 L 98.43 123.12 L 111.97 103.58 L 109.26 85.33 L 117.39 77.52 L 120.09 64.48 L 117.39 48.85 L 114.68 37.12 L 122.8 37.12 L 130.93 37.12 L 139.06 38.42 L 144.47 42.33 L 155.31 39.73 L 195.94 52.76 L 252.82 52.76 L 298.87 63.18 L 317.83 57.97 L 315.12 31.91 L 336.79 28 L 339.5 29.3 L 344.91 39.73 L 344.91 44.94 L 336.79 47.55 L 331.37 57.97 L 334.08 78.82 L 336.79 108.79 L 339.5 114 L 342.2 123.12 L 344.91 133.55 L 350.33 142.67 Z',
    fill: '#bff4d2',
    stroke: '#1f9d61',
  },
  {
    id: 'tenerife',
    active: true,
    viewBox: '0 0 440 320',
    path: 'M 80,180 C 90,140 115,100 150,75 C 185,50 225,45 265,55 C 305,65 335,90 345,125 C 355,160 340,200 315,225 C 290,250 250,265 210,268 C 170,270 130,258 108,235 C 85,210 72,215 80,180 Z',
    fill: '#fef3c7',
    stroke: '#f59e0b',
  },

  // ── Coming soon ────────────────────────────────────────────────────────
  {
    id: 'lanzarote',
    active: false,
    viewBox: '0 0 320 210',
    path: 'M 35,150 C 55,90 135,40 215,45 C 295,50 325,100 295,155 C 265,205 175,225 100,205 C 40,190 20,195 35,150 Z',
    fill: '#e2e8f0',
    stroke: '#94a3b8',
  },
  {
    id: 'fuerteventura',
    active: false,
    viewBox: '0 0 210 370',
    path: 'M 105,22 C 155,18 195,58 205,120 C 215,182 195,275 162,335 C 143,365 90,355 68,295 C 46,235 48,132 75,65 C 85,38 95,24 105,22 Z',
    fill: '#e2e8f0',
    stroke: '#94a3b8',
  },
  {
    id: 'la-palma',
    active: false,
    viewBox: '0 0 240 350',
    path: 'M 120,22 C 172,22 212,70 215,132 C 218,194 198,272 163,325 C 144,350 102,342 78,298 C 52,248 52,152 78,86 C 92,46 106,22 120,22 Z',
    fill: '#e2e8f0',
    stroke: '#94a3b8',
  },
  {
    id: 'la-gomera',
    active: false,
    viewBox: '0 0 260 255',
    path: 'M 130,22 C 196,22 248,72 248,138 C 248,204 196,242 130,242 C 64,242 12,200 12,138 C 12,76 64,22 130,22 Z',
    fill: '#e2e8f0',
    stroke: '#94a3b8',
  },
  {
    id: 'el-hierro',
    active: false,
    viewBox: '0 0 255 275',
    path: 'M 128,18 C 198,32 248,108 238,178 C 228,248 168,272 108,262 C 52,252 18,198 18,143 C 18,83 58,32 128,18 Z',
    fill: '#e2e8f0',
    stroke: '#94a3b8',
  },
  {
    id: 'la-graciosa',
    active: false,
    viewBox: '0 0 280 195',
    path: 'M 68,68 C 108,38 198,42 228,72 C 258,102 252,158 212,175 C 172,192 94,188 62,155 C 32,124 32,96 68,68 Z',
    fill: '#e2e8f0',
    stroke: '#94a3b8',
  },
];

// ── Labels ──────────────────────────────────────────────────────────────────

const ISLAND_LABELS: Record<string, Record<IslandSelectorLocale, string>> = {
  'gran-canaria':  { es: 'Gran Canaria',   en: 'Gran Canaria',   de: 'Gran Canaria',   no: 'Gran Canaria',   da: 'Gran Canaria',   fi: 'Gran Canaria',   sv: 'Gran Canaria'   },
  'tenerife':      { es: 'Tenerife',       en: 'Tenerife',       de: 'Teneriffa',      no: 'Tenerife',       da: 'Tenerife',       fi: 'Tenerife',       sv: 'Teneriffa'      },
  'lanzarote':     { es: 'Lanzarote',      en: 'Lanzarote',      de: 'Lanzarote',      no: 'Lanzarote',      da: 'Lanzarote',      fi: 'Lanzarote',      sv: 'Lanzarote'      },
  'fuerteventura': { es: 'Fuerteventura',  en: 'Fuerteventura',  de: 'Fuerteventura',  no: 'Fuerteventura',  da: 'Fuerteventura',  fi: 'Fuerteventura',  sv: 'Fuerteventura'  },
  'la-palma':      { es: 'La Palma',       en: 'La Palma',       de: 'La Palma',       no: 'La Palma',       da: 'La Palma',       fi: 'La Palma',       sv: 'La Palma'       },
  'la-gomera':     { es: 'La Gomera',      en: 'La Gomera',      de: 'La Gomera',      no: 'La Gomera',      da: 'La Gomera',      fi: 'La Gomera',      sv: 'La Gomera'      },
  'el-hierro':     { es: 'El Hierro',      en: 'El Hierro',      de: 'El Hierro',      no: 'El Hierro',      da: 'El Hierro',      fi: 'El Hierro',      sv: 'El Hierro'      },
  'la-graciosa':   { es: 'La Graciosa',    en: 'La Graciosa',    de: 'La Graciosa',    no: 'La Graciosa',    da: 'La Graciosa',    fi: 'La Graciosa',    sv: 'La Graciosa'    },
};

const ISLAND_SUBTITLES: Record<string, Record<IslandSelectorLocale, string>> = {
  'gran-canaria':  { es: 'La isla redonda',       en: 'The round island',      de: 'Die runde Insel',       no: 'Den runde øya',     da: 'Den runde ø',      fi: 'Pyöreä saari',      sv: 'Den runda ön'        },
  'tenerife':      { es: 'La isla del Teide',     en: 'Island of the Teide',   de: 'Insel des Teide',       no: 'Teide-øya',         da: 'Teide-øen',        fi: 'Teiden saari',      sv: 'Teide-ön'            },
  'lanzarote':     { es: 'La isla volcánica',     en: 'The volcanic island',   de: 'Die Vulkaninsel',       no: 'Den vulkanske øya', da: 'Den vulkanske ø',  fi: 'Vulkaaninen saari', sv: 'Den vulkaniska ön'   },
  'fuerteventura': { es: 'La isla del viento',    en: 'Island of the wind',    de: 'Die Windinsel',         no: 'Vindøya',           da: 'Vindøen',          fi: 'Tuulisaari',        sv: 'Vindöns ö'           },
  'la-palma':      { es: 'La isla bonita',        en: 'The beautiful island',  de: 'Die schöne Insel',      no: 'Den vakre øya',     da: 'Den smukke ø',     fi: 'Kaunis saari',      sv: 'Den vackra ön'       },
  'la-gomera':     { es: 'La isla del Silbo',     en: 'Island of the Silbo',   de: 'Die Silbo-Insel',       no: 'Silbo-øya',         da: 'Silbo-øen',        fi: 'Silbon saari',      sv: 'Silbo-ön'            },
  'el-hierro':     { es: 'La isla del meridiano', en: 'The meridian island',   de: 'Die Meridianinsel',     no: 'Meridianøya',       da: 'Meridianøen',      fi: 'Meridiaanisaari',   sv: 'Meridianöns ö'       },
  'la-graciosa':   { es: 'La isla minúscula',     en: 'The tiny island',       de: 'Die winzige Insel',     no: 'Den lille øya',     da: 'Den lille ø',      fi: 'Pieni saari',       sv: 'Den lilla ön'        },
};

const CHOOSE_DEST: Record<IslandSelectorLocale, string> = {
  es: 'Elige tu destino', en: 'Choose your destination', de: 'Wähle dein Ziel',
  no: 'Velg destinasjon', da: 'Vælg destination', fi: 'Valitse kohde', sv: 'Välj destination',
};

const COMING_SOON: Record<IslandSelectorLocale, string> = {
  es: 'Próximamente', en: 'Coming soon', de: 'Demnächst',
  no: 'Snart', da: 'Snart', fi: 'Pian', sv: 'Snart',
};

// ── Component ───────────────────────────────────────────────────────────────

export function IslandSelector({ locale }: { locale: IslandSelectorLocale }) {
  const router = useRouter();

  const activeIslands    = ISLANDS.filter(i => i.active);
  const comingSoonIslands = ISLANDS.filter(i => !i.active);

  return (
    <div style={{ padding: '28px 20px 48px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Section header ── */}
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '13px',
        fontWeight: '600',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#9ca3af',
        textAlign: 'center',
        margin: 0,
      }}>
        {CHOOSE_DEST[locale]}
      </p>

      {/* ── Active island cards ── */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {activeIslands.map((island) => (
          <button
            key={island.id}
            onClick={() => router.push(`/${locale}/${island.id}`)}
            style={{
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '24px',
              padding: '28px 32px 22px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              width: '220px',
              transition: 'all 0.25s ease',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = island.stroke;
              e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.12)`;
              e.currentTarget.style.transform = 'translateY(-4px)';
              const pathEl = e.currentTarget.querySelector('path') as SVGPathElement | null;
              if (pathEl) pathEl.style.fill = island.stroke;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              const pathEl = e.currentTarget.querySelector('path') as SVGPathElement | null;
              if (pathEl) pathEl.style.fill = island.fill;
            }}
          >
            <svg viewBox={island.viewBox} style={{ width: '130px', height: '130px' }} xmlns="http://www.w3.org/2000/svg">
              <path d={island.path} fill={island.fill} stroke={island.stroke} strokeWidth="3" style={{ transition: 'fill 0.25s ease' }} />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                {ISLAND_LABELS[island.id][locale]}
              </p>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#9ca3af', margin: '3px 0 0', fontStyle: 'italic' }}>
                {ISLAND_SUBTITLES[island.id][locale]}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Coming soon ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px', fontWeight: '700',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#cbd5e1',
          }}>
            {COMING_SOON[locale]}
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '440px', margin: '0 auto' }}>
          {comingSoonIslands.map((island) => (
            <div
              key={island.id}
              aria-disabled="true"
              style={{
                background: 'white',
                border: '1.5px solid #f1f5f9',
                borderRadius: '16px',
                padding: '14px 10px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                cursor: 'not-allowed', opacity: 0.72, userSelect: 'none',
              }}
            >
              <svg viewBox={island.viewBox} style={{ width: '64px', height: '64px' }} xmlns="http://www.w3.org/2000/svg">
                <path d={island.path} fill={island.fill} stroke={island.stroke} strokeWidth="3" />
              </svg>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: '700', color: '#9ca3af', margin: 0, textAlign: 'center', lineHeight: '1.2' }}>
                {ISLAND_LABELS[island.id][locale]}
              </p>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '9px', fontWeight: '700',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: '#cbd5e1', background: '#f8fafc',
                borderRadius: '6px', padding: '2px 6px',
              }}>
                {COMING_SOON[locale]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
