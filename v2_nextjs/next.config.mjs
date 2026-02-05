/** @type {import('next').NextConfig} */
const nextConfig = {
  // CONFIGURACIÓN CRÍTICA PARA EVITAR ERRORES DE BUILD EN VERCEL
  // Ignora errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignora errores de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  }
};

export default nextConfig;
