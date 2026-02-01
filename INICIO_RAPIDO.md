# 🚀 Inicio Rápido - 5 Minutos

## Paso 1: Crear Proyecto en Supabase (2 min)

1. Ve a https://supabase.com y crea cuenta
2. Click "New Project"
3. Nombre: `control-horario`
4. Contraseña: (guárdala)
5. Region: South America
6. Espera 2 minutos

## Paso 2: Crear Tablas (1 min)

1. En Supabase, ve a **SQL Editor**
2. Copia TODO el contenido de `database/supabase_schema.sql`
3. Pégalo y click "Run"
4. ✅ Deberías ver "Success"

## Paso 3: Configurar Proyecto (1 min)

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

Edita `.env`:
1. En Supabase, ve a **Settings** → **API**
2. Copia:
   - Project URL → `SUPABASE_URL`
   - service_role key → `SUPABASE_KEY`
3. Inventa un `JWT_SECRET` (cualquier texto aleatorio)

## Paso 4: Crear Contraseña Admin (30 seg)

```bash
node scripts/generar-password.js admin123
```

Copia el hash generado y ejecútalo en Supabase SQL Editor.

## Paso 5: Iniciar (30 seg)

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run client
```

## ✅ ¡Listo!

Abre http://localhost:3000

- Usuario: `admin`
- Contraseña: `admin123`

---

## 🌐 Para Ponerlo Online (Gratis)

1. Sube tu código a GitHub
2. Ve a https://vercel.com
3. Importa tu repositorio
4. Agrega las variables de entorno
5. Deploy

Ver guía completa en `SETUP_SUPABASE.md`
