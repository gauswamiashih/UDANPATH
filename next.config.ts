import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CDN, caching and security headers for global performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=31536000, stale-while-revalidate=86400',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'public, s-maxage=31536000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/(apple-touch-icon.*|icon.*|favicon.ico|site.webmanifest|.*\\.(?:ico|png|svg|jpg|jpeg|gif|webp|woff|woff2))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=31536000, immutable',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/exams/discover',
        destination: '/student/exams/discover',
        permanent: true,
      },
      {
        source: '/exams/:slug',
        destination: '/student/exams/:slug',
        permanent: true,
      },
      {
        source: '/exams',
        destination: '/student/exams/discover',
        permanent: true,
      },
      {
        source: '/notifications',
        destination: '/student/notifications',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/student/profile',
        permanent: true,
      },
      {
        source: '/saved',
        destination: '/student/saved',
        permanent: true,
      },
      {
        source: '/courses',
        destination: '/student/courses',
        permanent: true,
      },
      {
        source: '/roadmaps',
        destination: '/student/roadmaps',
        permanent: true,
      },
      {
        source: '/simulator',
        destination: '/student/simulator',
        permanent: true,
      },
      {
        source: '/ai',
        destination: '/student/ai',
        permanent: true,
      },
      {
        source: '/guide',
        destination: '/student/guide',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/student/settings',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
