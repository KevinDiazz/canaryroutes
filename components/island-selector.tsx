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
    fill: '#df7302',
    stroke: '#07040b',
  },
  {
    id: 'tenerife',
    active: true,
    viewBox: '0 0 200 166',
    path: 'M 185.0,10.0 L 168.0,14.9 L 144.2,11.7 L 141.8,17.0 L 123.1,26.8 L 121.7,33.7 L 110.5,46.0 L 85.8,57.1 L 66.8,56.1 L 49.0,63.3 L 35.3,61.5 L 30.8,57.5 L 10.0,66.6 L 28.4,90.4 L 28.9,104.9 L 50.9,134.6 L 50.9,142.9 L 56.5,144.8 L 58.8,155.8 L 94.8,150.7 L 121.5,119.7 L 122.1,106.0 L 136.5,80.8 L 136.3,62.4 L 149.5,53.5 L 164.7,35.4 L 189.0,23.9 L 190.0,17.5 Z',
    fill: '#dff1f7',
    stroke: '#1a1a1a',
  },

  // ── Coming soon ────────────────────────────────────────────────────────
  {
    id: 'lanzarote',
    active: false,
    viewBox: '0 0 175 200',
    path: 'M 141.7,19.6 L 128.4,15.3 L 125.8,10.0 L 118.8,11.1 L 120.4,23.3 L 125.8,28.1 L 116.2,39.7 L 117.8,47.7 L 130.0,50.9 L 125.8,70.5 L 119.9,78.0 L 107.7,72.1 L 82.2,76.4 L 72.1,90.2 L 50.9,93.9 L 31.8,110.4 L 26.5,121.5 L 26.5,150.7 L 10.0,166.1 L 14.2,183.6 L 32.8,183.1 L 46.1,190.0 L 58.8,176.7 L 63.6,164.5 L 93.9,159.2 L 106.6,149.6 L 125.2,145.4 L 145.9,128.9 L 156.5,95.0 L 151.2,80.6 L 163.5,69.5 L 165.0,54.6 L 160.8,45.0 L 145.9,36.5 L 147.0,27.5 Z',
    fill: '#dff1f7',
    stroke: '#1a1a1a',
  },
  {
    id: 'fuerteventura',
    active: false,
    viewBox: '0 0 176 200',
    path: 'M 156.9,11.8 L 141.3,10.0 L 121.9,19.9 L 123.2,29.1 L 117.2,42.5 L 117.4,52.8 L 102.8,81.0 L 91.8,92.0 L 88.5,108.1 L 79.3,120.6 L 76.3,145.0 L 68.9,155.2 L 35.6,176.2 L 13.6,175.5 L 10.0,185.8 L 21.0,182.8 L 52.1,190.0 L 75.3,161.1 L 121.2,150.1 L 143.7,139.6 L 159.4,101.0 L 155.7,78.1 L 162.3,72.2 L 165.8,51.7 L 162.4,20.0 Z',
    fill: '#dff1f7',
    stroke: '#1a1a1a',
  },
  {
    id: 'la-palma',
    active: false,
    viewBox: '0 0 133 200',
    path: 'M 42.8,10.0 L 13.3,38.9 L 10.0,56.6 L 19.9,71.1 L 28.4,98.7 L 39.6,113.8 L 42.2,127.6 L 60.6,154.5 L 61.9,172.3 L 71.1,190.0 L 80.3,190.0 L 85.5,174.2 L 108.5,137.4 L 111.8,113.1 L 106.6,93.4 L 111.8,79.6 L 123.0,65.8 L 123.0,59.9 L 110.5,42.8 L 109.9,33.0 L 102.0,17.2 L 86.2,15.3 L 80.3,18.5 L 67.8,18.5 L 55.3,15.3 L 52.7,10.0 Z',
    fill: '#dff1f7',
    stroke: '#1a1a1a',
  },
  {
    id: 'la-gomera',
    active: false,
    viewBox: '0 0 200 181',
    path: 'M 33.2,21.6 L 16.2,58.7 L 10.0,103.5 L 20.0,118.2 L 29.3,121.2 L 26.2,133.6 L 47.1,146.0 L 48.6,153.7 L 56.4,156.0 L 64.8,166.1 L 75.7,166.1 L 84.2,171.5 L 98.1,166.1 L 122.8,165.3 L 129.0,156.0 L 137.5,158.3 L 151.4,142.1 L 157.6,142.1 L 159.9,132.1 L 173.0,127.4 L 190.0,109.7 L 186.1,100.4 L 187.7,81.8 L 173.8,58.7 L 165.3,61.0 L 147.5,47.9 L 146.0,42.4 L 134.4,42.4 L 120.5,23.9 L 99.6,19.3 L 82.6,20.0 L 74.1,10.0 L 64.8,10.0 L 54.0,19.3 L 40.9,23.1 Z',
    fill: '#dff1f7',
    stroke: '#1a1a1a',
  },
  {
    id: 'el-hierro',
    active: false,
    viewBox: '0 0 200 178',
    path: 'M 190.0,39.3 L 174.5,16.2 L 161.4,10.0 L 148.5,10.2 L 142.9,17.1 L 132.1,19.8 L 126.3,30.6 L 114.8,25.1 L 111.7,30.6 L 122.5,39.5 L 121.4,44.4 L 108.3,55.3 L 103.2,54.8 L 91.0,70.6 L 74.4,76.4 L 70.6,81.9 L 56.8,76.4 L 49.7,78.1 L 36.9,64.2 L 19.5,72.1 L 14.9,81.0 L 22.0,95.5 L 10.0,101.0 L 11.8,110.1 L 26.2,121.4 L 36.2,112.1 L 43.3,117.9 L 54.4,118.8 L 60.8,126.3 L 66.6,120.3 L 74.4,123.6 L 81.0,120.5 L 97.7,139.0 L 110.1,164.0 L 119.9,167.8 L 130.3,164.0 L 135.6,152.9 L 130.1,138.3 L 137.8,121.9 L 139.6,105.2 L 144.5,99.9 L 158.5,99.2 L 157.8,93.5 L 164.9,85.7 L 162.0,76.8 Z',
    fill: '#dff1f7',
    stroke: '#1a1a1a',
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
};

const ISLAND_SUBTITLES: Record<string, Record<IslandSelectorLocale, string>> = {
  'gran-canaria':  { es: 'La isla redonda',       en: 'The round island',      de: 'Die runde Insel',       no: 'Den runde øya',     da: 'Den runde ø',      fi: 'Pyöreä saari',      sv: 'Den runda ön'        },
  'tenerife':      { es: 'La isla del Teide',     en: 'Island of the Teide',   de: 'Insel des Teide',       no: 'Teide-øya',         da: 'Teide-øen',        fi: 'Teiden saari',      sv: 'Teide-ön'            },
  'lanzarote':     { es: 'La isla volcánica',     en: 'The volcanic island',   de: 'Die Vulkaninsel',       no: 'Den vulkanske øya', da: 'Den vulkanske ø',  fi: 'Vulkaaninen saari', sv: 'Den vulkaniska ön'   },
  'fuerteventura': { es: 'La isla del viento',    en: 'Island of the wind',    de: 'Die Windinsel',         no: 'Vindøya',           da: 'Vindøen',          fi: 'Tuulisaari',        sv: 'Vindöns ö'           },
  'la-palma':      { es: 'La isla bonita',        en: 'The beautiful island',  de: 'Die schöne Insel',      no: 'Den vakre øya',     da: 'Den smukke ø',     fi: 'Kaunis saari',      sv: 'Den vackra ön'       },
  'la-gomera':     { es: 'La isla del Silbo',     en: 'Island of the Silbo',   de: 'Die Silbo-Insel',       no: 'Silbo-øya',         da: 'Silbo-øen',        fi: 'Silbon saari',      sv: 'Silbo-ön'            },
  'el-hierro':     { es: 'La isla del meridiano', en: 'The meridian island',   de: 'Die Meridianinsel',     no: 'Meridianøya',       da: 'Meridianøen',      fi: 'Meridiaanisaari',   sv: 'Meridianöns ö'       },
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
    <div className="island-selector-wrapper">

      {/* ── Section header ── */}
      <p className="island-header" style={{
        fontFamily: "'Gloria Hallelujah', cursive",
        fontWeight: '400',
        fontStyle: 'normal',
        color: '#1a1a1a',
        textAlign: 'center',
        margin: 0,
        letterSpacing: '0.01em',
      }}>
        {CHOOSE_DEST[locale]}
      </p>

      {/* ── Active island cards ── */}
      <div className="island-grid-active">
        {activeIslands.map((island) => (
          <button
            key={island.id}
            onClick={() => router.push(`/${locale}/${island.id}`)}
            className="island-card-active"
            style={{
              backgroundImage: 'url(/images/fondo_card.avif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '2px solid rgba(0,0,0,0.08)',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.22s ease',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.22)';
              e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.22)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg viewBox={island.viewBox} style={{ position: 'relative', zIndex: 1 }} xmlns="http://www.w3.org/2000/svg">
              <path d={island.path} fill="white" stroke="white" strokeWidth="3" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.28))' }} />
            </svg>
            <p className="island-name" style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: '700',
              color: 'white',
              margin: 0,
              letterSpacing: '0.01em',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 1px 8px rgba(0,0,0,0.35)',
            }}>
              {ISLAND_LABELS[island.id][locale]}
            </p>
          </button>
        ))}
      </div>

      {/* ── Coming soon ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#a8d5b5' }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '15px', fontWeight: '600', fontStyle: 'italic',
            color: '#3a9e68',
          }}>
            {COMING_SOON[locale]}
          </span>
          <div style={{ flex: 1, height: '1px', background: '#a8d5b5' }} />
        </div>

        <div className="island-grid-coming-soon">
          {comingSoonIslands.map((island) => (
            <div
              key={island.id}
              aria-disabled="true"
              style={{
                backgroundImage: 'url(/images/fondo_card_inactive.avif)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1.5px solid rgba(0,0,0,0.08)',
                borderRadius: '16px',
                padding: '14px 10px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                cursor: 'not-allowed', userSelect: 'none',
                overflow: 'hidden',
                width: '130px',
                flexShrink: 0,
              }}
            >
              <svg viewBox={island.viewBox} style={{ width: '56px', height: '56px' }} xmlns="http://www.w3.org/2000/svg">
                <path d={island.path} fill="white" stroke="white" strokeWidth="3" style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.20))' }} />
              </svg>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '13px', fontWeight: '600',
                color: 'white', margin: 0, textAlign: 'center', lineHeight: '1.2',
                textShadow: '0 1px 6px rgba(0,0,0,0.35)',
              }}>
                {ISLAND_LABELS[island.id][locale]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
