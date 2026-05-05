/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignora los errores de tipo en el build de Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de linting en el build de Vercel
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;           



