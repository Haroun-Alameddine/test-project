import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ----------------------------------------------------------------
     Transpile fabric.js so Next.js can handle its ESM/CJS output
     ---------------------------------------------------------------- */
  transpilePackages: ["fabric"],

  /* ----------------------------------------------------------------
     Image optimization — allow stock photo CDN domains
     ---------------------------------------------------------------- */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      {
        protocol: "https",
        hostname: "cdn.freepik.com",
      },
      {
        protocol: "https",
        hostname: "**.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      /* Supabase storage (future use) */
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  /* ----------------------------------------------------------------
     HTTP headers — CORS for font files loaded from /public
     ---------------------------------------------------------------- */
  async headers() {
    return [
      {
        source: "/fonts/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/(.*\\.woff2?)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  /* ----------------------------------------------------------------
     Expose environment variables to the browser bundle
     Only add non-secret, public-facing vars here.
     ---------------------------------------------------------------- */
  env: {
    NEXT_PUBLIC_APP_NAME: "Pedabook Builder",
    NEXT_PUBLIC_APP_LOCALE: "ar",
    NEXT_PUBLIC_APP_DIR: "rtl",
  },

  /* ----------------------------------------------------------------
     Turbopack config (Next.js 16 default bundler)
     ---------------------------------------------------------------- */
  turbopack: {},

  reactStrictMode: true,
};

export default nextConfig;
