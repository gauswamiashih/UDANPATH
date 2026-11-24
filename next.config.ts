import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
