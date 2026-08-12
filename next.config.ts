import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/S2Volt" : "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(isGitHubPages ? {
    output: "export" as const,
    basePath,
    assetPrefix: basePath,
    trailingSlash: true
  } : {
    async headers() {
      return [
        {
          source: "/sw.js",
          headers: [
            { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
            { key: "Service-Worker-Allowed", value: "/" }
          ]
        }
      ];
    }
  }),
  experimental: { typedEnv: true },
};

export default nextConfig;
