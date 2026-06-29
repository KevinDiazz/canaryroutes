import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/types';
import { LegalPageLayout, LegalSection } from '@/components/legal-page-layout';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const CONTENT: Record<Locale, {
  title: string; meta: string; metaDesc: string; back: string;
  sections: { heading: string; body: React.ReactNode }[];
}> = {
  es: {
    title: 'Aviso Legal',
    meta: 'Aviso Legal — CanaryRoutes',
    metaDesc: 'Información legal sobre el titular y las condiciones de uso de CanaryRoutes.',
    back: 'Inicio',
    sections: [
      {
        heading: 'Titular del sitio web',
        body: (
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa:
            <br /><br />
            <strong>Titular:</strong> Kevin Díaz<br />
            <strong>Domicilio:</strong> Las Palmas de Gran Canaria, Las Palmas<br />
            <strong>Contacto:</strong> <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a><br />
            <br />
            Para cualquier información adicional sobre el responsable, puede ponerse en contacto a través del correo indicado.
          </p>
        ),
      },
      {
        heading: 'Objeto y actividad',
        body: (
          <p>
            CanaryRoutes (<strong>canaryroutes.com</strong>) es una plataforma turística digital que ofrece información sobre lugares de interés, rutas y actividades en las Islas Canarias. El acceso y uso del sitio web es gratuito para los usuarios.
          </p>
        ),
      },
      {
        heading: 'Actividad de afiliación',
        body: (
          <p>
            Este sitio web participa en programas de afiliación con terceros, entre ellos GetYourGuide y Rentalcars. Algunos de los enlaces publicados son enlaces de afiliado: si realizas una reserva o compra a través de ellos, CanaryRoutes puede recibir una comisión sin coste adicional para ti. Esta práctica está regulada por la Ley 3/1991 de Competencia Desleal y la normativa de publicidad aplicable.
          </p>
        ),
      },
      {
        heading: 'Propiedad intelectual',
        body: (
          <p>
            Los contenidos de este sitio web (textos, imágenes, diseño, código) son propiedad de Kevin Díaz o de sus respectivos autores, y están protegidos por la legislación española e internacional de propiedad intelectual. Queda prohibida su reproducción total o parcial sin autorización expresa.
          </p>
        ),
      },
      {
        heading: 'Responsabilidad',
        body: (
          <p>
            CanaryRoutes no se responsabiliza de la disponibilidad, exactitud o contenido de los servicios de terceros enlazados desde este sitio. La información turística se ofrece con fines orientativos y puede variar sin previo aviso.
          </p>
        ),
      },
      {
        heading: 'Legislación aplicable',
        body: (
          <p>
            Este aviso legal se rige por la legislación española. Para cualquier controversia derivada del uso de este sitio web, las partes se someten a los juzgados y tribunales de Las Palmas de Gran Canaria.
          </p>
        ),
      },
    ],
  },
  en: {
    title: 'Legal Notice',
    meta: 'Legal Notice — CanaryRoutes',
    metaDesc: 'Legal information about the owner and terms of use of CanaryRoutes.',
    back: 'Home',
    sections: [
      {
        heading: 'Website owner',
        body: (
          <p>
            In compliance with Article 10 of Spanish Law 34/2002 on Information Society Services (LSSI-CE):
            <br /><br />
            <strong>Owner:</strong> Kevin Díaz<br />
            <strong>Address:</strong> Las Palmas de Gran Canaria, Las Palmas, Spain<br />
            <strong>Contact:</strong> <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a><br />
            <br />
            For any additional information about the data controller, please contact us at the email address provided.
          </p>
        ),
      },
      {
        heading: 'Purpose and activity',
        body: (
          <p>
            CanaryRoutes (<strong>canaryroutes.com</strong>) is a digital tourism platform providing information about points of interest, routes and activities in the Canary Islands. Access to and use of the website is free for users.
          </p>
        ),
      },
      {
        heading: 'Affiliate activity',
        body: (
          <p>
            This website participates in affiliate programmes with third parties, including GetYourGuide and Rentalcars. Some published links are affiliate links: if you make a booking or purchase through them, CanaryRoutes may receive a commission at no extra cost to you.
          </p>
        ),
      },
      {
        heading: 'Intellectual property',
        body: (
          <p>
            The contents of this website (texts, images, design, code) are the property of Kevin Díaz or their respective authors and are protected by Spanish and international intellectual property law. Reproduction in whole or in part without express authorisation is prohibited.
          </p>
        ),
      },
      {
        heading: 'Liability',
        body: (
          <p>
            CanaryRoutes is not responsible for the availability, accuracy or content of third-party services linked from this site. Tourist information is provided for guidance purposes only and may change without notice.
          </p>
        ),
      },
      {
        heading: 'Applicable law',
        body: (
          <p>
            This legal notice is governed by Spanish law. For any dispute arising from the use of this website, the parties submit to the courts of Las Palmas de Gran Canaria, Spain.
          </p>
        ),
      },
    ],
  },
  de: {
    title: 'Impressum',
    meta: 'Impressum — CanaryRoutes',
    metaDesc: 'Rechtliche Informationen über den Betreiber und die Nutzungsbedingungen von CanaryRoutes.',
    back: 'Startseite',
    sections: [
      {
        heading: 'Betreiber der Website',
        body: (
          <p>
            Gemäß Artikel 10 des spanischen Gesetzes 34/2002 über Dienste der Informationsgesellschaft (LSSI-CE):
            <br /><br />
            <strong>Betreiber:</strong> Kevin Díaz<br />
            <strong>Adresse:</strong> Las Palmas de Gran Canaria, Las Palmas, Spanien<br />
            <strong>Kontakt:</strong> <a href="mailto:lobuenoexiste@gmail.com" style={{ color: '#0e4f72' }}>lobuenoexiste@gmail.com</a><br />
            <br />
            Für weitere Informationen über den Verantwortlichen wenden Sie sich bitte an die angegebene E-Mail-Adresse.
          </p>
        ),
      },
      {
        heading: 'Zweck und Tätigkeit',
        body: (
          <p>
            CanaryRoutes (<strong>canaryroutes.com</strong>) ist eine digitale Tourismusplattform, die Informationen über Sehenswürdigkeiten, Routen und Aktivitäten auf den Kanarischen Inseln bereitstellt. Die Nutzung der Website ist für Benutzer kostenlos.
          </p>
        ),
      },
      {
        heading: 'Affiliate-Tätigkeit',
        body: (
          <p>
            Diese Website nimmt an Affiliate-Programmen von Drittanbietern teil, darunter GetYourGuide und Rentalcars. Einige veröffentlichte Links sind Affiliate-Links: Wenn Sie über diese eine Buchung oder einen Kauf tätigen, kann CanaryRoutes eine Provision erhalten, ohne dass Ihnen zusätzliche Kosten entstehen.
          </p>
        ),
      },
      {
        heading: 'Geistiges Eigentum',
        body: (
          <p>
            Die Inhalte dieser Website (Texte, Bilder, Design, Code) sind Eigentum von Kevin Díaz oder ihrer jeweiligen Autoren und durch das spanische und internationale Urheberrecht geschützt. Die vollständige oder teilweise Vervielfältigung ohne ausdrückliche Genehmigung ist untersagt.
          </p>
        ),
      },
      {
        heading: 'Haftung',
        body: (
          <p>
            CanaryRoutes übernimmt keine Verantwortung für die Verfügbarkeit, Richtigkeit oder den Inhalt von Diensten Dritter, die von dieser Website verlinkt sind. Touristische Informationen dienen nur zur Orientierung und können sich ohne vorherige Ankündigung ändern.
          </p>
        ),
      },
      {
        heading: 'Anwendbares Recht',
        body: (
          <p>
            Dieses Impressum unterliegt dem spanischen Recht. Für etwaige Streitigkeiten aus der Nutzung dieser Website unterwerfen sich die Parteien den Gerichten von Las Palmas de Gran Canaria, Spanien.
          </p>
        ),
      },
    ],
  },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;
  const url = `${SITE_URL}/${locale}/aviso-legal`;
  return {
    title: c.meta,
    description: c.metaDesc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/aviso-legal`])),
    },
    robots: { index: false },
  };
}

export default async function AvisoLegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = CONTENT[locale] ?? CONTENT.es;

  return (
    <LegalPageLayout locale={locale} title={c.title} backLabel={c.back}>
      {c.sections.map((s) => (
        <LegalSection key={s.heading} title={s.heading}>
          {s.body}
        </LegalSection>
      ))}
    </LegalPageLayout>
  );
}
