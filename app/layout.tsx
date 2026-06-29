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
  icons: { icon: '/favicon.ico' },
  ...(GSC_VERIFICATION && {
    verification: { google: GSC_VERIFICATION },
  }),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {children}
        <GygTrackingScript />
      </body>
    </html>
  );
}
