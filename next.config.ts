import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/poo',
  images: { unoptimized: true },
};

export default nextConfig;
