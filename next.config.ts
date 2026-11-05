import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind v4 is processed via postcss.config.mjs (@tailwindcss/postcss).
  // Do not rely on @tailwindcss/turbopack alone — Railway builds with --webpack.
};

export default nextConfig;
