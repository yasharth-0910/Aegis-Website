import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Disables ESLint during `next build`
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
