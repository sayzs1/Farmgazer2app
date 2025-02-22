/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保在开发环境下没有启用静态导出
  ...(process.env.NODE_ENV === 'development' ? {} : { output: 'export' }),
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