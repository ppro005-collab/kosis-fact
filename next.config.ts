import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["papaparse", "csv-parser"],
    outputFileTracingIncludes: {
      '/api/**/*': ['./data/**/*'],
    },
  },
};

export default nextConfig;
