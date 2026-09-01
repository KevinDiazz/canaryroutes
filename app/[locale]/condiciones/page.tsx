import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/types';
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';
import { withTrailingSlash } from '@/lib/i18n';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const CONTENT: Record<Locale, { title: string; meta: string; metaDesc: string; back: string }> = {
  es: { title: 'Condiciones de Uso', meta: 'Condiciones de Uso — CanaryRoutes', metaDesc: 'Condiciones de uso del sitio web CanaryRoutes.', back: 'Inicio' },
  en: { title: 'Terms of Use', meta: 'Terms of Use — CanaryRoutes', metaDesc: 'Terms and conditions for using the CanaryRoutes website.', back: 'Home' },
  de: { title: 'Nutzungsbedingungen', meta: 'Nutzungsbedingungen — CanaryRoutes', metaDesc: 'Nutzungsbedingungen für die Website CanaryRoutes.', back: 'Startseite' },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;
  const url = withTrailingSlash(`${SITE_URL}/${locale}/condiciones`);
  return {
    title: c.meta,
    description: c.metaDesc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/condiciones`)])),
    },
    robots: { index: false },
  };
}

export default async function CondicionesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;

  if (locale === 'en') return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Acceptance of terms">
        <p>By accessing and using CanaryRoutes you accept these Terms of Use in full. If you disagree with any part of them, please do not use this website.</p>
      </LegalSection>
      <LegalSection title="Nature of the service">
        <p>CanaryRoutes is a free digital tourism guide offering information about points of interest, routes and activities in the Canary Islands. The site does not sell products or services directly to users.</p>
      </LegalSection>
      <LegalSection title="Affiliate links">
        <p>Some links on this site are affiliate links. When you click on them and make a purchase or booking, CanaryRoutes may receive a commission from the partner (GetYourGuide, Rentalcars, etc.) at no additional cost to you. The presence of affiliate links does not affect the objectivity of our recommendations.</p>
      </LegalSection>
      <LegalSection title="Intellectual property">
        <p>All content on this website — texts, images, maps, design and code — is the property of Kevin Díaz or their respective rights holders. Any reproduction, distribution or public communication without prior written authorisation is prohibited.</p>
      </LegalSection>
      <LegalSection title="Limitation of liability">
        <p>The tourist information provided is for guidance only. CanaryRoutes does not guarantee the accuracy, completeness or availability of the information at all times. We are not responsible for decisions made based on the content of this site, nor for the services provided by third parties linked from it.</p>
      </LegalSection>
      <LegalSection title="External links">
        <p>This site contains links to third-party websites. CanaryRoutes has no control over their content and accepts no responsibility for it.</p>
      </LegalSection>
      <LegalSection title="Modifications">
        <p>CanaryRoutes reserves the right to modify these terms at any time. Continued use of the site after such changes constitutes acceptance of the new terms.</p>
      </LegalSection>
      <LegalSection title="Applicable law">
        <p>These terms are governed by Spanish law. Any dispute will be submitted to the courts of Las Palmas de Gran Canaria, Spain.</p>
      </LegalSection>
    </LegalPageLayout>
  );

  if (locale === 'de') return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Akzeptanz der Bedingungen">
        <p>Durch den Zugriff auf und die Nutzung von CanaryRoutes akzeptieren Sie diese Nutzungsbedingungen vollständig. Wenn Sie mit einem Teil davon nicht einverstanden sind, nutzen Sie diese Website bitte nicht.</p>
      </LegalSection>
      <LegalSection title="Art des Dienstes">
        <p>CanaryRoutes ist ein kostenloser digitaler Reiseführer, der Informationen über Sehenswürdigkeiten, Routen und Aktivitäten auf den Kanarischen Inseln anbietet. Die Website verkauft keine Produkte oder Dienstleistungen direkt an Benutzer.</p>
      </LegalSection>
      <LegalSection title="Affiliate-Links">
        <p>Einige Links auf dieser Website sind Affiliate-Links. Wenn Sie darauf klicken und einen Kauf oder eine Buchung tätigen, kann CanaryRoutes eine Provision vom Partner (GetYourGuide, Rentalcars usw.) erhalten, ohne dass Ihnen zusätzliche Kosten entstehen.</p>
      </LegalSection>
      <LegalSection title="Geistiges Eigentum">
        <p>Alle Inhalte dieser Website — Texte, Bilder, Karten, Design und Code — sind Eigentum von Kevin Díaz oder ihrer jeweiligen Rechteinhaber. Jede Vervielfältigung ohne vorherige schriftliche Genehmigung ist untersagt.</p>
      </LegalSection>
      <LegalSection title="Haftungsbeschränkung">
        <p>Die bereitgestellten Touristeninformationen dienen nur zur Orientierung. CanaryRoutes übernimmt keine Garantie für die Richtigkeit, Vollständigkeit oder jederzeitige Verfügbarkeit der Informationen.</p>
      </LegalSection>
      <LegalSection title="Anwendbares Recht">
        <p>Diese Bedingungen unterliegen dem spanischen Recht. Streitigkeiten werden den Gerichten von Las Palmas de Gran Canaria, Spanien, vorgelegt.</p>
      </LegalSection>
    </LegalPageLayout>
  );

  return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      <LegalSection title="Aceptación de las condiciones">
        <p>Al acceder y utilizar CanaryRoutes aceptas plenamente estas Condiciones de Uso. Si no estás de acuerdo con alguna parte de las mismas, por favor no utilices este sitio web.</p>
      </LegalSection>
      <LegalSection title="Naturaleza del servicio">
        <p>CanaryRoutes es una guía turística digital gratuita que ofrece información sobre lugares de interés, rutas y actividades en las Islas Canarias. El sitio no vende productos ni servicios directamente a los usuarios.</p>
      </LegalSection>
      <LegalSection title="Enlaces de afiliación">
        <p>Algunos enlaces de este sitio son enlaces de afiliado. Al hacer clic en ellos y realizar una compra o reserva, CanaryRoutes puede recibir una comisión del partner (GetYourGuide, Rentalcars, etc.) sin coste adicional para ti. La presencia de enlaces de afiliado no afecta a la objetividad de nuestras recomendaciones.</p>
      </LegalSection>
      <LegalSection title="Propiedad intelectual">
        <p>Todos los contenidos de este sitio web — textos, imágenes, mapas, diseño y código — son propiedad de Kevin Díaz o de sus respectivos titulares. Queda prohibida cualquier reproducción, distribución o comunicación pública sin autorización previa y por escrito.</p>
      </LegalSection>
      <LegalSection title="Limitación de responsabilidad">
        <p>La información turística proporcionada tiene carácter orientativo. CanaryRoutes no garantiza la exactitud, completitud ni disponibilidad permanente de la información. No somos responsables de las decisiones tomadas en base al contenido de este sitio, ni de los servicios prestados por terceros enlazados desde él.</p>
      </LegalSection>
      <LegalSection title="Enlaces externos">
        <p>Este sitio contiene enlaces a sitios web de terceros. CanaryRoutes no tiene control sobre su contenido y no asume ninguna responsabilidad al respecto.</p>
      </LegalSection>
      <LegalSection title="Modificaciones">
        <p>CanaryRoutes se reserva el derecho de modificar estas condiciones en cualquier momento. El uso continuado del sitio tras dichas modificaciones implica la aceptación de los nuevos términos.</p>
      </LegalSection>
      <LegalSection title="Legislación aplicable">
        <p>Estas condiciones se rigen por la legislación española. Cualquier controversia se someterá a los juzgados y tribunales de Las Palmas de Gran Canaria.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
