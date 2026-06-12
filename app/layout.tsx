import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GygTrackingScript } from '@/components/affiliate/gyg-tracking-script';

export const metadata: Metadata = {
  title: 'CanaryRoutes',
  description: 'Audioguias de las Islas Canarias',
  icons: { icon: '/favicon.ico' },
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
