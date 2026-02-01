# ✅ Checklist para Verificar Vercel

## 1. Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables

Debes tener estas 3 variables configuradas:

```
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_KEY = tu_service_role_key
JWT_SECRET = tu_clave_secreta
```

**IMPORTANTE**: Estas variables deben estar en **Production**, **Preview** y **Development**

---

## 2. Verificar que el Build funcione

En Vercel → Deployments → Último deployment

- ✅ El build debe estar en verde (Success)
- ❌ Si está en rojo, revisa los logs del build

---

## 3. Probar las APIs directamente

Abre estas URLs en tu navegador (reemplaza con tu dominio):

### Probar API de usuarios:
```
https://control-horario-weld.vercel.app/api/auth/usuarios
```
**Debe devolver**: Lista de usuarios en JSON

### Probar API de registros:
```
https://control-horario-weld.vercel.app/api/registros/hoy
```
**Debe devolver**: Lista de registros o array vacío `[]`

---

## 4. Revisar Consola del Navegador

1. Abre https://control-horario-weld.vercel.app
2. Presiona **F12** (abrir DevTools)
3. Ve a la pestaña **Console**
4. Busca errores en rojo

### Errores comunes:

**Error de CORS:**
```
Access to fetch at '...' has been blocked by CORS policy
```
**Solución**: Las funciones serverless ya tienen CORS habilitado

**Error 404:**
```
GET https://...../api/auth/login 404 (Not Found)
```
**Solución**: Verifica que las rutas en vercel.json estén correctas

**Error 500:**
```
POST https://...../api/auth/login 500 (Internal Server Error)
```
**Solución**: Revisa las variables de entorno en Vercel

---

## 5. Verificar Pestaña Network

1. En DevTools, ve a **Network** (Red)
2. Recarga la página
3. Busca peticiones en rojo (failed)
4. Haz clic en cada una para ver el error

---

## 6. Forzar Nuevo Deploy

Si todo lo anterior está bien pero sigue fallando:

1. Ve a Vercel → Deployments
2. Haz clic en los 3 puntos del último deployment
3. Selecciona **Redeploy**
4. Marca la opción **Use existing Build Cache** como OFF
5. Haz clic en **Redeploy**

---

## 7. Logs en Tiempo Real

Para ver errores en tiempo real:

1. Ve a Vercel → tu proyecto
2. Haz clic en **Functions** (en el menú lateral)
3. Selecciona una función (auth.js, empleados.js, etc)
4. Ve a **Logs**
5. Intenta hacer login y mira los logs

---

## ¿Qué hacer si la pantalla se queda en blanco?

1. **Abre la consola del navegador** (F12)
2. **Copia todos los errores que veas**
3. **Revisa la pestaña Network** y busca peticiones fallidas
4. **Verifica que las 3 variables de entorno estén en Vercel**

---

## Comandos útiles para probar localmente antes de subir:

```bash
# Detener servidores
bash detener-local.sh

# Iniciar servidores
bash iniciar-local.sh

# Ver usuarios en BD
node ver-todos-usuarios.js

# Verificar que todo funcione local antes de subir a Vercel
```

---

## Push a GitHub (auto-deploy en Vercel):

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel detectará el push y desplegará automáticamente en 30-60 segundos.
