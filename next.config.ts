import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["papaparse", "csv-parser", "better-sqlite3"],
  },
};

export default nextConfig;
