# 👀 Guía Visual Paso a Paso

## 🎯 Objetivo
Tener tu sistema de control de horarios funcionando en 10 minutos.

---

## 📍 PASO 1: Crear Proyecto en Supabase

### 1.1 Ir a Supabase
```
🌐 Abre tu navegador
→ Ve a: https://supabase.com
→ Click en "Start your project"
```

### 1.2 Crear Cuenta
```
📧 Puedes usar:
   • GitHub (recomendado)
   • Email
```

### 1.3 Crear Proyecto
```
➕ Click en "New Project"

Completa:
┌─────────────────────────────────┐
│ Name: control-horario           │
│ Database Password: ********     │  ← ¡Guarda esta contraseña!
│ Region: South America (sao)    │
│ Pricing Plan: Free              │
└─────────────────────────────────┘

⏱️ Espera 2-3 minutos mientras se crea
```

---

## 📊 PASO 2: Crear las Tablas

### 2.1 Abrir SQL Editor
```
En tu proyecto de Supabase:
→ Menú lateral izquierdo
→ Click en el icono 🗄️ "SQL Editor"
→ Click en "+ New Query"
```

### 2.2 Ejecutar Script
```
1. Abre el archivo: database/supabase_schema.sql
2. Copia TODO el contenido (Ctrl+A, Ctrl+C)
3. Pega en el SQL Editor de Supabase (Ctrl+V)
4. Click en "Run" (o Ctrl+Enter)

✅ Deberías ver: "Success. No rows returned"
```

### 2.3 Verificar Tablas
```
→ Menú lateral: Table Editor
→ Deberías ver 4 tablas:
   ✓ empleados
   ✓ usuarios
   ✓ registros_horario
   ✓ horarios_asignados
```

---

## 🔑 PASO 3: Obtener Credenciales

### 3.1 Ir a Settings
```
→ Menú lateral: ⚙️ Settings
→ Click en "API"
```

### 3.2 Copiar Credenciales
```
Necesitas copiar 2 cosas:

1️⃣ Project URL
┌─────────────────────────────────────────┐
│ https://xxxxxxxxxxxxx.supabase.co      │
└─────────────────────────────────────────┘
   ↑ Copia esto

2️⃣ service_role key (¡NO el anon key!)
┌─────────────────────────────────────────┐
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
└─────────────────────────────────────────┘
   ↑ Copia esto (es largo)

⚠️ IMPORTANTE: Usa "service_role", NO "anon public"
```

---

## 💻 PASO 4: Configurar el Proyecto

### 4.1 Abrir Terminal
```
📂 Abre la carpeta del proyecto
→ Click derecho → "Abrir en Terminal"
   o
→ Abre terminal y navega: cd /ruta/al/proyecto
```

### 4.2 Instalar Dependencias
```bash
# Instalar backend
npm install

# Instalar frontend
cd client
npm install
cd ..
```

### 4.3 Crear archivo .env
```bash
# Copiar plantilla
cp .env.example .env

# Abrir con editor
nano .env
# o
code .env
# o
notepad .env
```

### 4.4 Editar .env
```
Reemplaza con tus datos de Supabase:

PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co    ← Pega tu URL
SUPABASE_KEY=eyJhbGciOiJIUzI1NiI...       ← Pega tu key
JWT_SECRET=mi_clave_super_secreta_123     ← Inventa algo aleatorio

💾 Guarda el archivo (Ctrl+S)
```

---

## 👤 PASO 5: Crear Usuario Admin

### 5.1 Generar Hash de Contraseña
```bash
# En la terminal, ejecuta:
node scripts/generar-password.js admin123

# Verás algo como:
🔐 Generando hash de contraseña...

✅ Hash generado exitosamente:

$2a$10$rOiN7ZXqKxdU5nF5xKxXxeYvYxYxYxYxYxYxYxYxYxYxYxYxYxY

📋 Copia este hash...
```

### 5.2 Actualizar en Supabase
```
1. Copia el hash generado
2. Ve a Supabase → SQL Editor
3. Ejecuta:

UPDATE usuarios 
SET password_hash = 'pega_tu_hash_aqui'
WHERE username = 'admin';

4. Click "Run"
✅ Deberías ver: "Success. 1 rows affected"
```

---

## 🚀 PASO 6: Iniciar el Sistema

### 6.1 Verificar Configuración
```bash
npm run verificar

# Deberías ver:
✅ ¡Todo está configurado correctamente!
```

### 6.2 Iniciar Backend
```bash
# Terminal 1
npm run dev

# Deberías ver:
Servidor corriendo en puerto 3001
```

### 6.3 Iniciar Frontend
```bash
# Terminal 2 (nueva terminal)
npm run client

# Se abrirá automáticamente:
http://localhost:3000
```

---

## 🎉 PASO 7: Probar el Sistema

### 7.1 Login
```
En el navegador verás:

┌─────────────────────────────────┐
│   Control de Horarios           │
│   Iniciar Sesión                │
│                                 │
│   Usuario: [admin        ]      │
│   Contraseña: [********  ]      │
│                                 │
│   [  Iniciar Sesión  ]          │
└─────────────────────────────────┘

Ingresa:
• Usuario: admin
• Contraseña: admin123
```

### 7.2 Dashboard
```
Después del login verás:

┌─────────────────────────────────────────┐
│ Bienvenido, Admin Sistema               │
│                                         │
│ ┌─────────────┐  ┌─────────────┐      │
│ │ Empleados   │  │ Registros   │      │
│ │ Presentes   │  │ Hoy         │      │
│ │     0       │  │     0       │      │
│ └─────────────┘  └─────────────┘      │
│                                         │
│ Registros de Hoy                        │
│ ┌─────────────────────────────────┐    │
│ │ No hay registros para hoy       │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 7.3 Registrar Entrada
```
→ Click en "Registro" en el menú
→ Click en "Registrar Entrada"
→ Verás: "Entrada registrada a las 09:00:00"
```

### 7.4 Crear Empleado
```
→ Click en "Empleados" en el menú
→ Click en "Nuevo Empleado"
→ Completa el formulario
→ Click en "Guardar"
```

---

## ✅ Verificación Final

### Checklist
```
□ Proyecto creado en Supabase
□ 4 tablas creadas
□ Credenciales copiadas
□ Archivo .env configurado
□ Dependencias instaladas
□ Usuario admin creado
□ Backend corriendo (puerto 3001)
□ Frontend corriendo (puerto 3000)
□ Login funciona
□ Puedes registrar entrada
```

---

## 🆘 Si Algo Sale Mal

### Error: "Faltan las credenciales de Supabase"
```
❌ Problema: .env no está configurado

✅ Solución:
1. Verifica que el archivo .env existe
2. Abre .env y confirma que tiene:
   - SUPABASE_URL
   - SUPABASE_KEY
   - JWT_SECRET
3. Reinicia el servidor (Ctrl+C y npm run dev)
```

### Error: "Invalid API key"
```
❌ Problema: Estás usando la key incorrecta

✅ Solución:
1. Ve a Supabase → Settings → API
2. Copia el "service_role" key (NO el "anon public")
3. Actualiza SUPABASE_KEY en .env
4. Reinicia el servidor
```

### Error al hacer login
```
❌ Problema: Usuario no existe o contraseña incorrecta

✅ Solución:
1. Genera nuevo hash:
   node scripts/generar-password.js admin123

2. Actualiza en Supabase SQL Editor:
   UPDATE usuarios 
   SET password_hash = 'nuevo_hash'
   WHERE username = 'admin';

3. Intenta login nuevamente
```

### Puerto en uso
```
❌ Problema: Puerto 3001 o 3000 ya está en uso

✅ Solución:
1. Cierra otros programas que usen esos puertos
2. O cambia el puerto en .env:
   PORT=3002
```

---

## 🌐 Próximo Paso: Ponerlo Online

Una vez que funcione en localhost:

```
1. Sube tu código a GitHub
2. Ve a https://vercel.com
3. Importa tu repositorio
4. Configura variables de entorno
5. Deploy

📚 Ver guía completa en: GUIA_DEPLOYMENT.md
```

---

## 🎊 ¡Felicidades!

Si llegaste hasta aquí, tu sistema está funcionando.

**Ahora puedes:**
- ✅ Crear empleados
- ✅ Registrar entradas y salidas
- ✅ Ver reportes
- ✅ Gestionar horarios

**Próximos pasos:**
1. Cambia la contraseña del admin
2. Crea más empleados
3. Prueba todas las funcionalidades
4. Cuando estés listo, despliega online

📚 **Documentación completa:** README.md
