import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `https://paywise-api.dipper.ir/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
