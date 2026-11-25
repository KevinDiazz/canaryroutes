import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GygTrackingScript } from '@/components/affiliate/gyg-tracking-script';

// ── Google Search Console verification ───────────────────────────────────────
// Pasos para obtener el código:
//   1. Abre https://search.google.com/search-console
//   2. Añade la propiedad con tu dominio
//   3. Elige verificación por "Etiqueta HTML" y copia el content del meta tag
//   4. Añade a .env.production: NEXT_PUBLIC_GSC_VERIFICATION=tu-codigo-aqui
//   5. En Cloudflare Pages: Settings → Environment variables → añadir la misma var
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  title: 'CanaryRoutes',
  description: 'Descubre Gran Canaria y Tenerife: playas, senderos, cultura y naturaleza. Planifica tu viaje con mapas interactivos.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
  },
  ...(GSC_VERIFICATION && {
    verification: { google: GSC_VERIFICATION },
  }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Fuentes: antes se cargaban con @import en globals.css, lo que bloqueaba el
// render (CSS → Google Fonts CSS → woff2, ~800 ms). Ahora se inyectan sin
// bloquear (display=swap) y con preconnect. Se elimina Chelsea Market (sin uso).
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Gloria+Hallelujah&family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Cormorant+Garamond:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${FONTS_HREF}';document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link rel="stylesheet" href={FONTS_HREF} />
        </noscript>
      </head>
      <body>
        {children}
        <GygTrackingScript />
      </body>
    </html>
  );
}
