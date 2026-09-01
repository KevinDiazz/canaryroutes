import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/types';
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import { withTrailingSlash } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const CONTENT: Record<Locale, { title: string; meta: string; metaDesc: string; back: string }> = {
  es: { title: 'Política de Cookies', meta: 'Política de Cookies — CanaryRoutes', metaDesc: 'Información sobre el uso de cookies en CanaryRoutes.', back: 'Inicio' },
  en: { title: 'Cookie Policy', meta: 'Cookie Policy — CanaryRoutes', metaDesc: 'Information about the use of cookies on CanaryRoutes.', back: 'Home' },
  de: { title: 'Cookie-Richtlinie', meta: 'Cookie-Richtlinie — CanaryRoutes', metaDesc: 'Informationen über die Verwendung von Cookies auf CanaryRoutes.', back: 'Startseite' },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;
  const url = withTrailingSlash(`${SITE_URL}/${locale}/cookies`);
  return {
    title: c.meta,
    description: c.metaDesc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/cookies`)])),
    },
    robots: { index: false },
  };
}

const TABLE_STYLE: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse',
  fontSize: '14px', fontFamily: "'Outfit', sans-serif",
};
const TH: React.CSSProperties = {
  background: '#0a1628', color: 'white', padding: '10px 14px',
  textAlign: 'left', fontWeight: '700', fontSize: '12px',
  letterSpacing: '0.04em',
};
const TD: React.CSSProperties = {
  padding: '10px 14px', borderBottom: '1px solid #e2e8f0',
  verticalAlign: 'top', color: '#475569',
};

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;

  if (locale === 'en') return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="What are cookies?">
        <p>Cookies are small text files that websites store on your device when you visit them. They are used to remember your preferences, analyse usage and personalise content.</p>
      </LegalSection>
      <LegalSection title="Cookies we use">
        <table style={TABLE_STYLE}>
          <thead>
            <tr>
              <th style={TH}>Cookie</th>
              <th style={TH}>Type</th>
              <th style={TH}>Purpose</th>
              <th style={TH}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={TD}>_ga, _ga_*</td>
              <td style={TD}>Analytics</td>
              <td style={TD}>Google Analytics 4 — anonymised usage statistics</td>
              <td style={TD}>2 years</td>
            </tr>
            <tr>
              <td style={TD}>GYG widgets</td>
              <td style={TD}>Third party</td>
              <td style={TD}>GetYourGuide — displaying tours and activities</td>
              <td style={TD}>Session</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>
      <LegalSection title="How to manage cookies">
        <p>You can configure your browser to block or delete cookies at any time. Here are the instructions for the main browsers:</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li><a href="https://support.google.com/chrome/answer/95647" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
        <p style={{ marginTop: '12px' }}>Blocking analytics cookies will not affect your ability to browse the site.</p>
      </LegalSection>
      <LegalSection title="Last updated">
        <p>June 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  );

  if (locale === 'de') return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Was sind Cookies?">
        <p>Cookies sind kleine Textdateien, die Websites beim Besuch auf Ihrem Gerät speichern. Sie dienen dazu, Ihre Einstellungen zu speichern, die Nutzung zu analysieren und Inhalte zu personalisieren.</p>
      </LegalSection>
      <LegalSection title="Von uns verwendete Cookies">
        <table style={TABLE_STYLE}>
          <thead>
            <tr>
              <th style={TH}>Cookie</th>
              <th style={TH}>Typ</th>
              <th style={TH}>Zweck</th>
              <th style={TH}>Dauer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={TD}>_ga, _ga_*</td>
              <td style={TD}>Analyse</td>
              <td style={TD}>Google Analytics 4 — anonymisierte Nutzungsstatistiken</td>
              <td style={TD}>2 Jahre</td>
            </tr>
            <tr>
              <td style={TD}>GYG-Widgets</td>
              <td style={TD}>Drittanbieter</td>
              <td style={TD}>GetYourGuide — Anzeige von Touren und Aktivitäten</td>
              <td style={TD}>Sitzung</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>
      <LegalSection title="Cookie-Verwaltung">
        <p>Sie können Ihren Browser jederzeit so konfigurieren, dass Cookies blockiert oder gelöscht werden. Letzte Aktualisierung: Juni 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  );

  return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="¿Qué son las cookies?">
        <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas. Se utilizan para recordar tus preferencias, analizar el uso y personalizar el contenido.</p>
      </LegalSection>
      <LegalSection title="Cookies que utilizamos">
        <table style={TABLE_STYLE}>
          <thead>
            <tr>
              <th style={TH}>Cookie</th>
              <th style={TH}>Tipo</th>
              <th style={TH}>Finalidad</th>
              <th style={TH}>Duración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={TD}>_ga, _ga_*</td>
              <td style={TD}>Analítica</td>
              <td style={TD}>Google Analytics 4 — estadísticas de uso anonimizadas</td>
              <td style={TD}>2 años</td>
            </tr>
            <tr>
              <td style={TD}>Widgets GYG</td>
              <td style={TD}>Terceros</td>
              <td style={TD}>GetYourGuide — mostrar tours y actividades</td>
              <td style={TD}>Sesión</td>
            </tr>
          </tbody>
        </table>
      </LegalSection>
      <LegalSection title="Cómo gestionar las cookies">
        <p>Puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento. Instrucciones para los principales navegadores:</p>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li><a href="https://support.google.com/chrome/answer/95647?hl=es" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/limpiar-cookies-y-datos-de-sitios-en-firefox" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
        <p style={{ marginTop: '12px' }}>Bloquear las cookies analíticas no afectará a tu capacidad de navegar por el sitio.</p>
      </LegalSection>
      <LegalSection title="Última actualización">
        <p>Junio de 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
