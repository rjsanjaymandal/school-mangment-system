import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance: Skip linting/type-checking during builds (CI should catch these)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Optimize server bundle by externalizing heavy packages
  serverExternalPackages: ["jspdf", "jspdf-autotable", "@react-pdf/renderer"],

  // Logging: Surface slow fetches in dev
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
