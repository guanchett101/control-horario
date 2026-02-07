-- ============================================
-- SISTEMA DE PERFILES DE TURNO
-- ============================================

-- 1. Crear tabla de perfiles de turno
CREATE TABLE IF NOT EXISTS perfiles_turno (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  tipo VARCHAR(20) NOT NULL DEFAULT 'continuo', -- 'continuo' o 'partido'
  
  -- Turno principal / mañana
  hora_entrada TIME NOT NULL,
  hora_salida TIME NOT NULL,
  
  -- Pausa para comer (opcional, solo para tipo 'continuo')
  pausa_inicio TIME,
  pausa_fin TIME,
  
  -- Turno tarde (opcional, solo para tipo 'partido')
  hora_entrada_tarde TIME,
  hora_salida_tarde TIME,
  
  -- Metadata
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Agregar columna perfil_turno_id a empleados
ALTER TABLE empleados 
ADD COLUMN IF NOT EXISTS perfil_turno_id INTEGER REFERENCES perfiles_turno(id) ON DELETE SET NULL;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_empleados_perfil_turno ON empleados(perfil_turno_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_turno_activo ON perfiles_turno(activo);

-- 4. Insertar perfiles de turno predefinidos

-- Perfil 1: Oficina Estándar (9-18h con 1h comida)
INSERT INTO perfiles_turno (nombre, descripcion, tipo, hora_entrada, hora_salida, pausa_inicio, pausa_fin)
VALUES (
  'Oficina Estándar',
  'Jornada continua de 9:00 a 18:00 con 1 hora para comer (14:00-15:00). Total: 8 horas efectivas.',
  'continuo',
  '09:00',
  '18:00',
  '14:00',
  '15:00'
) ON CONFLICT (nombre) DO NOTHING;

-- Perfil 2: Jornada Intensiva (9-15h sin pausa)
INSERT INTO perfiles_turno (nombre, descripcion, tipo, hora_entrada, hora_salida, pausa_inicio, pausa_fin)
VALUES (
  'Jornada Intensiva',
  'Jornada continua de 9:00 a 15:00 sin pausa. Total: 6 horas.',
  'continuo',
  '09:00',
  '15:00',
  NULL,
  NULL
) ON CONFLICT (nombre) DO NOTHING;

-- Perfil 3: Horario Partido (9-13h y 15-19h)
INSERT INTO perfiles_turno (nombre, descripcion, tipo, hora_entrada, hora_salida, hora_entrada_tarde, hora_salida_tarde)
VALUES (
  'Horario Partido',
  'Jornada partida: 9:00-13:00 y 15:00-19:00. Total: 8 horas.',
  'partido',
  '09:00',
  '13:00',
  '15:00',
  '19:00'
) ON CONFLICT (nombre) DO NOTHING;

-- Perfil 4: Turno Mañana (6-14h con 30min pausa)
INSERT INTO perfiles_turno (nombre, descripcion, tipo, hora_entrada, hora_salida, pausa_inicio, pausa_fin)
VALUES (
  'Turno Mañana',
  'Turno de mañana de 6:00 a 14:00 con 30 minutos de pausa (10:00-10:30). Total: 7.5 horas.',
  'continuo',
  '06:00',
  '14:00',
  '10:00',
  '10:30'
) ON CONFLICT (nombre) DO NOTHING;

-- Perfil 5: Turno Tarde (14-22h con 30min pausa)
INSERT INTO perfiles_turno (nombre, descripcion, tipo, hora_entrada, hora_salida, pausa_inicio, pausa_fin)
VALUES (
  'Turno Tarde',
  'Turno de tarde de 14:00 a 22:00 con 30 minutos de pausa (18:00-18:30). Total: 7.5 horas.',
  'continuo',
  '14:00',
  '22:00',
  '18:00',
  '18:30'
) ON CONFLICT (nombre) DO NOTHING;

-- Perfil 6: Turno Noche (22-6h con 1h pausa)
INSERT INTO perfiles_turno (nombre, descripcion, tipo, hora_entrada, hora_salida, pausa_inicio, pausa_fin)
VALUES (
  'Turno Noche',
  'Turno nocturno de 22:00 a 06:00 con 1 hora de pausa (02:00-03:00). Total: 7 horas.',
  'continuo',
  '22:00',
  '06:00',
  '02:00',
  '03:00'
) ON CONFLICT (nombre) DO NOTHING;

-- 5. Comentarios para documentación
COMMENT ON TABLE perfiles_turno IS 'Perfiles de turno reutilizables para asignar a empleados';
COMMENT ON COLUMN perfiles_turno.tipo IS 'Tipo de jornada: continuo (con/sin pausa) o partido (2 turnos)';
COMMENT ON COLUMN perfiles_turno.pausa_inicio IS 'Hora inicio de pausa para comer (solo tipo continuo)';
COMMENT ON COLUMN perfiles_turno.pausa_fin IS 'Hora fin de pausa para comer (solo tipo continuo)';
COMMENT ON COLUMN perfiles_turno.hora_entrada_tarde IS 'Hora entrada turno tarde (solo tipo partido)';
COMMENT ON COLUMN perfiles_turno.hora_salida_tarde IS 'Hora salida turno tarde (solo tipo partido)';

-- 6. Verificar perfiles creados
SELECT 
  id,
  nombre,
  tipo,
  hora_entrada,
  hora_salida,
  pausa_inicio,
  pausa_fin,
  hora_entrada_tarde,
  hora_salida_tarde
FROM perfiles_turno
ORDER BY id;

-- ============================================
-- NOTAS DE USO:
-- ============================================
-- 1. Los empleados ahora se asignan a un perfil de turno
-- 2. Los campos individuales (horario_entrada, etc.) quedan como fallback
-- 3. Si empleado tiene perfil_turno_id, usa ese perfil
-- 4. Si no tiene perfil, usa sus campos individuales
-- 5. Admin puede crear nuevos perfiles desde la interfaz
-- ============================================
