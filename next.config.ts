import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    domains: ["supabase.co", "localhost"],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@tabler/icons-react", "lucide-react"],
  },

  // Compression
  compress: true,

  // Headers for caching
  async headers() {
    return [
      {
        source: "/events",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        source: "/api/events",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Bundle analyzer (uncomment for debugging)
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //     };
  //   }
  //   return config;
  // },

  // Output optimization
  output: "standalone",

  // Powered by header
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
