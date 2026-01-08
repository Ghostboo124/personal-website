import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  crossOrigin: "anonymous",
  transpilePackages: [],
  pageExtensions: ["tsx", "ts"],
  allowedDevOrigins: ["localhost", "192.168.1.254"],
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "tsconfig.json",
  },
  experimental: {
    inlineCss: true,
    cssChunking: true,
    viewTransition: true,
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
