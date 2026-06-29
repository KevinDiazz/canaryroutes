import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics 4 — carga solo si NEXT_PUBLIC_GA_MEASUREMENT_ID está definido.
 * Usa `afterInteractive` para no penalizar LCP ni INP.
 *
 * Pasos para activar:
 *   1. Crea una propiedad GA4 en https://analytics.google.com
 *   2. Copia el Measurement ID (formato G-XXXXXXXXXX)
 *   3. Añádelo a .env.production: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *   4. En Cloudflare Pages: Settings → Environment variables → añadir la misma var
 */
export function Ga4Script() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
