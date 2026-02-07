-- 1. Tabla para la cola de notificaciones (Outbox Pattern)
create table if not exists notificaciones_pendientes (
  id uuid default gen_random_uuid() primary key,
  empleado_email text not null,
  empleado_nombre text not null,
  asunto text not null,
  mensaje text not null,
  estado text default 'pendiente', -- 'pendiente', 'enviado', 'fallido'
  intentos int default 0,
  created_at timestamp with time zone default now()
);

-- 2. Habilitar extensiones necesarias
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 3. Función simplificada para detectar ausencias (Lógica en BD)
-- NOTA: Esta función es un ejemplo. Si la lógica de horarios es compleja (turnos rotativos),
-- es mejor que Pg_Cron llame a un webhook de Next.js para que JS calcule.
-- Pero para el caso "Revisar al final del día si fichó", esto funciona:

create or replace function detectar_ausencias_fin_dia()
returns void as $$
declare
  emp record;
  fichaje record;
  fecha_hoy date := current_date;
begin
  -- Recorrer empleados activos
  for emp in select * from empleados where activo = true loop
    
    -- Buscar si existe algún registro de hoy para este empleado
    select * into fichaje from registros 
    where empleado_id = emp.id 
    and fecha = fecha_hoy 
    limit 1;

    -- Si NO hay fichaje, insertar en la cola de notificaciones
    if fichaje is null then
      insert into notificaciones_pendientes (empleado_email, empleado_nombre, asunto, mensaje)
      values (
        emp.email,
        emp.nombre,
        '⚠️ Alerta de Ausencia - Fin del Día',
        'Hola ' || emp.nombre || ', no hemos registrado tu asistencia hoy (' || fecha_hoy || '). Por favor contacta a RRHH.'
      );
    end if;
    
  end loop;

  -- Opcional: Llamar al endpoint de Next.js para que procese la cola inmediatamente
  -- perform net.http_post(
  --   url:='https://TU-PROYECTO.vercel.app/api/cron/procesar-cola',
  --   headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_CRON_SECRET"}'
  -- );
end;
$$ language plpgsql;

-- 4. Programar el Cron (Ejemplo: Lunes a Viernes a las 20:00)
-- Ajusta la hora según tu zona horaria (UTC)
select cron.schedule(
  'aviso-fin-dia',    -- Nombre del trabajo
  '0 20 * * 1-5',     -- Cron: 20:00 Lun-Vie
  $$ select detectar_ausencias_fin_dia(); $$
);
