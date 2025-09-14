import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // Suppress React 19 compatibility warning with Antd v5
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Suppress specific warnings
    config.ignoreWarnings = [
      /Warning: \[antd: compatible\] antd v5 support React is 16 ~ 18/,
    ];
    
    return config;
  },
};

export default nextConfig;
