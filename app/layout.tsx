import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CanaryRoutes',
  description: 'Audioguías de las Islas Canarias',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
