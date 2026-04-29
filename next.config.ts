import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["papaparse", "csv-parser"],
    outputFileTracingIncludes: {
      '/**/*': [
        './data/YOUTH_202*.csv',
        './data/WORKING_TYPE_202*.csv',
        './data/menuSettings.json',
        './data/kosis_summaries/**/*',
        './knowledge_source/**/*'
      ],
    },
  },
};

export default nextConfig;
