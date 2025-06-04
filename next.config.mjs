/** @type {import('next').NextConfig} */
import NextBundleAnalyzer from '@next/bundle-analyzer';

const isStatic = process.env.NEXT_PUBLIC_MODE === 'static';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: false,
  output: isStatic ? 'export' : undefined,
  webpack: config => {
    if (!isStatic || !config.module) {
      return config;
    }
    config.module.rules?.push({
      test: /src\/app\/api/,
      loader: 'ignore-loader',
    });
    return config;
  },
  // for Gemini generate content API
  ...(isStatic ? {} : {
    async headers() {
      return [
        {
          source: "/api/gemini-generate",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "*",
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "POST",
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "Content-Type, Authorization",
            },
          ],
        },
      ];
    },
  }),
};

export default withBundleAnalyzer(nextConfig);
