/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desactivamos la generación estática para el panel de control
  output: 'standalone'
};

module.exports = nextConfig;            

