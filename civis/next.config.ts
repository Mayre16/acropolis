import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/\/$/, "") || undefined;

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  output: "export",
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    externalDir: true,
  },
  turbopack: {
    resolveAlias: {
      "next/image": path.join(__dirname, "components/SiteImage.tsx"),
      "next-original/image": require.resolve("next/image"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "next/image": path.join(__dirname, "components/SiteImage.tsx"),
      "next-original/image": require.resolve("next/image"),
    };
    return config;
  },
};

export default nextConfig;
