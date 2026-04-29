import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["papaparse", "csv-parser"],
    outputFileTracingIncludes: {
      '/**/*': ['./data/**/*', './knowledge_source/**/*'],
    },
  },
};

export default nextConfig;
