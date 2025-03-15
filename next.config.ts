import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React's Strict Mode for development
  swcMinify: true, // Use SWC for minification instead of Terser
  images: {
    domains: [], // Add external image domains here
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en'], // Add your supported locales
    defaultLocale: 'en',
  },
  // redirects: async () => {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true,
  //     },
  //   ];
  // },
  // Add environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Uncomment to add a custom webpack config
  // webpack: (config, { isServer }) => {
  //   // Custom webpack config here
  //   return config;
  // },
};

export default nextConfig;
