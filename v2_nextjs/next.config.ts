/** @type {import('next').NextConfig} */
const nextConfig = {
  // Marcar nodemailer como paquete externo del servidor
  serverExternalPackages: ['nodemailer'],

  // Ignorar errores de TypeScript durante build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuración vacía de Turbopack para silenciar el warning
  // y permitir que el build use Turbopack (default en Next.js 16)
  turbopack: {},
};

export default nextConfig;
