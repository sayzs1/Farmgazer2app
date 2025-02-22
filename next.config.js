/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wfbf.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'ontariograinfarmer.ca',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'gixfarmgazer.blob.core.windows.net',
        pathname: '/farmgazer/**',
      }
    ],
  },
};

module.exports = nextConfig;