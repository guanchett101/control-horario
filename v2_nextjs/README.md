# Control de Horario - Versión Next.js (V2)

Esta es la nueva versión de la aplicación migrada a Next.js para mejorar la estabilidad y el despliegue en Vercel.

## Características

- **Framework:** Next.js 13+ (App Router)
- **Base de Datos:** Supabase
- **Autenticación:** JWT + Supabase
- **Estilos:** CSS Modules / Vanilla CSS optimizado
- **Despliegue:** Vercel (Configuración Zero-Config)

## Estructura del Proyecto

- `src/app/`: Rutas y páginas de la aplicación (App Router).
- `src/app/api/`: API Routes (Backend Serverless).
- `src/components/`: Componentes reutilizables (Navbar, etc).
- `public/`: Activos estáticos (imágenes, iconos).

## Instrucciones de Despliegue en Vercel

1. **Root Directory:** Asegúrate de configurar el "Root Directory" en Vercel como `v2_nextjs`.
2. **Framework Preset:** Vercel debería detectar automáticamente "Next.js".
3. **Variables de Entorno:** Copia las variables de `.env` (SUPABASE_URL, SUPABASE_KEY, etc) al panel de Vercel.

## Comandos Locales

```bash
cd v2_nextjs
npm install
npm run dev
```
