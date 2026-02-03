# 🛠️ Solución: Error de Conexión Vercel -> Supabase

Este documento detalla los cambios realizados para corregir los errores de conexión de la base de datos cuando el proyecto está desplegado en Vercel.

## 🔍 Diagnóstico del Problema

El proyecto presentaba dos problemas principales que impedían la conexión:

1.  **Conexión Directa Insegura**: El frontend (React) intentaba conectar directamente a Supabase. Esto fallaba en producción por políticas de seguridad o credenciales desactualizadas en el navegador.
2.  **Rutas Mal Configuradas**: `vercel.json` no redirigía correctamente las llamadas a la API hacia las funciones serverless (`api/*.js`), lo que causaba errores 404 al intentar hacer login.

---

## 🚀 Cambios Realizados

### 1. Refactorización del Login (`frontend/src/components/Login.js`)
Se eliminó la dependencia directa de `@supabase/supabase-js` en el frontend.
- **Antes**: El navegador hablaba con Supabase (Inseguro).
- **Ahora**: El navegador habla con `/api/auth/login` (Seguro).
- **Beneficio**: Las credenciales sensibles (`SUPABASE_KEY`) ahora solo existen en el servidor, no visibles para el usuario.

### 2. Corrección de Vercel Routing (`vercel.json`)
Se actualizaron las reglas de redirección para mapear correctamente las rutas de la API a sus archivos correspondientes:

```json
{
  "rewrites": [
    { "source": "/api/auth/:path*", "destination": "/api/auth.js" },
    { "source": "/api/empleados/:path*", "destination": "/api/empleados.js" },
    { "source": "/api/registros/:path*", "destination": "/api/registros.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. Unificación de la API (`api/auth.js`)
Se aseguró que las funciones serverless usen `process.env.SUPABASE_URL` y `process.env.SUPABASE_KEY`, permitiendo que Vercel inyecte estas claves de forma segura.

---

## ⚙️ Configuración Necesaria en Vercel

Para que esta solución funcione, **DEBES** tener estas 3 Variables de Entorno en tu panel de Vercel:

| Variable | Descripción | Valor Ejemplo |
| :--- | :--- | :--- |
| `SUPABASE_URL` | URL de tu proyecto Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | **Service Role Key** (Secreta) | `eyJhbGci...` |
| `JWT_SECRET` | Clave para los tokens de sesión | `control_horario_europa_2026_secreto` |

---

## ✅ Cómo verificar que funciona

1.  **Redeploy**: Después de configurar las variables, haz un "Redeploy" en Vercel.
2.  **Acceso Directo**: Intenta entrar a `https://tu-dominio.vercel.app/api/auth/usuarios`.
    - Si ves un JSON con usuarios, la base de datos **está conectada**.
    - Si ves un error, revisa los logs de Vercel en la pestaña "Functions".
3.  **Login**: Ve a la pantalla principal, selecciona un usuario y pon su contraseña. Ahora debería entrar al Dashboard instantáneamente.

---

**Nota**: El archivo `frontend/src/supabaseClient.js` ya no es necesario para el login, pero se mantiene por compatibilidad si otros componentes lo usan para archivos o tiempo real sencillo.
