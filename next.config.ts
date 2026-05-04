import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
