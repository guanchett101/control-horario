# 📦 Resumen del Proyecto - Control de Horarios

## 🎯 ¿Qué es este proyecto?

Sistema web para control de horarios de empleados en empresas pequeñas.
Los empleados pueden registrar su entrada y salida, y los administradores pueden gestionar empleados y ver reportes.

---

## 🏗️ Arquitectura

```
┌─────────────────┐
│   React App     │  ← Frontend (Puerto 3000)
│   (Cliente)     │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Express API   │  ← Backend (Puerto 3001)
│   (Servidor)    │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   Supabase      │  ← Base de Datos (PostgreSQL)
│   (Cloud)       │
└─────────────────┘
```

---

## 📁 Estructura de Archivos

```
control-horario/
│
├── 📄 Documentación
│   ├── README.md                    # Documentación principal
│   ├── INICIO_RAPIDO.md            # Guía de 5 minutos
│   ├── SETUP_SUPABASE.md           # Configuración detallada
│   ├── MIGRACION_SUPABASE.md       # Por qué Supabase
│   ├── GUIA_DEPLOYMENT.md          # Cómo desplegar
│   ├── CHECKLIST_DEPLOYMENT.md     # Lista de verificación
│   ├── EJEMPLOS_API.md             # Ejemplos de uso
│   └── RESUMEN_PROYECTO.md         # Este archivo
│
├── 🔧 Configuración
│   ├── .env.example                # Plantilla de variables
│   ├── .gitignore                  # Archivos a ignorar
│   ├── package.json                # Dependencias backend
│   ├── vercel.json                 # Config para Vercel
│   └── server.js                   # Servidor Express
│
├── 🗄️ Base de Datos
│   └── database/
│       └── supabase_schema.sql     # Script SQL para Supabase
│
├── ⚙️ Backend
│   ├── config/
│   │   └── supabase.js             # Cliente de Supabase
│   └── routes/
│       ├── auth.js                 # Login/registro
│       ├── empleados.js            # CRUD empleados
│       └── registros.js            # Registro horarios
│
├── 🎨 Frontend
│   └── client/
│       ├── package.json            # Dependencias frontend
│       ├── public/                 # Archivos estáticos
│       └── src/
│           ├── App.js              # Componente principal
│           ├── App.css             # Estilos globales
│           └── components/
│               ├── Login.js        # Pantalla de login
│               ├── Login.css       # Estilos login
│               ├── Navbar.js       # Barra de navegación
│               ├── Dashboard.js    # Página principal
│               ├── RegistroHorario.js  # Registrar entrada/salida
│               ├── Empleados.js    # Gestión de empleados
│               └── Reportes.js     # Reportes y estadísticas
│
└── 🛠️ Scripts
    └── scripts/
        └── generar-password.js     # Generar hash de contraseña
```

---

## 🔑 Archivos Clave

### Backend

1. **server.js** - Servidor principal
   - Configura Express
   - Define rutas
   - Inicia servidor

2. **config/supabase.js** - Conexión a base de datos
   - Crea cliente de Supabase
   - Exporta para usar en rutas

3. **routes/auth.js** - Autenticación
   - Login
   - Registro de usuarios
   - Generación de JWT

4. **routes/empleados.js** - Gestión de empleados
   - Listar, crear, actualizar, eliminar

5. **routes/registros.js** - Control de horarios
   - Registrar entrada/salida
   - Consultar registros

### Frontend

1. **App.js** - Componente raíz
   - Maneja autenticación
   - Define rutas
   - Gestiona estado global

2. **components/Login.js** - Pantalla de inicio de sesión

3. **components/Dashboard.js** - Página principal
   - Muestra estadísticas
   - Lista registros del día

4. **components/RegistroHorario.js** - Registrar entrada/salida

5. **components/Empleados.js** - CRUD de empleados (solo admin)

6. **components/Reportes.js** - Reportes por fechas (solo admin)

---

## 🗃️ Base de Datos

### Tablas

1. **empleados**
   - Información de empleados
   - Campos: id, nombre, apellido, email, telefono, cargo, activo, fecha_ingreso

2. **usuarios**
   - Credenciales de acceso
   - Campos: id, empleado_id, username, password_hash, rol

3. **registros_horario**
   - Entradas y salidas diarias
   - Campos: id, empleado_id, fecha, hora_entrada, hora_salida, observaciones

4. **horarios_asignados**
   - Horarios programados (futuro)
   - Campos: id, empleado_id, dia_semana, hora_inicio, hora_fin, activo

---

## 🔄 Flujo de Datos

### Login
```
Usuario → Frontend → POST /api/auth/login → Backend → Supabase
                                                ↓
Usuario ← Frontend ← Token JWT + Datos ← Backend ← Datos usuario
```

### Registrar Entrada
```
Usuario → Frontend → POST /api/registros/entrada → Backend → Supabase
                                                       ↓
Usuario ← Frontend ← Confirmación ← Backend ← INSERT exitoso
```

### Ver Dashboard
```
Usuario → Frontend → GET /api/registros/hoy → Backend → Supabase
                                                  ↓
Usuario ← Frontend ← Lista registros ← Backend ← SELECT registros
```

---

## 🚀 Comandos Importantes

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Configurar variables
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar backend
npm run dev

# Iniciar frontend (otra terminal)
npm run client
```

### Generar Hash de Contraseña
```bash
node scripts/generar-password.js tu_contraseña
```

### Build para Producción
```bash
cd client
npm run build
```

---

## 🌐 URLs

### Desarrollo
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API: http://localhost:3001/api

### Producción (después de deploy)
- Frontend: https://tu-app.vercel.app
- Backend: https://tu-api.vercel.app
- Supabase: https://xxxxx.supabase.co

---

## 🔐 Variables de Entorno

### Backend (.env)
```
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=tu_service_role_key
JWT_SECRET=tu_clave_secreta
```

### Frontend (client/.env.production)
```
REACT_APP_API_URL=https://tu-backend.vercel.app/api
```

---

## 📊 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Empleados
- `GET /api/empleados` - Listar todos
- `GET /api/empleados/:id` - Obtener uno
- `POST /api/empleados` - Crear
- `PUT /api/empleados/:id` - Actualizar
- `DELETE /api/empleados/:id` - Desactivar

### Registros
- `POST /api/registros/entrada` - Registrar entrada
- `POST /api/registros/salida` - Registrar salida
- `GET /api/registros/hoy` - Registros del día
- `GET /api/registros/empleado/:id` - Por empleado

---

## 👥 Roles de Usuario

### Empleado
- ✅ Ver dashboard
- ✅ Registrar entrada/salida
- ❌ Gestionar empleados
- ❌ Ver reportes completos

### Administrador
- ✅ Todo lo de empleado
- ✅ Gestionar empleados
- ✅ Ver reportes completos
- ✅ Acceso total al sistema

---

## 💰 Costos

### Desarrollo (Localhost)
- **Costo: $0**

### Producción (Gratis)
- Supabase: $0 (hasta 500MB)
- Vercel: $0 (hasta 100GB bandwidth)
- **Total: $0/mes**

### Producción (Escalado)
- Supabase Pro: $25/mes (8GB DB)
- Vercel Pro: $20/mes (1TB bandwidth)
- Dominio: $10-15/año
- **Total: ~$45-50/mes**

---

## 📈 Límites del Plan Gratuito

### Supabase
- 500MB base de datos
- 2GB almacenamiento
- 50,000 usuarios activos/mes
- Backups 7 días

### Vercel
- 100GB bandwidth/mes
- 6,000 minutos build/mes
- Deploy ilimitados

**Suficiente para:** ~50 empleados con uso normal

---

## 🔧 Tecnologías Usadas

### Backend
- Node.js 18+
- Express 4.18
- Supabase JS 2.39
- bcryptjs 2.4
- jsonwebtoken 9.0

### Frontend
- React 19
- React Router 7
- Axios 1.13

### Base de Datos
- PostgreSQL (via Supabase)

### Deploy
- Vercel (frontend + backend)
- Supabase (base de datos)

---

## 📚 Guías de Lectura Recomendadas

1. **Primeros pasos:** `INICIO_RAPIDO.md`
2. **Configuración completa:** `SETUP_SUPABASE.md`
3. **Desplegar online:** `GUIA_DEPLOYMENT.md`
4. **Probar la API:** `EJEMPLOS_API.md`
5. **Antes de lanzar:** `CHECKLIST_DEPLOYMENT.md`

---

## 🆘 Soporte

### Problemas Comunes

1. **Error de conexión a Supabase**
   - Verifica `.env`
   - Confirma credenciales en Supabase

2. **Error al hacer login**
   - Verifica que el usuario existe
   - Regenera hash de contraseña

3. **Frontend no conecta con backend**
   - Verifica que ambos estén corriendo
   - Confirma proxy en `client/package.json`

### Recursos
- Documentación Supabase: https://supabase.com/docs
- Documentación Vercel: https://vercel.com/docs
- Documentación React: https://react.dev

---

## ✨ Próximas Funcionalidades (Ideas)

- [ ] Notificaciones por email
- [ ] Exportar reportes a Excel
- [ ] Gráficos de asistencia
- [ ] App móvil (React Native)
- [ ] Reconocimiento facial
- [ ] Geolocalización
- [ ] Integración con nómina
- [ ] Dashboard de métricas

---

## 🎉 ¡Listo para Usar!

Sigue `INICIO_RAPIDO.md` para comenzar en 5 minutos.
