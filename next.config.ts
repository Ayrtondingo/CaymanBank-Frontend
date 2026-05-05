import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Esto ignora los errores de tipo en el build de Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de linting en el build de Vercel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;