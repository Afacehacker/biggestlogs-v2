import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  // Simplified config to avoid version compatibility warnings
};

export default nextConfig;
