const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // 针对 SVG 的处理规则
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
}

module.exports = nextConfig
