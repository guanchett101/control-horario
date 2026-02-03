# Migración a Supabase (PostgreSQL)

## ¿Por qué Supabase?

- ✅ **Gratis**: 500MB base de datos, 2GB almacenamiento
- ✅ **Fácil**: No necesitas configurar servidor
- ✅ **Rápido**: Deploy en minutos
- ✅ **Moderno**: Dashboard web, API automática
- ✅ **Seguro**: Autenticación incluida, backups automáticos

---

## PASO 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Crea cuenta gratis (con GitHub o email)
3. Crea un nuevo proyecto:
   - Nombre: `control-horario`
   - Database Password: (guarda esta contraseña)
   - Region: Elige la más cercana

---

## PASO 2: Crear las tablas en Supabase

En el dashboard de Supabase, ve a **SQL Editor** y ejecuta:

```sql
-- Tabla de empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    cargo VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    fecha_ingreso DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de usuarios (para login)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de registros de horario
CREATE TABLE registros_horario (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id),
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    observaciones VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de horarios asignados
CREATE TABLE horarios_asignados (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id),
    dia_semana SMALLINT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_registros_empleado ON registros_horario(empleado_id);
CREATE INDEX idx_registros_fecha ON registros_horario(fecha);
CREATE INDEX idx_usuarios_username ON usuarios(username);
```

---

## PASO 3: Obtener credenciales de Supabase

En tu proyecto de Supabase:
1. Ve a **Settings** → **API**
2. Copia:
   - `Project URL` (ejemplo: https://xxxxx.supabase.co)
   - `anon public` key
   - `service_role` key (¡guárdala en secreto!)

---

## PASO 4: Actualizar el código del backend

Instala el cliente de Supabase:
```bash
npm install @supabase/supabase-js
```

Actualiza tu `.env`:
```
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=tu_service_role_key_aqui
JWT_SECRET=tu_clave_secreta
```

---

## PASO 5: Crear usuario administrador

En el **SQL Editor** de Supabase:

```sql
-- Primero crea un empleado admin
INSERT INTO empleados (nombre, apellido, email, cargo, fecha_ingreso, activo)
VALUES ('Admin', 'Sistema', 'admin@empresa.com', 'Administrador', CURRENT_DATE, true);

-- Luego crea el usuario (usa bcrypt para generar el hash)
-- Hash de "admin123": $2a$10$rOiN7ZXqKxdU5nF5xKxXxeYvYxYxYxYxYxYxYxYxYxYxYxYxYxY
INSERT INTO usuarios (empleado_id, username, password_hash, rol)
VALUES (1, 'admin', '$2a$10$rOiN7ZXqKxdU5nF5xKxXxeYvYxYxYxYxYxYxYxYxYxYxYxYxYxY', 'admin');
```

Para generar tu propio hash:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('tu_password', 10, (err, hash) => console.log(hash));
```

---

## PASO 6: Desplegar en Vercel (Gratis)

### Frontend en Vercel

1. Sube tu código a GitHub
2. Ve a https://vercel.com
3. Importa tu repositorio
4. Configura:
   - Framework: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Variables de entorno:
   ```
   REACT_APP_API_URL=https://tu-backend.vercel.app/api
   ```
6. Deploy

### Backend en Vercel

1. Crea `vercel.json` en la raíz:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. Deploy desde Vercel
3. Configura variables de entorno en Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `JWT_SECRET`

---

## ALTERNATIVA: Todo en un solo lugar con Netlify

1. Build del frontend:
```bash
cd client
npm run build
```

2. Sube a Netlify:
   - Arrastra la carpeta `client/build` a netlify.com
   - O conecta tu repo de GitHub

3. Para el backend, usa Netlify Functions (serverless)

---

## COSTOS

### Plan Gratuito Supabase:
- ✅ 500MB base de datos
- ✅ 2GB almacenamiento
- ✅ 50,000 usuarios activos/mes
- ✅ Backups automáticos (7 días)
- ✅ SSL incluido

### Plan Gratuito Vercel:
- ✅ 100GB bandwidth/mes
- ✅ Dominio .vercel.app gratis
- ✅ SSL automático
- ✅ Deploy ilimitados

**Total: $0/mes** (perfecto para empresa pequeña)

---

## VENTAJAS vs Firebird + VPS

| Característica | Firebird + VPS | Supabase + Vercel |
|----------------|----------------|-------------------|
| Costo mensual | $5-10 | $0 |
| Configuración | Compleja | Fácil |
| Mantenimiento | Manual | Automático |
| Backups | Manual | Automático |
| Escalabilidad | Limitada | Automática |
| Dashboard web | No | Sí |
| API REST | Manual | Automática |

---

## ¿Quieres que adapte el código?

Si decides usar Supabase, puedo:
1. Adaptar todas las rutas del backend para usar Supabase
2. Actualizar las consultas SQL
3. Configurar la autenticación con Supabase Auth
4. Preparar todo para deploy en Vercel

¿Procedemos con la migración a Supabase?
