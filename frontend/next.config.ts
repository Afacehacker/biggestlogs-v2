import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, ".."),
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  // Optimizations for restricted memory environments (like Render Free Tier)
  typescript: {
    ignoreBuildErrors: true, // Speeds up build and saves RAM
  },
  eslint: {
    ignoreDuringBuilds: true, // Saves RAM
  },
  generateBuildId: async () => 'build-id', // Optional: simpler build id
};

export default nextConfig;
