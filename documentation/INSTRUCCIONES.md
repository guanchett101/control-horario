# Instrucciones de Instalación y Uso

## Requisitos Previos

1. **Node.js** (versión 14 o superior)
2. **Firebird** (versión 3.0 o superior)
3. **npm** (viene con Node.js)

## Paso 1: Configurar la Base de Datos Firebird

1. Instala Firebird si no lo tienes
2. Crea una nueva base de datos (por ejemplo: `control_horario.fdb`)
3. Ejecuta el script SQL ubicado en `database/schema.sql` usando isql o FlameRobin:

```bash
isql -user SYSDBA -password masterkey
CREATE DATABASE '/ruta/a/control_horario.fdb';
INPUT 'database/schema.sql';
QUIT;
```

## Paso 2: Configurar el Backend

1. Instala las dependencias del backend:
```bash
npm install
```

2. Copia el archivo de configuración:
```bash
cp .env.example .env
```

3. Edita el archivo `.env` con tus datos de Firebird:
```
PORT=3001
DB_HOST=localhost
DB_PORT=3050
DB_DATABASE=/ruta/completa/a/control_horario.fdb
DB_USER=SYSDBA
DB_PASSWORD=masterkey
JWT_SECRET=cambia_esto_por_algo_seguro
```

## Paso 3: Crear Usuario Administrador

Necesitas crear manualmente el primer usuario administrador en la base de datos.

1. Primero, genera un hash de contraseña. Ejecuta este código en Node.js:

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123'; // Cambia esto
bcrypt.hash(password, 10, (err, hash) => {
  console.log(hash);
});
```

2. Inserta el usuario en Firebird:

```sql
-- Primero crea un empleado
INSERT INTO EMPLEADOS (NOMBRE, APELLIDO, EMAIL, CARGO, FECHA_INGRESO, ACTIVO)
VALUES ('Admin', 'Sistema', 'admin@empresa.com', 'Administrador', CURRENT_DATE, 1);

-- Luego crea el usuario (reemplaza el hash con el que generaste)
INSERT INTO USUARIOS (EMPLEADO_ID, USERNAME, PASSWORD_HASH, ROL)
VALUES (1, 'admin', '$2a$10$hash_generado_aqui', 'admin');
```

## Paso 4: Iniciar el Sistema

### Modo Desarrollo

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run client
```

El backend estará en `http://localhost:3001`
El frontend estará en `http://localhost:3000`

### Modo Producción

```bash
# Construir el frontend
cd client
npm run build
cd ..

# Iniciar el backend
npm start
```

## Paso 5: Usar el Sistema

1. Abre tu navegador en `http://localhost:3000`
2. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: la que configuraste

3. Como administrador puedes:
   - Ver el dashboard con registros del día
   - Crear nuevos empleados
   - Ver reportes de horarios
   - Registrar entradas y salidas

## Funcionalidades

### Para Empleados:
- Registrar entrada al llegar
- Registrar salida al terminar
- Ver sus propios registros

### Para Administradores:
- Todo lo anterior, más:
- Gestionar empleados (crear, editar, desactivar)
- Ver registros de todos los empleados
- Generar reportes por fechas
- Ver estadísticas en tiempo real

## Solución de Problemas

### Error de conexión a Firebird
- Verifica que Firebird esté corriendo
- Confirma la ruta completa de la base de datos en `.env`
- Verifica usuario y contraseña

### Error al iniciar el frontend
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Puerto en uso
Cambia el puerto en `.env` (backend) o en `client/package.json` (frontend)

## Próximos Pasos Recomendados

1. Cambiar las contraseñas por defecto
2. Configurar HTTPS para producción
3. Implementar backup automático de la base de datos
4. Agregar validaciones adicionales
5. Implementar notificaciones por email
