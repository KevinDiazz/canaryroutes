import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/types';
import { LegalPageLayout } from '@/components/legal-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';
const CONTACT_EMAIL = 'lobuenoexiste@gmail.com';

const CONTENT: Record<Locale, {
  title: string; meta: string; metaDesc: string; back: string;
  intro: string; emailLabel: string; responseTime: string;
  topics: string; topicList: string[];
  btnLabel: string;
}> = {
  es: {
    title: 'Contacto',
    meta: 'Contacto — CanaryRoutes',
    metaDesc: 'Contacta con CanaryRoutes para consultas, sugerencias o colaboraciones.',
    back: 'Inicio',
    intro: '¿Tienes alguna pregunta, sugerencia o quieres proponer una colaboración? Escríbenos y te responderemos en un plazo de 48 horas laborables.',
    emailLabel: 'Correo electrónico',
    responseTime: 'Tiempo de respuesta: 48 horas laborables',
    topics: '¿En qué podemos ayudarte?',
    topicList: [
      'Información sobre lugares o rutas en Canarias',
      'Correcciones o sugerencias de contenido',
      'Propuestas de colaboración o afiliación',
      'Cuestiones legales o de privacidad',
    ],
    btnLabel: 'Enviar email',
  },
  en: {
    title: 'Contact',
    meta: 'Contact — CanaryRoutes',
    metaDesc: 'Get in touch with CanaryRoutes for enquiries, suggestions or collaborations.',
    back: 'Home',
    intro: 'Do you have a question, suggestion or want to propose a collaboration? Write to us and we will reply within 48 working hours.',
    emailLabel: 'Email address',
    responseTime: 'Response time: 48 working hours',
    topics: 'How can we help?',
    topicList: [
      'Information about places or routes in the Canary Islands',
      'Content corrections or suggestions',
      'Collaboration or affiliate proposals',
      'Legal or privacy matters',
    ],
    btnLabel: 'Send email',
  },
  de: {
    title: 'Kontakt',
    meta: 'Kontakt — CanaryRoutes',
    metaDesc: 'Nehmen Sie Kontakt mit CanaryRoutes auf für Anfragen, Vorschläge oder Kooperationen.',
    back: 'Startseite',
    intro: 'Haben Sie eine Frage, einen Vorschlag oder möchten Sie eine Zusammenarbeit vorschlagen? Schreiben Sie uns und wir antworten innerhalb von 48 Werktagen.',
    emailLabel: 'E-Mail-Adresse',
    responseTime: 'Antwortzeit: 48 Werktage',
    topics: 'Wie können wir helfen?',
    topicList: [
      'Informationen über Orte oder Routen auf den Kanarischen Inseln',
      'Inhaltliche Korrekturen oder Vorschläge',
      'Kooperations- oder Affiliate-Vorschläge',
      'Rechtliche oder datenschutzbezogene Angelegenheiten',
    ],
    btnLabel: 'E-Mail senden',
  },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;
  const url = `${SITE_URL}/${locale}/contacto`;
  return {
    title: c.meta,
    description: c.metaDesc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/contacto`])),
    },
  };
}

export default async function ContactoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = CONTENT[locale] ?? CONTENT.es;

  return (
    <LegalPageLayout locale={locale} title={t.title} backLabel={t.back}>

      {/* Intro */}
      <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.8', margin: 0 }}>
        {t.intro}
      </p>

      {/* Email card */}
      <div style={{
        background: 'white',
        border: '1.5px solid #e2e8f0',
        borderLeft: '4px solid #0e4f72',
        borderRadius: '16px',
        padding: '28px 24px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        boxShadow: '0 2px 12px rgba(14,79,114,0.07)',
      }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
            {t.emailLabel}
          </p>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0a1628', fontFamily: "'Outfit', sans-serif" }}>
            {CONTACT_EMAIL}
          </p>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
          {t.responseTime}
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#0a1628', color: 'white',
            borderRadius: '10px', padding: '12px 20px',
            textDecoration: 'none', fontSize: '13px',
            fontWeight: '800', fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em', alignSelf: 'flex-start',
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          {t.btnLabel}
        </a>
      </div>

      {/* Topics */}
      <div>
        <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
          {t.topics}
        </p>
        <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {t.topicList.map((item) => (
            <li key={item} style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

    </LegalPageLayout>
  );
}
