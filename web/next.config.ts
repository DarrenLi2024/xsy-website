import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default — the webpack config below
  // only existed to set crypto:false fallback, which is unnecessary
  // under Turbopack.
  turbopack: {},
  images: {
    // 开发环境下 unoptimized 避免 Docker Desktop 网络解析问题
    unoptimized: !isProd,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // 开发环境不过于严格，生产环境开启完整 CSP 与 HSTS
          ...(isProd
            ? [
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: blob: https: http:",
                    "font-src 'self' data:",
                    "connect-src 'self' https: http:",
                    "frame-ancestors 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                  ].join("; "),
                },
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
