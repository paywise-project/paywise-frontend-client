import type { NextConfig } from "next";

const target =
  process.env.NODE_ENV === "development"
    ? "https://pwtest.mhossein.ir"
    : "https://pwtestt.mhossein.ir";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
