# 🚀 Migración a Next.js (Versión 2.0)

Este documento detalla la migración exitosa del proyecto desde una arquitectura **React (CRA) + Express** hacia **Next.js**.

## 🔴 El Problema: Por qué migramos

La arquitectura anterior presentaba problemas persistentes de despliegue en Vercel que impedían la estabilidad de la aplicación:

1.  **Conflictos de Rutas (Frontend vs Backend):** Vercel tenía dificultades para servir la aplicación React (`frontend/build`) y la API Express (`api/`) simultáneamente, requiriendo configuraciones complejas y propensas a errores en `vercel.json`.
2.  **Errores de Despliegue ("Build Failed"):** Los intentos de despliegue fallaban frecuentemente con errores como `No Output Directory named "build" found`, debido a discrepancias en las rutas de salida.
3.  **Fallos en Login y API:** La página de inicio de sesión a menudo devolvía HTML en lugar de JSON al intentar comunicarse con la API, o simplemente daba errores 404/500 debido a rutas mal resueltas en producción.
4.  **Configuración Frágil:** Cada pequeño cambio requería ajustes manuales en los rewrites/redirects de Vercel.

## 🟢 La Solución: Next.js

Decidimos migrar a **Next.js** porque es el framework nativo de Vercel y resuelve todos estos problemas "de caja":

### Ventajas Clave
*   **Arquitectura Unificada:** Frontend y Backend viven en el mismo proyecto. No hay necesidad de gestionar dos servidores o configuraciones separadas.
*   **API Routes Nativas:** El backend ya no necesita un servidor Express separado. Las funciones de la API ahora son "Route Handlers" (`src/app/api/...`) que Vercel despliega automáticamente como funciones Serverless.
*   **Routing Automático:** El sistema de rutas basado en archivos de Next.js elimina la necesidad de `react-router-dom` y configuraciones manuales complejas.
*   **Zero-Config Deploy:** Vercel detecta automáticamente Next.js y configura todo sin necesidad de archivos `vercel.json` complicados.

## 🛠️ Cambios Realizados

Se creó una nueva estructura de proyecto en la carpeta `v2_nextjs`:

### 1. Estructura de Directorios (App Router)
*   **Antes:** `frontend/src/components/*`
*   **Ahora:** `v2_nextjs/src/app/*`
    *   Cada página tiene su propia carpeta: `login/`, `dashboard/`, `empleados/`, etc.
    *   Los componentes reutilizables (Navbar) se movieron a `src/app/components`.

### 2. Migración del Backend
*   **Antes:** `api/auth.js` (Express handler).
*   **Ahora:** `v2_nextjs/src/app/api/auth/route.js` (Next.js Route Handler).
    *   Se adaptó la lógica para usar `NextResponse` en lugar de `res.json()`.
    *   Se implementó el manejo de métodos HTTP (`GET`, `POST`) de forma nativa.

### 3. Migración del Frontend
*   Se portaron todos los componentes React (`Login.js`, `Dashboard.js`, etc.) y se adaptaron para funcionar como **Client Components** (`'use client'`).
*   Se reemplazó `react-router-dom` con el hook `useRouter` nativo de Next.js.
*   Se migraron los estilos CSS globales y modulares.
*   Se actualizó el **Metadata** global (`layout.tsx`) para reflejar el nombre de la aplicación.

### 4. Configuración de Vercel
*   Se eliminó el archivo `vercel.json` antiguo de redirecciones.
*   Se creó un nuevo `vercel.json` exclusivo para la configuración de Cron Jobs.
*   Se cambió el **Root Directory** del proyecto en Vercel a `v2_nextjs`.

### 5. Nuevas Funcionalidades (Control Horario Avanzado)
*   **Reportes Mejorados:** Se corrigió la lógica de cálculo de "Días Trabajados" para soportar múltiples fichajes por día (turno partido) contando días únicos en lugar de registros brutos.
*   **Horarios Flexibles:** Se añadió soporte para definir horarios de entrada y salida personalizados para cada empleado.
    *   Soporte para **Turno Partido** (Mañana y Tarde) con campos opcionales.
*   **Sistema de Alertas Automáticas (Cron + Email):**
    *   Se implementó un Cron Job (`/api/cron/verificar-fichajes`) que verifica faltas de asistencia y olvidos de fichaje de salida.
    *   Se integró **Nodemailer** para el envío de notificaciones automáticas a los empleados vía Gmail SMTP.
        *   **Nota Técnica:** Se configuró como `serverExternalPackages` en `next.config.ts` y se usó `require()` dinámico para evitar errores de bundling en el build.

## ✅ Estado Actual (Verificado)
*   **Build:** ✅ Exitoso (`npm run build`).
*   **Funcionalidades Clave:**
    *   Autenticación: ✅ Listo (`/api/auth`).
    *   Cron Job: ✅ Integrado (`/api/cron/verificar-fichajes`).
    *   Email: ✅ Configurado (`src/lib/email.js`).
*   **Siguientes Pasos:**
    1.  Desplegar el directorio `v2_nextjs` en Vercel.
    2.  Configurar las **Variables de Entorno** en el dashboard de Vercel (copiar las de `.env.local`).

## 📋 Cómo Ejecutar el Proyecto (Versión v2)

### Desarrollo Local
```bash
cd v2_nextjs
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Variables de Entorno
El nuevo proyecto utiliza un archivo `.env.local` en la carpeta `v2_nextjs/` con las mismas credenciales de Supabase que la versión anterior:
```
SUPABASE_URL=...
SUPABASE_KEY=...
SMTP_EMAIL=...  (Para envío de correos)
SMTP_PASSWORD=... (Contraseña de aplicación de Google)
JWT_SECRET=... (Para firma de tokens, opcional en dev, recomendado en prod)
```
