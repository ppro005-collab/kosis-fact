import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["papaparse", "csv-parser"],
    outputFileTracingIncludes: {
      '/api/**/*': ['./data/**/*', './knowledge_source/**/*'],
    },
  },
};

export default nextConfig;
