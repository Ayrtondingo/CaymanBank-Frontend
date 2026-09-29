/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Para la imagen de Docker: empaqueta solo lo necesario para `node server.js`.
  // Vercel lo ignora.
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
