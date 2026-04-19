import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set root to this project directory to prevent Next.js from
    // picking up C:\Users\HP\package-lock.json as the workspace root.
    root: __dirname,
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
