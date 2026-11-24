import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aqua Sisters',
    short_name: 'Aqua Sisters',
    description: 'Exclusief zwemmen voor vrouwen – tickets en scanner',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F1E7',
    theme_color: '#0C3331',
    lang: 'nl',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/mark.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
