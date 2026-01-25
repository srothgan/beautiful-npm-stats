import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  async headers() {
    const siteUrl = "https://beautiful-npm-stats.com";
    const frameAncestors = [
      "'self'",
      ...(process.env.NODE_ENV === "development"
        ? ["http://localhost:3333", "https://localhost:3333"]
        : []),
      siteUrl,
    ].join(" ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors};`,
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
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
