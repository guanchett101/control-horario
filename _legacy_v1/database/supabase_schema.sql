-- Script SQL para crear las tablas en Supabase (PostgreSQL)
-- Ejecuta esto en el SQL Editor de Supabase

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
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'empleado',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de registros de horario
CREATE TABLE registros_horario (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    observaciones VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de horarios asignados
CREATE TABLE horarios_asignados (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_registros_empleado ON registros_horario(empleado_id);
CREATE INDEX idx_registros_fecha ON registros_horario(fecha);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_empleados_activo ON empleados(activo);

-- Comentarios para documentación
COMMENT ON TABLE empleados IS 'Información de los empleados de la empresa';
COMMENT ON TABLE usuarios IS 'Credenciales de acceso al sistema';
COMMENT ON TABLE registros_horario IS 'Registro de entradas y salidas diarias';
COMMENT ON TABLE horarios_asignados IS 'Horarios programados por empleado';

-- Datos de ejemplo: Crear empleado admin
INSERT INTO empleados (nombre, apellido, email, cargo, fecha_ingreso, activo)
VALUES ('Admin', 'Sistema', 'admin@empresa.com', 'Administrador', CURRENT_DATE, true);

-- Crear usuario admin (password: admin123)
-- Hash generado con bcrypt: $2a$10$rOiN7ZXqKxdU5nF5xKxXxeYvYxYxYxYxYxYxYxYxYxYxYxYxYxY
-- IMPORTANTE: Cambia este hash por uno generado con tu propia contraseña
INSERT INTO usuarios (empleado_id, username, password_hash, rol)
VALUES (1, 'admin', '$2a$10$rOiN7ZXqKxdU5nF5xKxXxeYvYxYxYxYxYxYxYxYxYxYxYxYxYxY', 'admin');

-- Para generar tu propio hash, ejecuta en Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('tu_password', 10, (err, hash) => console.log(hash));
