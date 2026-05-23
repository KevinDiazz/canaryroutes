import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // 'export' solo para build de producción (Cloudflare Pages)
  // En dev lo desactivamos para evitar restricciones de generateStaticParams
  output: isDev ? undefined : 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
