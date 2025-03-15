import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable React's Strict Mode for development
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
