import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output required for Vercel / Docker
  output: "standalone",
  // Remove the X-Powered-By header for security
  poweredByHeader: false,
  // Suppress hydration issues from browser extensions
  reactStrictMode: true,
};

export default nextConfig;
