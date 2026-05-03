import type { MetadataRoute } from 'next';

const BASE = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://bukzaccounting.co.uk';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/', '/auth/', '/onboarding/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
