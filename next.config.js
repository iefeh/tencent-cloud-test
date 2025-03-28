const path = require('path');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers() {
    return [
      {
        source: '/oauth(.*)?', // Matches all pages
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM *',
          },
        ],
      },
      {
        source: '/:path*', // 匹配所有路由
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // 允许所有域名访问
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS', // 允许的 HTTP 方法
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization', // 允许的请求头
          },
          {
            key: 'Access-Control-Max-Age',
            value: '3600'
          }
        ],
      }
    ];
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: 'd3dhz6pjw7pz9d.cloudfront.net',
      },
      {
        hostname: 'moonveil-public.s3.ap-southeast-2.amazonaws.com',
      },
      {
        hostname: 'pbs.twimg.com',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
      {
        hostname: 'cdn.discordapp.com',
      },
      {
        hostname: 'cloudflare-ipfs.com',
      },
      {
        hostname: 't.me',
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
    prependData: `@import "@/styles/global.scss";`
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

// module.exports = nextConfig;

module.exports = async () => {

  const loadValueFromSSM = async (name) => {
    const ssm = new SSMClient({
      region: "ap-southeast-1"
      , credentials: {
        accessKeyId: process.env.AWS_PARAM_ACCESS_KEY_ID,   // 从环境变量获取凭证
        secretAccessKey: process.env.AWS_PARAM_SECRET_ACCESS_KEY
      }
    });
    const input = {
      Name: name,
      // WithDecryption: true,
    };
    const command = new GetParameterCommand(input);
    const result = await ssm.send(command);
    return result.Parameter.Value;
  };

  const ssmKeys = Object.entries(process.env)
    .filter(([_, value]) => value && value.startsWith('ssm:')) // 只筛选值以 `ssm:` 开头的变量
    .map(([key, value]) => ({
      envKey: key,
      ssmKey: value.replace(/^ssm:/, process.env.ENV == 'production' ? '/prod/' : '/dev/') // 去掉 `ssm:` 前缀，获取真实 SSM 参数名
    }));

  if (ssmKeys.length === 0) return nextConfig;

  for (let item of ssmKeys) {
    try {
      const ssmValue = await loadValueFromSSM(item.ssmKey);
      process.env[item.envKey] = ssmValue;
    } catch (error) {
      console.error("Load Parameter Fail:", item.envKey, item.ssmKey, error)
      return nextConfig;
    }
  }

  return nextConfig;
}


// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: 'moonveil-entertainment',
    project: 'moonveil-site',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);
