/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    return config;
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      process.env.CLOUDFRONT_DOMAIN ?? '',
      `${process.env.AWS_S3_BUCKET ?? ''}.s3.amazonaws.com`,
    ].filter(Boolean),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://*.stripe.com https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src https://*.stripe.com https://js.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://*.stripe.com")',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
