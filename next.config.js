const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: 'moonveil-public.s3.ap-southeast-2.amazonaws.com',
      },
      {
        hostname: 'pbs.twimg.com',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack(config) {
    // 针对 SVG 的处理规则
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
};

module.exports = nextConfig;
