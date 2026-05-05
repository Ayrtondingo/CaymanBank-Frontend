/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true, // Forzar la omisión estricta de TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desactiva el caché de Webpack en memoria para evitar el error
  webpack: (config, { dev, isServer }) => {
    config.cache = false;
    return config;
  }
};

module.exports = nextConfig;