import type { NextConfig } from "next";

const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.trim().replace(/\/$/, "") || undefined;

/** Export estático para cPanel (sin Node en el servidor). */
const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  output: "export",
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  /** Permite imports desde `../editor/data/` en dev y build del monorepo. */
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
