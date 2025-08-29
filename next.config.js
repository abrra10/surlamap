/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "lucide-react"],
  },

  // Compression
  compress: true,

  // Webpack configuration for Windows compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Windows-specific path resolution
    if (process.platform === "win32") {
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        "node_modules",
      ];
    }

    return config;
  },

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

  // Output optimization
  output: "standalone",

  // Powered by header
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,
};

module.exports = nextConfig;
