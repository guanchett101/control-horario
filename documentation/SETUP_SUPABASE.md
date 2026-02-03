# Guía de Configuración con Supabase

## 🚀 PASO 1: Crear Proyecto en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta (gratis)
3. Click en "New Project"
4. Completa:
   - **Name**: control-horario
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana (ej: South America)
5. Espera 2-3 minutos mientras se crea el proyecto

---

## 📊 PASO 2: Crear las Tablas

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de base de datos)
2. Click en "New Query"
3. Copia y pega TODO el contenido del archivo `database/supabase_schema.sql`
4. Click en "Run" o presiona Ctrl+Enter
5. Deberías ver: "Success. No rows returned"

---

## 🔑 PASO 3: Obtener Credenciales

1. Ve a **Settings** (⚙️) → **API**
2. Copia estos valores:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: (clave pública)
   - **service_role key**: (⚠️ clave secreta - NO compartir)

---

## 💻 PASO 4: Configurar el Backend Local

1. Instala las dependencias:
```bash
npm install
```

2. Crea el archivo `.env` (copia de `.env.example`):
```bash
cp .env.example .env
```

3. Edita `.env` con tus credenciales de Supabase:
```
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=tu_service_role_key_aqui
JWT_SECRET=cambia_esto_por_algo_seguro_y_aleatorio
```

---

## 👤 PASO 5: Crear Usuario Administrador

### Opción A: Generar hash de contraseña

1. Ejecuta este código en Node.js:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));"
```

2. Copia el hash generado

3. En Supabase SQL Editor, ejecuta:
```sql
-- Actualizar el hash del usuario admin
UPDATE usuarios 
SET password_hash = 'tu_hash_generado_aqui'
WHERE username = 'admin';
```

### Opción B: Usar la API (más fácil)

1. Primero inicia el servidor:
```bash
npm run dev
```

2. Usa esta petición (Postman, curl, o navegador):
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "empleadoId": 1,
    "username": "admin",
    "password": "admin123",
    "rol": "admin"
  }'
```

---

## 🧪 PASO 6: Probar Localmente

1. Inicia el backend:
```bash
npm run dev
```

2. En otra terminal, inicia el frontend:
```bash
npm run client
```

3. Abre el navegador en `http://localhost:3000`

4. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123` (o la que configuraste)

---

## 🌐 PASO 7: Desplegar Online (Gratis)

### Opción A: Vercel (Recomendado)

#### Backend:

1. Sube tu código a GitHub
2. Ve a https://vercel.com
3. Importa tu repositorio
4. Configura:
   - **Root Directory**: dejar vacío
   - **Framework Preset**: Other
5. Agrega variables de entorno:
   - `SUPABASE_URL`: tu URL de Supabase
   - `SUPABASE_KEY`: tu service_role key
   - `JWT_SECRET`: tu clave secreta
6. Deploy

#### Frontend:

1. En Vercel, crea otro proyecto
2. Importa el mismo repositorio
3. Configura:
   - **Root Directory**: `client`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Agrega variable de entorno:
   - `REACT_APP_API_URL`: URL de tu backend (ej: https://tu-backend.vercel.app/api)
5. Deploy

### Opción B: Netlify

1. Build del frontend:
```bash
cd client
npm run build
```

2. Arrastra la carpeta `client/build` a https://netlify.com

3. Para el backend, usa Netlify Functions o Railway.app

---

## 🔒 PASO 8: Configurar Seguridad en Supabase

1. Ve a **Authentication** → **Policies**
2. Habilita Row Level Security (RLS) en las tablas
3. Crea políticas básicas:

```sql
-- Permitir lectura de empleados activos
CREATE POLICY "Empleados activos son visibles"
ON empleados FOR SELECT
USING (activo = true);

-- Solo admins pueden insertar empleados
CREATE POLICY "Solo admins crean empleados"
ON empleados FOR INSERT
WITH CHECK (auth.jwt() ->> 'rol' = 'admin');
```

---

## ✅ Verificación

### Checklist:
- [ ] Proyecto creado en Supabase
- [ ] Tablas creadas (4 tablas: empleados, usuarios, registros_horario, horarios_asignados)
- [ ] Usuario admin creado
- [ ] Archivo .env configurado
- [ ] Backend corriendo en localhost:3001
- [ ] Frontend corriendo en localhost:3000
- [ ] Login funciona correctamente
- [ ] Puedes registrar entrada/salida

---

## 🆘 Solución de Problemas

### Error: "Faltan las credenciales de Supabase"
- Verifica que el archivo `.env` existe
- Confirma que las variables están correctas
- Reinicia el servidor

### Error: "Invalid API key"
- Usa el **service_role key**, no el anon key
- Verifica que no haya espacios extra

### Error al hacer login
- Verifica que el usuario admin existe en Supabase
- Genera un nuevo hash de contraseña
- Revisa la consola del navegador para más detalles

### No aparecen datos
- Verifica que las tablas se crearon correctamente
- Revisa la consola del backend para errores
- Confirma la conexión a Supabase en el dashboard

---

## 📱 Próximos Pasos

1. Cambia la contraseña del admin
2. Crea más empleados desde el panel
3. Prueba registrar entradas y salidas
4. Genera reportes
5. Despliega online cuando esté listo

---

## 💰 Límites del Plan Gratuito

- ✅ 500MB base de datos
- ✅ 2GB almacenamiento
- ✅ 50,000 usuarios activos/mes
- ✅ Backups automáticos (7 días)

Para una empresa pequeña, esto es más que suficiente.

---

## 🎉 ¡Listo!

Tu sistema de control de horarios está configurado con Supabase.
Ahora puedes desarrollar localmente y desplegar gratis cuando estés listo.
