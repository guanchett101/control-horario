# Solución Definitiva: Error de Rutas en Vercel (404 / HTML Response)

## 🚨 El Problema
La aplicación funcionaba en local pero fallaba en Vercel (móvil y PC). Los errores más comunes eran:
1.  **404 Not Found**: Al intentar acceder a `/api/registros/hoy`.
2.  **Error de JSON**: La API devolvía el HTML de la página web (`<!DOCTYPE html>...`) en lugar de datos JSON, rompiendo la app.

## 🔍 La Causa
El sistema de enrutamiento de Vercel ("Rewrites") entra en conflicto con las "rutas amigables" (ej: `/api/registros/hoy`) cuando no están explícitamente definidas.

1.  La app pedía `/api/registros/hoy`.
2.  Vercel no sabía a qué archivo enviar esa petición.
3.  Vercel usaba la regla "comodín" y enviaba el `index.html` (la web) en su lugar.
4.  El código intentaba leer ese HTML como si fueran datos de usuarios -> **ERROR**.

## ✅ La Solución Implementada
Hemos cambiado la estrategia de enrutamiento por una **a prueba de fallos** llamada **Query Parameters**.

### 1. Cambio en el Frontend (React)
En lugar de pedir rutas complejas, ahora pedimos el archivo base con una "acción":
*   ❌ Antes: `axios.get('/api/registros/hoy')`
*   ✅ Ahora: `axios.get('/api/registros?action=hoy')`

Esto garantiza que la petición llegue **siempre** al archivo `registros.js`.

### 2. Cambio en el Backend (API)
Hemos actualizado `auth.js`, `registros.js` y `empleados.js` para leer este nuevo parámetro:
```javascript
// Antes (detectaba ruta por string, fallaba en Vercel)
if (req.url.endsWith('/hoy')) ...

// Ahora (usa estándar URL parser, infalible)
const { query } = parse(req.url, true);
if (query.action === 'hoy') ...
```

### 3. Configuración de Vercel (`vercel.json`)
Hemos simplificado las reglas para evitar confusiones. Ahora solo hay 3 reglas claras:
1.  Todo lo que empiece por `/api/auth` -> va a `api/auth.js`
2.  Todo lo que empiece por `/api/registros` -> va a `api/registros.js`
3.  Todo lo que empiece por `/api/empleados` -> va a `api/empleados.js`
4.  Todo lo demás -> va a la web (`index.html`)

## 🛠️ Cómo Verificar que Funciona
1.  **Limpia la caché**: Cierra la pestaña del navegador y abre una nueva.
2.  **Entra**: Verás que carga rápido.
3.  **Prueba**: Registra una entrada o mira el dashboard. Funciona porque el navegador y el servidor ahora hablan el mismo idioma directo.
