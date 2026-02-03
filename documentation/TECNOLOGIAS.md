# 🚀 Tecnologías del Sistema de Control de Horarios

## 📋 Resumen del Proyecto

Sistema web para control de horarios de empleados con registro de entradas/salidas, gestión de empleados y generación de reportes exportables.

---

## 🎨 Frontend

### Framework y Librerías
- **React 19.2.4** - Librería principal para la interfaz de usuario
- **React Router DOM 7.13.0** - Navegación entre páginas
- **Axios 1.13.4** - Cliente HTTP para llamadas a la API

### Estilos
- **CSS personalizado** - Diseño minimalista y profesional
- **Responsive Design** - Adaptado para móviles y escritorio
- Paleta de colores profesional (azules, verdes, rojos)

### Build Tool
- **React Scripts 5.0.1** - Herramientas de desarrollo y compilación
- **Vite** - Bundler rápido para desarrollo

### Alojamiento Frontend
- **Vercel** - Hosting y despliegue automático
- URL: https://control-horario-weld.vercel.app
- Región: Global CDN
- Deploy automático desde GitHub

---

## ⚙️ Backend

### Runtime y Framework
- **Node.js 24.x** - Entorno de ejecución JavaScript
- **Express.js** - Framework web (convertido a funciones serverless)

### Funciones Serverless
- **Vercel Serverless Functions** - API sin servidor
- Archivos en `/api`:
  - `auth.js` - Autenticación y gestión de usuarios
  - `empleados.js` - CRUD de empleados
  - `registros.js` - Registro de entradas/salidas

### Seguridad
- **bcryptjs 2.4.3** - Hash de contraseñas
- **jsonwebtoken 9.0.2** - Tokens JWT para sesiones
- **CORS** - Control de acceso entre dominios

### Alojamiento Backend
- **Vercel Serverless Functions** - API sin servidor
- Región: Washington D.C. (iad1)
- Escalado automático

---

## 🗄️ Base de Datos

### Sistema de Base de Datos
- **Supabase** - PostgreSQL como servicio
- **PostgreSQL** - Base de datos relacional

### Librería de Conexión
- **@supabase/supabase-js 2.93.3** - Cliente oficial de Supabase

### Estructura de Tablas
1. **empleados** - Información de empleados
   - id, nombre, apellido, email, telefono, cargo, fecha_ingreso, activo

2. **usuarios** - Credenciales de acceso
   - id, empleado_id, username, password_hash, rol

3. **registros_horario** - Entradas y salidas
   - id, empleado_id, fecha, hora_entrada, hora_salida

4. **horarios_asignados** - Horarios programados (opcional)
   - id, empleado_id, dia_semana, hora_inicio, hora_fin

### Alojamiento Base de Datos
- **Supabase Cloud** - PostgreSQL gestionado
- URL: https://ytaypvluxvktvizyrrmj.supabase.co
- Región: Europa (según configuración del usuario)
- Plan: Gratuito (hasta 500MB)

---

## 🔐 Autenticación y Seguridad

### Sistema de Autenticación
- **JWT (JSON Web Tokens)** - Sesiones sin estado
- **bcrypt** - Hash de contraseñas con salt
- Tokens con expiración de 8 horas

### Variables de Entorno
```
SUPABASE_URL - URL de la base de datos
SUPABASE_KEY - Clave de servicio de Supabase
JWT_SECRET - Secreto para firmar tokens
```

---

## 📦 Gestión de Dependencias

### Frontend
- **npm** - Gestor de paquetes
- `package.json` en `/frontend`

### Backend
- **npm** - Gestor de paquetes
- `package.json` en raíz del proyecto

---

## 🚀 Despliegue y CI/CD

### Control de Versiones
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto
- Repositorio: https://github.com/guanchett101/control-horario

### Despliegue Automático
- **Vercel** - Plataforma de despliegue
- Deploy automático al hacer push a `main`
- Build automático del frontend
- Funciones serverless automáticas

### Proceso de Deploy
1. Push a GitHub (rama `main`)
2. Vercel detecta el cambio
3. Instala dependencias (`npm install`)
4. Compila frontend (`npm run build`)
5. Despliega funciones serverless
6. Actualiza la URL de producción

---

## 📊 Funcionalidades Principales

### Para Administradores
- ✅ Gestión completa de empleados
- ✅ Creación automática de usuarios
- ✅ Visualización de actividad en tiempo real
- ✅ Generación de reportes por empleado y fecha
- ✅ Exportación a Excel (.xls)
- ✅ Exportación a CSV (.csv)
- ✅ Dashboard con estadísticas

### Para Empleados
- ✅ Login con lista de usuarios
- ✅ Registro de entrada
- ✅ Registro de salida
- ✅ Visualización de horarios propios
- ✅ Interfaz optimizada para móviles

---

## 🌐 Acceso al Sistema

### Producción (Internet)
- **URL**: https://control-horario-weld.vercel.app
- **Acceso**: Desde cualquier dispositivo con navegador
- **Móviles**: Compatible con iOS y Android

### Desarrollo Local
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Script**: `./iniciar-local.sh`

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ Chrome (móvil y escritorio)
- ✅ Safari (iOS y macOS)
- ✅ Firefox (móvil y escritorio)
- ✅ Edge (escritorio)

### Dispositivos
- ✅ Smartphones (iOS/Android)
- ✅ Tablets
- ✅ Computadoras de escritorio
- ✅ Laptops

---

## 🔧 Herramientas de Desarrollo

### Scripts Disponibles
- `npm start` - Inicia servidor backend
- `npm run client` - Inicia frontend
- `npm run build` - Compila frontend para producción
- `./iniciar-local.sh` - Inicia todo el sistema localmente
- `./detener-local.sh` - Detiene servidores locales

### Utilidades
- `crear-admin.js` - Crea usuario administrador
- `verificar-usuario.js` - Verifica usuarios en BD
- `eliminar-usuario.js` - Elimina empleados/usuarios

---

## 📈 Escalabilidad

### Límites Actuales (Plan Gratuito)
- **Vercel**: 100GB bandwidth/mes
- **Supabase**: 500MB almacenamiento, 2GB transferencia/mes
- **Funciones Serverless**: 100 horas de ejecución/mes

### Posibilidades de Escalado
- ✅ Upgrade a plan Pro de Vercel ($20/mes)
- ✅ Upgrade a plan Pro de Supabase ($25/mes)
- ✅ Soporte para miles de empleados
- ✅ Múltiples empresas/organizaciones

---

## 🎯 Ventajas de la Arquitectura

### Serverless
- ✅ Sin gestión de servidores
- ✅ Escalado automático
- ✅ Pago por uso
- ✅ Alta disponibilidad

### Supabase (PostgreSQL)
- ✅ Base de datos relacional robusta
- ✅ Backups automáticos
- ✅ API REST automática
- ✅ Seguridad integrada

### Vercel
- ✅ Deploy en segundos
- ✅ CDN global
- ✅ HTTPS automático
- ✅ Rollback instantáneo

---

## 📝 Notas Técnicas

### Conversión a Serverless
El proyecto fue convertido de una aplicación Express tradicional a funciones serverless para compatibilidad con Vercel. Cada endpoint API es ahora una función independiente que maneja múltiples rutas internamente.

### Gestión de Estado
- Frontend: React Hooks (useState, useEffect)
- Backend: Stateless (JWT para sesiones)
- Base de datos: PostgreSQL (estado persistente)

### Optimizaciones
- Lazy loading de componentes
- Caché de consultas frecuentes
- Compresión de assets
- Minificación de código

---

## 🔄 Actualizaciones Futuras Posibles

- [ ] Notificaciones push
- [ ] Geolocalización para fichajes
- [ ] Reconocimiento facial
- [ ] App móvil nativa
- [ ] Integración con nóminas
- [ ] Dashboard de analíticas avanzadas
- [ ] Multi-idioma
- [ ] Modo oscuro

---

## 📞 Información del Proyecto

- **Versión**: 1.0.0
- **Fecha de Creación**: Febrero 2026
- **Última Actualización**: Febrero 2026
- **Estado**: ✅ Producción

---

## 🏆 Resumen Técnico

| Componente | Tecnología | Alojamiento |
|------------|-----------|-------------|
| Frontend | React 19 | Vercel |
| Backend | Node.js + Express (Serverless) | Vercel Functions |
| Base de Datos | PostgreSQL | Supabase (Europa) |
| Autenticación | JWT + bcrypt | - |
| Deploy | Git + GitHub | Vercel (Auto) |
| CDN | - | Vercel Edge Network |

---

**Sistema completamente funcional y listo para producción** ✅
