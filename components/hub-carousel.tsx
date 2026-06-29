import type { Locale } from '@/lib/types';
import { getGuides } from '@/lib/guides';

// -- Tenerife SVG silhouette path ---------------------------------------------

const TENERIFE_PATH = 'M 643.7,20.5 C 626.9,10.3 642.9,13.9 618.1,20.0 C 593.4,26.1 612.3,33.6 581.9,35.8 C 551.5,38.0 567.2,26.6 542.1,25.6 C 517.0,24.6 537.1,33.7 519.1,33.3 C 501.2,32.8 509.4,20.5 497.2,24.6 C 484.9,28.7 507.1,31.8 488.5,43.5 C 469.9,55.1 477.3,39.8 450.7,53.6 C 424.2,67.5 435.6,58.5 422.2,78.1 C 408.7,97.7 429.3,81.2 417.1,102.6 C 404.8,124.0 406.2,118.6 391.5,131.6 C 376.8,144.7 385.8,129.5 380.3,135.2 C 374.8,140.9 384.9,140.8 377.8,145.9 C 370.6,151.0 373.7,140.2 362.5,148.0 C 351.2,155.7 366.8,157.5 349.7,165.3 C 332.5,173.0 343.5,159.4 319.6,167.3 C 295.7,175.3 312.6,176.2 290.0,185.2 C 267.3,194.1 290.3,190.8 262.9,189.8 C 235.6,188.7 240.8,181.6 221.6,182.6 C 202.4,183.6 221.7,190.5 215.0,192.3 C 208.2,194.1 211.5,184.8 204.8,187.2 C 198.0,189.7 205.7,195.4 198.1,198.4 C 190.6,201.5 201.6,191.2 185.9,194.9 C 170.1,198.5 189.2,205.0 158.8,207.6 C 128.4,210.3 135.8,209.6 109.8,201.5 C 83.9,193.3 114.0,184.8 94.0,187.2 C 74.0,189.7 89.4,194.6 59.8,207.6 C 30.2,220.7 35.1,210.7 20.0,219.8 C 4.9,229.0 13.7,221.8 22.0,230.5 C 30.4,239.3 21.7,217.5 40.9,241.8 C 60.1,266.0 52.5,266.5 70.0,291.2 C 87.6,315.9 81.3,288.8 84.8,303.5 C 88.3,318.1 77.7,307.1 78.7,327.9 C 79.7,348.7 74.9,333.4 87.4,355.5 C 99.8,377.5 95.1,357.3 109.8,383.0 C 124.5,408.7 101.9,388.5 124.1,419.7 C 146.4,450.9 148.7,432.6 165.5,461.0 C 182.2,489.3 157.8,475.7 166.0,490.5 C 174.1,505.4 174.8,479.8 185.9,498.2 C 196.9,516.5 182.3,519.7 193.5,536.4 C 204.8,553.2 201.1,541.6 213.9,540.0 C 226.8,538.4 215.3,533.4 225.7,532.4 C 236.1,531.3 218.5,544.2 240.0,537.5 C 261.4,530.7 250.1,525.5 279.3,515.5 C 308.5,505.5 296.2,511.5 313.0,512.5 C 329.7,513.5 317.2,520.9 321.1,518.1 C 325.0,515.2 315.5,514.7 322.6,505.3 C 329.8,496.0 326.1,507.9 339.0,494.6 C 351.8,481.4 344.8,482.0 354.8,472.2 C 364.8,462.4 359.7,474.4 364.0,470.2 C 368.3,465.9 356.1,472.9 365.5,461.5 C 374.9,450.1 379.1,452.4 387.5,441.6 C 395.8,430.8 374.8,447.9 386.4,434.5 C 398.1,421.0 407.0,421.0 416.6,408.0 C 426.1,394.9 409.4,408.0 410.4,401.8 C 411.5,395.7 417.5,398.8 419.1,392.7 C 420.7,386.5 414.9,399.6 414.5,386.5 C 414.1,373.5 403.6,393.7 418.1,360.0 C 432.6,326.4 436.7,331.6 450.7,302.4 C 464.8,273.3 445.7,300.4 453.3,287.1 C 460.9,273.9 463.3,285.6 469.6,269.3 C 476.0,253.0 472.2,260.4 469.1,246.4 C 466.1,232.3 461.8,251.0 462.0,234.1 C 462.2,217.2 447.8,228.7 469.6,204.0 C 491.5,179.4 481.7,200.6 516.6,172.4 C 551.5,144.3 535.5,159.2 556.9,133.7 C 578.3,108.2 551.8,123.4 570.2,108.7 C 588.5,94.0 581.8,108.4 602.8,97.0 C 623.9,85.6 607.8,87.7 622.7,80.2 C 637.6,72.6 630.1,83.6 640.1,78.1 C 650.1,72.6 641.6,70.3 647.8,66.4 C 653.9,62.5 650.5,76.8 655.4,68.4 C 660.3,60.1 664.7,64.7 660.0,45.5 C 655.3,26.3 660.4,30.7 643.7,20.5 Z';

// -- Island silhouette (black, centered top) ----------------------------------

function IslandSilhouette() {
  return (
    <svg
      viewBox="0 0 680 560"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: '6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: '70%',
        opacity: 0.09,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <path d={TENERIFE_PATH} fill="#000000" />
    </svg>
  );
}

// -- Volcanic stone border color ----------------------------------------------
const STONE = '#9ca3af';

// -- Static hub cards ---------------------------------------------------------

interface StaticHub {
  color: string;
  labelEs: string;
  labelEn: string;
  labelDe: string;
  subEs: string;
  subEn: string;
  subDe: string;
  hrefEs: string;
  hrefEn: string;
  hrefDe: string;
}

const STATIC_HUBS: StaticHub[] = [
  {
    color: '#2a9e60',
    labelEs: 'Senderismo',
    labelEn: 'Hiking',
    labelDe: 'Wandern',
    subEs: 'Rutas marcadas',
    subEn: 'Marked trails',
    subDe: 'Markierte Routen',
    hrefEs: '/es/tenerife/senderos',
    hrefEn: '/en/tenerife/senderos',
    hrefDe: '/de/tenerife/senderos',
  },
  {
    color: '#6e42b8',
    labelEs: 'Cultura',
    labelEn: 'Culture',
    labelDe: 'Kultur',
    subEs: 'Historia y arte',
    subEn: 'History & art',
    subDe: 'Geschichte & Kunst',
    hrefEs: '/es/tenerife/cultura',
    hrefEn: '/en/tenerife/cultura',
    hrefDe: '/de/tenerife/cultura',
  },
  {
    color: '#2ea86e',
    labelEs: 'Naturaleza',
    labelEn: 'Nature',
    labelDe: 'Natur',
    subEs: 'Parques y flora',
    subEn: 'Parks & flora',
    subDe: 'Parks & Flora',
    hrefEs: '/es/tenerife/naturaleza',
    hrefEn: '/en/tenerife/naturaleza',
    hrefDe: '/de/tenerife/naturaleza',
  },
  {
    color: '#d97706',
    labelEs: 'Lo imprescindible',
    labelEn: 'Must-sees',
    labelDe: 'Top-Sehensw\u00FCrdigkeiten',
    subEs: 'Top lugares',
    subEn: 'Top spots',
    subDe: 'Beste Orte',
    hrefEs: '/es/tenerife/top',
    hrefEn: '/en/tenerife/top',
    hrefDe: '/de/tenerife/top',
  },
];

// -- Labels -------------------------------------------------------------------

const GUIDE_BADGE: Record<Locale, string> = {
  es: 'Gu\u00EDa',
  en: 'Guide',
  de: 'Ratgeber',
};

const BEACH_COLOR = '#2090c0';

// -- Card shell ---------------------------------------------------------------

function HubCard({
  href,
  color,
  badge,
  label,
  sub,
  ariaLabel,
}: {
  href: string;
  color: string;
  badge: string;
  label: string;
  sub?: string;
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      style={{
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
        background: 'white',
        border: '0.5px solid #e5e7eb',
        borderLeft: '3px solid #111827',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >
      <IslandSilhouette />

      {/* Badge — top left */}
      <div style={{ position: 'absolute', top: '12px', left: '14px', zIndex: 1 }}>
        <span style={{
          fontSize: '9px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {badge}
        </span>
      </div>

      {/* Title — bottom */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '0 12px 14px 14px',
        width: '100%',
      }}>
        <p style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#111827',
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
            color: '#9ca3af',
            margin: 0,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.02em',
          }}>
            {sub}
          </p>
        )}
      </div>
    </a>
  );
}

// -- Component ----------------------------------------------------------------

interface HubCarouselProps {
  locale: Locale;
  island?: string;
}

export function HubCarousel({ locale, island = 'tenerife' }: HubCarouselProps) {
  const guides = getGuides(locale, island as import('@/lib/types').Island);
  const badge = GUIDE_BADGE[locale];

  const guideCards = guides.map((guide) => (
    <HubCard
      key={guide.slug}
      href={'/'+locale+'/'+island+'/guia/'+guide.slug}
      color={BEACH_COLOR}
      badge={badge}
      ariaLabel={guide.title}
      label={guide.title}
    />
  ));

  const staticCards = STATIC_HUBS.map((hub) => {
    const label = locale === 'en' ? hub.labelEn : locale === 'de' ? hub.labelDe : hub.labelEs;
    const sub = locale === 'en' ? hub.subEn : locale === 'de' ? hub.subDe : hub.subEs;
    const href = locale === 'en' ? hub.hrefEn : locale === 'de' ? hub.hrefDe : hub.hrefEs;
    return (
      <HubCard
        key={hub.labelEs}
        href={href}
        color={hub.color}
        badge={badge}
        ariaLabel={label}
        label={label}
        sub={sub}
      />
    );
  });

  return (
    <section style={{ padding: '0 0 8px' }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '4px 16px 12px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
        }}
        className="hub-carousel-row"
      >
        {guideCards}
        {staticCards}
      </div>
      <style>{'.hub-carousel-row::-webkit-scrollbar { display: none; }'}</style>
    </section>
  );
}
