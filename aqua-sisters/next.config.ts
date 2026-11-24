import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/reserveren/[slug]/opengraph-image': [
      './node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-*.woff',
      './public/images/water-og.jpg',
    ],
  },
  serverExternalPackages: ['postgres', 'pdf-lib', 'qrcode'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default config;
