# Sistema de Control de Horarios 🕐

Sistema web completo para control de horarios de empleados. Gratis, fácil de usar y listo para producción.

## ⚡ Inicio Rápido (5 minutos)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar Supabase (ver PASOS_VISUALES.md)
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# 3. Verificar configuración
npm run verificar

# 4. Iniciar
npm run dev        # Terminal 1 - Backend
npm run client     # Terminal 2 - Frontend
```

📚 **Guía completa con imágenes:** [PASOS_VISUALES.md](PASOS_VISUALES.md)

---

## 🎯 Características

- ✅ Registro de entrada/salida de empleados
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de empleados (CRUD completo)
- ✅ Reportes por fechas
- ✅ Autenticación segura (JWT)
- ✅ Roles de usuario (Admin/Empleado)
- ✅ Responsive (móvil y desktop)

---

## 🚀 Tecnologías

- **Frontend:** React 19
- **Backend:** Node.js + Express
- **Base de Datos:** Supabase (PostgreSQL)
- **Deploy:** Vercel (gratis)

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [PASOS_VISUALES.md](PASOS_VISUALES.md) | 👀 Guía visual paso a paso |
| [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | ⚡ Configuración en 5 minutos |
| [SETUP_SUPABASE.md](SETUP_SUPABASE.md) | 🔧 Configuración detallada |
| [GUIA_DEPLOYMENT.md](GUIA_DEPLOYMENT.md) | 🌐 Cómo desplegar online |
| [EJEMPLOS_API.md](EJEMPLOS_API.md) | 📡 Ejemplos de uso de la API |
| [RESUMEN_PROYECTO.md](RESUMEN_PROYECTO.md) | 📦 Arquitectura completa |

---

## 🔐 Credenciales por Defecto

- **Usuario:** admin
- **Contraseña:** admin123

⚠️ Cámbialas después del primer login

---

## 📁 Estructura del Proyecto

```
control-horario/
├── config/              # Configuración
│   └── supabase.js     # Cliente de Supabase
├── routes/             # Rutas de la API
│   ├── auth.js        # Autenticación
│   ├── empleados.js   # CRUD empleados
│   └── registros.js   # Registro horarios
├── client/            # Frontend React
│   └── src/
│       └── components/
├── database/          # Scripts SQL
│   └── supabase_schema.sql
├── scripts/           # Utilidades
│   ├── generar-password.js
│   └── verificar-setup.js
└── server.js         # Servidor Express
```

---

## 🛠️ Comandos Disponibles

```bash
npm run dev              # Iniciar backend en desarrollo
npm run client           # Iniciar frontend
npm run verificar        # Verificar configuración
npm run generar-password # Generar hash de contraseña
npm run build           # Build del frontend
```

---

## 🌐 Desplegar Online (Gratis)

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Configura variables de entorno
5. Deploy automático

📚 Ver guía completa: [GUIA_DEPLOYMENT.md](GUIA_DEPLOYMENT.md)

---

## 💰 Costos

- **Desarrollo:** $0
- **Producción:** $0/mes (Supabase + Vercel gratis)
- **Escalado:** ~$45/mes (planes Pro)

Perfecto para empresas pequeñas (hasta ~50 empleados)

---

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Empleados
- `GET /api/empleados` - Listar todos
- `POST /api/empleados` - Crear empleado
- `PUT /api/empleados/:id` - Actualizar
- `DELETE /api/empleados/:id` - Desactivar

### Registros
- `POST /api/registros/entrada` - Registrar entrada
- `POST /api/registros/salida` - Registrar salida
- `GET /api/registros/hoy` - Registros del día
- `GET /api/registros/empleado/:id` - Por empleado

📡 Ver ejemplos: [EJEMPLOS_API.md](EJEMPLOS_API.md)

---

## 🆘 Solución de Problemas

### Error: "Faltan las credenciales de Supabase"
```bash
# Verifica que .env existe y tiene las credenciales
cat .env

# Si no existe, créalo
cp .env.example .env
# Edita con tus credenciales de Supabase
```

### Error al hacer login
```bash
# Genera nuevo hash de contraseña
npm run generar-password admin123

# Actualiza en Supabase SQL Editor
UPDATE usuarios SET password_hash = 'hash_generado' WHERE username = 'admin';
```

### Más ayuda
- [PASOS_VISUALES.md](PASOS_VISUALES.md) - Guía visual completa
- [SETUP_SUPABASE.md](SETUP_SUPABASE.md) - Troubleshooting detallado

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit (`git commit -am 'Agregar funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Pull Request

---

## 📄 Licencia

MIT - Libre para uso personal y comercial

---

## 🎉 ¡Comienza Ahora!

```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/control-horario.git
cd control-horario

# Sigue la guía visual
cat PASOS_VISUALES.md
```

**¿Necesitas ayuda?** Lee [PASOS_VISUALES.md](PASOS_VISUALES.md) para una guía paso a paso con capturas.

---

**Hecho con ❤️ para empresas pequeñas**
