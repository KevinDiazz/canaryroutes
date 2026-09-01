import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/types';
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import { withTrailingSlash } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const CONTENT: Record<Locale, { title: string; meta: string; metaDesc: string; back: string }> = {
  es: { title: 'Política de Privacidad', meta: 'Política de Privacidad — CanaryRoutes', metaDesc: 'Cómo CanaryRoutes trata los datos de sus usuarios en cumplimiento del RGPD.', back: 'Inicio' },
  en: { title: 'Privacy Policy', meta: 'Privacy Policy — CanaryRoutes', metaDesc: 'How CanaryRoutes handles user data in compliance with the GDPR.', back: 'Home' },
  de: { title: 'Datenschutzerklärung', meta: 'Datenschutzerklärung — CanaryRoutes', metaDesc: 'Wie CanaryRoutes mit Nutzerdaten gemäß der DSGVO umgeht.', back: 'Startseite' },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;
  const url = withTrailingSlash(`${SITE_URL}/${locale}/privacidad`);
  return {
    title: c.meta,
    description: c.metaDesc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/privacidad`)])),
    },
    robots: { index: false },
  };
}

export default async function PrivacidadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;

  if (locale === 'en') return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Data controller">
        <p>The data controller is Kevin Díaz, reachable at <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a>.</p>
      </LegalSection>
      <LegalSection title="Data we collect">
        <p>CanaryRoutes does not require user registration and does not collect personal data directly through forms. The only data processed is that generated automatically by your browser when visiting the site (IP address, browser type, pages visited), handled exclusively through the analytics tools described below.</p>
      </LegalSection>
      <LegalSection title="Analytics (Google Analytics 4)">
        <p>We use Google Analytics 4 to understand how users interact with our content. This tool collects anonymised data about your visit (pages viewed, time spent, approximate location by country). IP addresses are anonymised before storage. You can opt out at <a href="https://tools.google.com/dlpage/gaoptout" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a>.</p>
      </LegalSection>
      <LegalSection title="Third-party services">
        <p>CanaryRoutes integrates widgets from GetYourGuide to display tours and activities. These widgets may load cookies from GetYourGuide. Please refer to <a href="https://www.getyourguide.com/c/privacy" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">GetYourGuide&apos;s Privacy Policy</a> for more information.</p>
      </LegalSection>
      <LegalSection title="Affiliate links">
        <p>Some links on this site are affiliate links (GetYourGuide, Rentalcars). Clicking them may set cookies from those platforms on your device. We do not share your data with these partners beyond what is inherent to clicking a link.</p>
      </LegalSection>
      <LegalSection title="Your rights (GDPR)">
        <p>Under the GDPR you have the right to access, rectify, erase, restrict, and port your data, as well as the right to object to processing. To exercise these rights, contact us at <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a>. You also have the right to lodge a complaint with your national supervisory authority.</p>
      </LegalSection>
      <LegalSection title="Data retention">
        <p>We do not store personal data on our own servers. Analytics data is retained by Google Analytics for 14 months by default.</p>
      </LegalSection>
      <LegalSection title="Changes to this policy">
        <p>We may update this policy as our services evolve. The date of the last update will be indicated at the bottom of this page. Last updated: June 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  );

  if (locale === 'de') return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Verantwortlicher">
        <p>Verantwortlicher ist Kevin Díaz, erreichbar unter <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a>.</p>
      </LegalSection>
      <LegalSection title="Welche Daten wir erheben">
        <p>CanaryRoutes erfordert keine Benutzerregistrierung und erhebt keine personenbezogenen Daten direkt über Formulare. Die einzigen verarbeiteten Daten sind die, die Ihr Browser beim Besuch der Website automatisch generiert (IP-Adresse, Browsertyp, besuchte Seiten), die ausschließlich über die unten beschriebenen Analysetools verarbeitet werden.</p>
      </LegalSection>
      <LegalSection title="Analyse (Google Analytics 4)">
        <p>Wir verwenden Google Analytics 4, um zu verstehen, wie Nutzer mit unseren Inhalten interagieren. Dieses Tool erfasst anonymisierte Daten über Ihren Besuch. IP-Adressen werden vor der Speicherung anonymisiert. Sie können sich unter <a href="https://tools.google.com/dlpage/gaoptout" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a> abmelden.</p>
      </LegalSection>
      <LegalSection title="Drittanbieterdienste">
        <p>CanaryRoutes integriert Widgets von GetYourGuide zur Anzeige von Touren und Aktivitäten. Diese Widgets können Cookies von GetYourGuide laden. Weitere Informationen finden Sie in der <a href="https://www.getyourguide.com/c/privacy" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Datenschutzerklärung von GetYourGuide</a>.</p>
      </LegalSection>
      <LegalSection title="Affiliate-Links">
        <p>Einige Links auf dieser Website sind Affiliate-Links (GetYourGuide, Rentalcars). Das Anklicken dieser Links kann dazu führen, dass Cookies dieser Plattformen auf Ihrem Gerät gesetzt werden.</p>
      </LegalSection>
      <LegalSection title="Ihre Rechte (DSGVO)">
        <p>Gemäß der DSGVO haben Sie das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung und Übertragbarkeit Ihrer Daten sowie das Widerspruchsrecht. Wenden Sie sich dazu an <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a>. Sie haben auch das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen.</p>
      </LegalSection>
      <LegalSection title="Datenspeicherung">
        <p>Wir speichern keine personenbezogenen Daten auf unseren eigenen Servern. Analysedaten werden von Google Analytics standardmäßig 14 Monate lang aufbewahrt.</p>
      </LegalSection>
      <LegalSection title="Änderungen dieser Richtlinie">
        <p>Wir können diese Richtlinie aktualisieren, wenn sich unsere Dienste weiterentwickeln. Letzte Aktualisierung: Juni 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  );

  return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Responsable del tratamiento">
        <p>El responsable del tratamiento de datos es Kevin Díaz, contacto: <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a>.</p>
      </LegalSection>
      <LegalSection title="Datos que recabamos">
        <p>CanaryRoutes no requiere registro de usuarios y no recaba datos personales directamente mediante formularios. Los únicos datos tratados son los generados automáticamente por tu navegador al visitar el sitio (dirección IP, tipo de navegador, páginas visitadas), gestionados exclusivamente a través de las herramientas de analítica descritas a continuación.</p>
      </LegalSection>
      <LegalSection title="Analítica (Google Analytics 4)">
        <p>Utilizamos Google Analytics 4 para entender cómo los usuarios interactúan con nuestros contenidos. Esta herramienta recaba datos anonimizados sobre tu visita (páginas vistas, tiempo de permanencia, ubicación aproximada por país). Las direcciones IP se anonimizan antes de su almacenamiento. Puedes desactivarlo en <a href="https://tools.google.com/dlpage/gaoptout" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a>.</p>
      </LegalSection>
      <LegalSection title="Servicios de terceros">
        <p>CanaryRoutes integra widgets de GetYourGuide para mostrar tours y actividades. Estos widgets pueden cargar cookies de GetYourGuide. Consulta la <a href="https://www.getyourguide.com/c/privacy" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Política de Privacidad de GetYourGuide</a> para más información.</p>
      </LegalSection>
      <LegalSection title="Enlaces de afiliación">
        <p>Algunos enlaces de este sitio son enlaces de afiliado (GetYourGuide, Rentalcars). Al hacer clic en ellos, los sitios de destino pueden instalar cookies en tu dispositivo. No compartimos tus datos con estos partners más allá de lo inherente a hacer clic en un enlace.</p>
      </LegalSection>
      <LegalSection title="Tus derechos (RGPD)">
        <p>En virtud del RGPD tienes derecho de acceso, rectificación, supresión, limitación, portabilidad y oposición al tratamiento de tus datos. Para ejercerlos, contacta en <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a>. También puedes presentar una reclamación ante la <a href="https://www.aepd.es" style={{ color: '#0e4f72' }} target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos (aepd.es)</a>.</p>
      </LegalSection>
      <LegalSection title="Conservación de datos">
        <p>No almacenamos datos personales en nuestros propios servidores. Los datos de analítica son conservados por Google Analytics durante 14 meses por defecto.</p>
      </LegalSection>
      <LegalSection title="Cambios en esta política">
        <p>Podemos actualizar esta política conforme evolucionen nuestros servicios. Última actualización: junio de 2026.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
