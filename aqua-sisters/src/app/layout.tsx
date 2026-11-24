import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/inter';
import './globals.css';

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const appUrl = process.env.APP_URL || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: 'Aqua Sisters – Exclusief zwemmen voor vrouwen', template: '%s · Aqua Sisters' },
  description: 'Besloten zwemavonden, uitsluitend voor vrouwen en toegestane kinderen. Reserveer je tickets in een minuut.',
  applicationName: 'Aqua Sisters',
  icons: { icon: '/brand/mark.svg', apple: '/icons/apple-touch-icon.png' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    siteName: 'Aqua Sisters',
    images: [{ url: '/images/water-og.jpg', width: 1200, height: 630 }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0C3331',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
