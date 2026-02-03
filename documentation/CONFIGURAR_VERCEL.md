# Configurar Variables de Entorno en Vercel

## 🔑 Variables que necesitas agregar

Ve a tu proyecto en Vercel y sigue estos pasos:

### 1. Ir a Settings
- Abre tu proyecto: https://vercel.com/marcos-medinas-projects/control-horario
- Haz clic en **"Settings"** (arriba)

### 2. Ir a Environment Variables
- En el menú lateral, haz clic en **"Environment Variables"**

### 3. Agregar estas 3 variables:

#### Variable 1: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://ytaypvluxvktvizyrrmj.supabase.co
Environment: Production, Preview, Development (selecciona las 3)
```

#### Variable 2: SUPABASE_KEY
```
Name: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YXlwdmx1eHZrdHZpenlycm1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkzMjE5MywiZXhwIjoyMDg1NTA4MTkzfQ.jaeNQKNGxMMAGtaPfUyLZeBVcBETEJcwIm3MiONLPWw
Environment: Production, Preview, Development (selecciona las 3)
```

#### Variable 3: JWT_SECRET
```
Name: JWT_SECRET
Value: control_horario_europa_2026_secreto
Environment: Production, Preview, Development (selecciona las 3)
```

### 4. Guardar y Redeploy
- Después de agregar las 3 variables, haz clic en **"Save"**
- Ve a **"Deployments"**
- Haz clic en los 3 puntos del último deployment
- Selecciona **"Redeploy"**

### 5. Esperar 2-3 minutos
- El nuevo deployment incluirá las variables de entorno
- Prueba el login con: **admin** / **admin123**

## ✅ Verificación

Una vez configurado, deberías poder:
1. Ver la pantalla de login
2. Iniciar sesión con admin/admin123
3. Acceder al dashboard
4. Crear empleados
5. Registrar entradas/salidas

## 🐛 Si sigue sin funcionar

Revisa los logs del deployment:
1. Ve a "Deployments"
2. Haz clic en el último deployment
3. Ve a "Functions" → Selecciona una función (auth, empleados, registros)
4. Revisa los logs para ver errores específicos
