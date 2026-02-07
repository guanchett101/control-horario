# Resolver Problema de Admin Duplicado

## 🔍 Diagnóstico del Problema

El usuario "admin" tiene 2 registros/interfaces, lo que causa conflictos al iniciar sesión.

---

## 📝 PASO 1: Identificar el Problema

### 1.1 Abrir Supabase SQL Editor

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Haz clic en **SQL Editor** (menú lateral)
4. Haz clic en **"New query"**

### 1.2 Ver Todos los Usuarios

```sql
-- Ver todos los usuarios en la tabla usuarios
SELECT 
  id,
  username,
  rol,
  empleado_id,
  created_at
FROM usuarios
ORDER BY id;
```

**Resultado esperado:**
```
id | username | rol   | empleado_id | created_at
---+----------+-------+-------------+------------
2  | admin    | admin | 3           | 2024-xx-xx
4  | marcos2  | empleado | 5        | 2024-xx-xx
?  | admin    | admin | ?           | 2024-xx-xx  ← DUPLICADO
```

### 1.3 Ver Todos los Empleados

```sql
-- Ver todos los empleados
SELECT 
  id,
  nombre,
  apellido,
  cargo,
  activo,
  created_at
FROM empleados
ORDER BY id;
```

**Resultado esperado:**
```
id | nombre        | apellido        | cargo                | activo
---+---------------+-----------------+----------------------+--------
3  | Administrador | Sistema         | Administrador        | true
5  | Marcos2       | Medina Trujillo | Empleado             | true
?  | Administrador | Sistema         | Administrador        | true  ← DUPLICADO?
```

---

## 🔧 PASO 2: Resolver el Problema

### Opción A: Eliminar Usuario Duplicado (RECOMENDADO)

Si hay 2 usuarios "admin", elimina el más reciente:

```sql
-- 1. Identificar cuál es el duplicado
SELECT 
  u.id as usuario_id,
  u.username,
  u.empleado_id,
  e.nombre,
  e.apellido,
  u.created_at
FROM usuarios u
LEFT JOIN empleados e ON u.empleado_id = e.id
WHERE u.username = 'admin'
ORDER BY u.created_at;
```

**Anota el ID del usuario más RECIENTE (el duplicado)**

```sql
-- 2. Eliminar el usuario duplicado
-- ⚠️ REEMPLAZA 'X' con el ID del usuario duplicado
DELETE FROM usuarios WHERE id = X;

-- Ejemplo: Si el duplicado tiene ID 6
-- DELETE FROM usuarios WHERE id = 6;
```

### Opción B: Eliminar Empleado Duplicado

Si hay 2 empleados "Administrador Sistema":

```sql
-- 1. Identificar empleados duplicados
SELECT 
  id,
  nombre,
  apellido,
  cargo,
  activo,
  created_at
FROM empleados
WHERE nombre = 'Administrador' AND apellido = 'Sistema'
ORDER BY created_at;
```

**Anota el ID del empleado más RECIENTE (el duplicado)**

```sql
-- 2. Primero, eliminar el usuario asociado al empleado duplicado
-- ⚠️ REEMPLAZA 'Y' con el empleado_id duplicado
DELETE FROM usuarios WHERE empleado_id = Y;

-- 3. Luego, eliminar el empleado duplicado
DELETE FROM empleados WHERE id = Y;

-- Ejemplo: Si el empleado duplicado tiene ID 7
-- DELETE FROM usuarios WHERE empleado_id = 7;
-- DELETE FROM empleados WHERE id = 7;
```

---

## ✅ PASO 3: Verificar la Solución

### 3.1 Verificar que solo hay 1 admin

```sql
-- Debe retornar solo 1 fila
SELECT 
  u.id as usuario_id,
  u.username,
  u.rol,
  u.empleado_id,
  e.nombre,
  e.apellido,
  e.cargo
FROM usuarios u
LEFT JOIN empleados e ON u.empleado_id = e.id
WHERE u.username = 'admin';
```

**Resultado esperado (solo 1 fila):**
```
usuario_id | username | rol   | empleado_id | nombre        | apellido | cargo
-----------+----------+-------+-------------+---------------+----------+---------------
2          | admin    | admin | 3           | Administrador | Sistema  | Administrador
```

### 3.2 Verificar todos los usuarios

```sql
-- Debe retornar solo 2 usuarios: admin y marcos2
SELECT 
  u.id,
  u.username,
  u.rol,
  e.nombre,
  e.apellido
FROM usuarios u
LEFT JOIN empleados e ON u.empleado_id = e.id
ORDER BY u.id;
```

**Resultado esperado:**
```
id | username | rol      | nombre        | apellido
---+----------+----------+---------------+-----------------
2  | admin    | admin    | Administrador | Sistema
4  | marcos2  | empleado | Marcos2       | Medina Trujillo
```

---

## 🔒 PASO 4: Prevenir Duplicados Futuros

### 4.1 Agregar Constraint UNIQUE

```sql
-- Asegurar que no se puedan crear usuarios duplicados
ALTER TABLE usuarios 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Asegurar que un empleado solo tenga un usuario
ALTER TABLE usuarios 
ADD CONSTRAINT unique_empleado_id UNIQUE (empleado_id);
```

### 4.2 Verificar Constraints

```sql
-- Ver todos los constraints de la tabla usuarios
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass;
```

**Resultado esperado:**
```
constraint_name      | constraint_type
---------------------+-----------------
usuarios_pkey        | p (Primary Key)
unique_username      | u (Unique)
unique_empleado_id   | u (Unique)
```

---

## 🧪 PASO 5: Probar el Login

### 5.1 Limpiar Cache del Navegador

1. Abre tu navegador
2. Presiona `Ctrl + Shift + Delete` (Windows/Linux) o `Cmd + Shift + Delete` (Mac)
3. Selecciona:
   - ✅ Cookies y datos de sitios
   - ✅ Caché
4. Haz clic en "Borrar datos"

### 5.2 Probar Login

1. Ve a: https://control-horario100.vercel.app/login
2. Ingresa:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. Haz clic en "Iniciar Sesión"

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Redirige al dashboard
- ✅ Muestra "Hola, Administrador"
- ✅ Muestra botones de admin (Empleados, Reportes, Visual)

---

## 🔍 PASO 6: Diagnóstico Avanzado (Si el problema persiste)

### 6.1 Ver Estructura Completa

```sql
-- Ver relación completa usuarios-empleados
SELECT 
  u.id as usuario_id,
  u.username,
  u.rol,
  u.empleado_id,
  e.id as empleado_real_id,
  e.nombre,
  e.apellido,
  e.cargo,
  e.activo,
  CASE 
    WHEN u.empleado_id = e.id THEN '✅ OK'
    ELSE '❌ DESINCRONIZADO'
  END as estado
FROM usuarios u
LEFT JOIN empleados e ON u.empleado_id = e.id
ORDER BY u.id;
```

### 6.2 Buscar Registros Huérfanos

```sql
-- Usuarios sin empleado asociado
SELECT 
  u.id,
  u.username,
  u.empleado_id,
  'Usuario sin empleado' as problema
FROM usuarios u
LEFT JOIN empleados e ON u.empleado_id = e.id
WHERE e.id IS NULL;

-- Empleados sin usuario asociado
SELECT 
  e.id,
  e.nombre,
  e.apellido,
  'Empleado sin usuario' as problema
FROM empleados e
LEFT JOIN usuarios u ON u.empleado_id = e.id
WHERE u.id IS NULL AND e.activo = true;
```

### 6.3 Ver Historial de Creación

```sql
-- Ver orden de creación de usuarios y empleados
SELECT 
  'Usuario' as tipo,
  id,
  username as identificador,
  created_at
FROM usuarios
UNION ALL
SELECT 
  'Empleado' as tipo,
  id,
  nombre || ' ' || apellido as identificador,
  created_at
FROM empleados
ORDER BY created_at DESC;
```

---

## 🛠️ PASO 7: Solución Definitiva (Recrear Admin Limpio)

Si todo lo anterior falla, recrea el admin desde cero:

### 7.1 Backup de Datos Importantes

```sql
-- Guardar datos del admin actual (por si acaso)
SELECT * FROM usuarios WHERE username = 'admin';
SELECT * FROM empleados WHERE nombre = 'Administrador';
```

### 7.2 Eliminar Todo lo Relacionado con Admin

```sql
-- 1. Eliminar todos los usuarios admin
DELETE FROM usuarios WHERE username = 'admin';

-- 2. Eliminar todos los empleados Administrador
DELETE FROM empleados WHERE nombre = 'Administrador' AND apellido = 'Sistema';
```

### 7.3 Recrear Admin Limpio

```sql
-- 1. Crear empleado admin
INSERT INTO empleados (
  nombre, 
  apellido, 
  email, 
  telefono, 
  cargo, 
  fecha_ingreso,
  horario_entrada,
  horario_salida,
  activo
) VALUES (
  'Administrador',
  'Sistema',
  'admin@empresa.com',
  '',
  'Administrador',
  CURRENT_DATE,
  '09:00',
  '18:00',
  true
) RETURNING id;
```

**Anota el ID que retorna (ejemplo: 10)**

```sql
-- 2. Crear usuario admin
-- ⚠️ REEMPLAZA 'Z' con el ID del empleado que acabas de crear
INSERT INTO usuarios (
  username,
  password,
  rol,
  empleado_id
) VALUES (
  'admin',
  '$2a$10$rH8qKQx5YZxQxQxQxQxQxOeKqKqKqKqKqKqKqKqKqKqKqKqKqK',  -- Hash de 'admin123'
  'admin',
  Z  -- Reemplaza con el ID del empleado
);
```

**Nota:** El hash de la contraseña `admin123` es:
```
$2a$10$rH8qKQx5YZxQxQxQxQxQxOeKqKqKqKqKqKqKqKqKqKqKqKqKqK
```

### 7.4 Verificar Creación

```sql
-- Debe retornar exactamente 1 fila
SELECT 
  u.id,
  u.username,
  u.rol,
  u.empleado_id,
  e.nombre,
  e.apellido
FROM usuarios u
JOIN empleados e ON u.empleado_id = e.id
WHERE u.username = 'admin';
```

---

## 📊 Resumen de Comandos Rápidos

### Ver el Problema
```sql
SELECT * FROM usuarios WHERE username = 'admin';
```

### Eliminar Duplicado (Opción Rápida)
```sql
-- Eliminar el usuario con ID más alto (el más reciente)
DELETE FROM usuarios 
WHERE username = 'admin' 
AND id = (
  SELECT MAX(id) FROM usuarios WHERE username = 'admin'
);
```

### Verificar Solución
```sql
SELECT COUNT(*) as total_admins 
FROM usuarios 
WHERE username = 'admin';
-- Debe retornar: 1
```

---

## ✅ Checklist Final

Después de resolver el problema, verifica:

- [ ] Solo hay 1 usuario "admin" en la tabla usuarios
- [ ] Solo hay 1 empleado "Administrador Sistema" en la tabla empleados
- [ ] El usuario admin tiene un empleado_id válido
- [ ] El empleado está activo (activo = true)
- [ ] Login funciona correctamente
- [ ] Dashboard muestra opciones de admin
- [ ] Constraints UNIQUE están aplicados

---

## 🆘 Si Nada Funciona

Contacta conmigo con esta información:

```sql
-- Ejecuta esto y envíame el resultado
SELECT 
  'USUARIOS' as tabla,
  json_agg(row_to_json(u.*)) as datos
FROM usuarios u
WHERE username = 'admin'
UNION ALL
SELECT 
  'EMPLEADOS' as tabla,
  json_agg(row_to_json(e.*)) as datos
FROM empleados e
WHERE nombre = 'Administrador';
```

---

**Fecha**: 7 de Febrero de 2026  
**Versión**: 1.0  
**Tiempo Estimado**: 10-15 minutos
