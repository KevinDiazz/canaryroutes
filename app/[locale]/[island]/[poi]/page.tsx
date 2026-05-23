import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOI, getAllPOISlugs } from '@/lib/content';
import { AudioPlayer } from '@/components/audio-player';
import { LanguageSwitcher } from '@/components/language-switcher';
import { getIslandDisplayName } from '@/lib/i18n';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    islands.flatMap((island) =>
      getAllPOISlugs(island).map((poi) => ({ locale, island, poi }))
    )
  );
}

export default async function POIPage({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string }>;
}) {
  const { locale: rawLocale, island: rawIsland, poi: poiSlug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const poi = getPOI(locale, island, poiSlug);
  if (!poi) notFound();

  const islandName = getIslandDisplayName(island, locale);

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
          <Link href={`/${locale}`} style={{ color: '#1f9d61', textDecoration: 'none' }}>Mapa</Link>
          <span style={{ color: '#d1d5db' }}>›</span>
          <Link href={`/${locale}/${island}`} style={{ color: '#1f9d61', textDecoration: 'none' }}>{islandName}</Link>
          <span style={{ color: '#d1d5db' }}>›</span>
          <span style={{ color: '#6b7280' }}>{poi.name}</span>
        </nav>
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {/* POI header */}
      <div style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '56px', display: 'block', marginBottom: '12px' }}>{poi.emoji ?? '📍'}</span>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '700',
          fontFamily: "'Cormorant Garamond', serif",
          marginBottom: '4px',
          color: '#1f2937',
          lineHeight: 1.2,
        }}>
          {poi.name}
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '0' }}>{poi.shortDescription}</p>
      </div>

      {/* Meta badges */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
        {poi.visitDuration && (
          <span style={{ padding: '4px 12px', background: '#f3f4f6', borderRadius: '20px', fontSize: '13px', color: '#374151' }}>
            ⏱ {poi.visitDuration}
          </span>
        )}
        {poi.difficulty && (
          <span style={{ padding: '4px 12px', background: '#f3f4f6', borderRadius: '20px', fontSize: '13px', color: '#374151', textTransform: 'capitalize' }}>
            {poi.difficulty === 'easy' ? '🟢' : poi.difficulty === 'moderate' ? '🟡' : '🔴'} {poi.difficulty}
          </span>
        )}
        <span style={{ padding: '4px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '13px', color: '#15803d', textTransform: 'capitalize' }}>
          {poi.category}
        </span>
      </div>

      {/* Description */}
      <p style={{ marginTop: '28px', lineHeight: '1.8', fontSize: '17px', color: '#374151' }}>{poi.description}</p>

      {/* Audio preview */}
      {poi.audioPreview && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '12px', fontFamily: "'Cormorant Garamond', serif" }}>
            Preview de audioguía
          </h2>
          <AudioPlayer src={poi.audioPreview} label={`Preview — ${poi.name}`} />
        </div>
      )}

      {/* Tags */}
      <div style={{ marginTop: '28px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {poi.tags.map((tag) => (
          <span key={tag} style={{
            padding: '4px 10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '20px',
            fontSize: '13px',
            color: '#15803d',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Premium CTA if applicable */}
      {poi.hasPremiumAudio && poi.premiumRouteId && (
        <div style={{
          marginTop: '40px',
          padding: '24px',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          borderRadius: '16px',
          border: '1px solid #86efac',
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#15803d', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>
            🎧 Audioguía premium disponible
          </h3>
          <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
            Desbloquea la audioguía completa de esta parada y todas las de la ruta por un único pago.
          </p>
          <Link
            href={`/${locale}/${island}/routes/${poi.premiumRouteId}`}
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: '#1f9d61',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '15px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Ver ruta premium →
          </Link>
        </div>
      )}
    </main>
  );
}
