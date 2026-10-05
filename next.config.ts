import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export: the site deploys to any static host or CDN.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
