import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    scrollRestoration: true,
  },
  productionBrowserSourceMaps: true,
};

export default nextConfig;
