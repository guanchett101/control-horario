# Sistema de Avisos por Email - Empleados Sin Fichar

## 📋 Guía Completa de Implementación

---

## 🎯 Objetivo

Enviar un email automático a los empleados que no han fichado su entrada a una hora determinada (ejemplo: 10:00 AM).

---

## 🏗️ Arquitectura Elegida

**Supabase pg_cron + Next.js API + Resend**

```
┌─────────────────────────────────────────┐
│  1. Supabase pg_cron                    │
│     Ejecuta a las 10:00 AM exactas      │
│     Llama a función SQL                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Función SQL                         │
│     Identifica empleados sin fichaje    │
│     Hace HTTP Request a Next.js API     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Next.js API Route                   │
│     /api/cron/verificar-fichajes        │
│     Recibe lista de empleados           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Resend API                          │
│     Envía emails personalizados         │
│     1 email por empleado                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Log en Supabase                     │
│     Guarda registro de emails enviados  │
└─────────────────────────────────────────┘
```

---

## 📝 PASO 1: Configurar Resend

### 1.1 Crear Cuenta en Resend

1. Ve a: https://resend.com
2. Haz clic en "Sign Up"
3. Regístrate con tu email o GitHub
4. Verifica tu email

### 1.2 Obtener API Key

1. Una vez dentro, ve a: **API Keys** (menú lateral)
2. Haz clic en **"Create API Key"**
3. Nombre: `control-horario-production`
4. Permisos: **"Sending access"**
5. Copia la API Key (empieza con `re_...`)
6. ⚠️ **IMPORTANTE**: Guárdala en un lugar seguro, solo se muestra una vez

### 1.3 Configurar Dominio (Opcional pero Recomendado)

**Opción A: Usar dominio de Resend (más fácil)**
- Emails se enviarán desde: `onboarding@resend.dev`
- ✅ Funciona inmediatamente
- ⚠️ Menos profesional

**Opción B: Usar tu propio dominio (profesional)**
1. Ve a **Domains** en Resend
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio: `tuempresa.com`
4. Resend te dará registros DNS para agregar:
   ```
   Tipo: TXT
   Nombre: _resend
   Valor: [código que te da Resend]
   
   Tipo: MX
   Nombre: @
   Valor: feedback-smtp.resend.com
   Prioridad: 10
   ```
5. Agrega estos registros en tu proveedor de dominio (GoDaddy, Namecheap, etc.)
6. Espera 24-48 horas para verificación
7. Emails se enviarán desde: `noreply@tuempresa.com`

### 1.4 Agregar API Key a Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto: `control-horario100`
3. Ve a **Settings** → **Environment Variables**
4. Agrega nueva variable:
   ```
   Name: RESEND_API_KEY
   Value: re_tu_api_key_aqui
   Environment: Production, Preview, Development
   ```
5. Haz clic en **Save**
6. **Redeploy** tu proyecto para aplicar cambios

---

## 📝 PASO 2: Crear Tabla de Logs en Supabase

### 2.1 Abrir SQL Editor en Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **"New query"**

### 2.2 Crear Tabla de Logs

Copia y pega este SQL:

```sql
-- Tabla para registrar emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL DEFAULT 'aviso_fichaje',
  destinatario VARCHAR(255) NOT NULL,
  asunto TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'enviado',
  mensaje_error TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  hora TIME DEFAULT CURRENT_TIME,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_email_logs_fecha ON email_logs(fecha);
CREATE INDEX IF NOT EXISTS idx_email_logs_empleado ON email_logs(empleado_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_tipo ON email_logs(tipo);

-- Comentarios para documentación
COMMENT ON TABLE email_logs IS 'Registro de todos los emails enviados por el sistema';
COMMENT ON COLUMN email_logs.tipo IS 'Tipo de email: aviso_fichaje, bienvenida, reporte, etc.';
COMMENT ON COLUMN email_logs.estado IS 'Estado del envío: enviado, fallido, pendiente';
```

Haz clic en **"Run"** para ejecutar.

### 2.3 Verificar Creación

```sql
-- Verificar que la tabla existe
SELECT * FROM email_logs LIMIT 5;
```

Deberías ver una tabla vacía (sin errores).

---

## 📝 PASO 3: Crear API Route en Next.js

### 3.1 Verificar que Resend está instalado

Abre terminal en tu proyecto y ejecuta:

```bash
cd v2_nextjs
npm list resend
```

Si no está instalado:
```bash
npm install resend
```

### 3.2 Actualizar el archivo API existente

Ya tienes el archivo: `v2_nextjs/src/app/api/cron/verificar-fichajes/route.js`

Reemplaza su contenido con este código completo:

```javascript
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request) {
  try {
    // 1. Verificar autenticación (token secreto)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'tu_token_secreto_aqui';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Obtener fecha actual
    const hoy = new Date().toISOString().split('T')[0];
    console.log(`[CRON] Verificando fichajes para: ${hoy}`);

    // 3. Obtener todos los empleados activos
    const { data: empleados, error: errorEmpleados } = await supabase
      .from('empleados')
      .select('id, nombre, apellido, email, cargo')
      .eq('activo', true);

    if (errorEmpleados) {
      console.error('[ERROR] Al obtener empleados:', errorEmpleados);
      return Response.json({ error: errorEmpleados.message }, { status: 500 });
    }

    console.log(`[INFO] Empleados activos: ${empleados.length}`);

    // 4. Obtener registros de hoy
    const { data: registrosHoy, error: errorRegistros } = await supabase
      .from('registros')
      .select('empleado_id')
      .eq('fecha', hoy);

    if (errorRegistros) {
      console.error('[ERROR] Al obtener registros:', errorRegistros);
      return Response.json({ error: errorRegistros.message }, { status: 500 });
    }

    console.log(`[INFO] Registros de hoy: ${registrosHoy.length}`);

    // 5. Identificar empleados sin fichaje
    const empleadosConFichaje = new Set(registrosHoy.map(r => r.empleado_id));
    const empleadosSinFichar = empleados.filter(emp => 
      !empleadosConFichaje.has(emp.id) && emp.email
    );

    console.log(`[INFO] Empleados sin fichar: ${empleadosSinFichar.length}`);

    // 6. Enviar emails
    const resultados = {
      total: empleadosSinFichar.length,
      enviados: 0,
      fallidos: 0,
      detalles: []
    };

    for (const emp of empleadosSinFichar) {
      try {
        // Enviar email
        const { data, error } = await resend.emails.send({
          from: 'Control Horario <onboarding@resend.dev>', // Cambiar si tienes dominio propio
          to: emp.email,
          subject: '⚠️ Recordatorio: No has fichado hoy',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">⏰ Control de Horarios</h1>
                </div>
                <div class="content">
                  <h2>Hola ${emp.nombre},</h2>
                  <p>Notamos que <strong>aún no has registrado tu entrada</strong> el día de hoy.</p>
                  <p>Por favor, ficha lo antes posible haciendo clic en el siguiente botón:</p>
                  <div style="text-align: center;">
                    <a href="https://control-horario100.vercel.app/registro" class="button">
                      📝 Fichar Ahora
                    </a>
                  </div>
                  <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Nota:</strong> Si ya fichaste y recibes este mensaje, por favor contacta con administración.
                  </p>
                </div>
                <div class="footer">
                  <p>Este es un mensaje automático del Sistema de Control de Horarios</p>
                  <p>No respondas a este email</p>
                </div>
              </div>
            </body>
            </html>
          `
        });

        if (error) {
          throw error;
        }

        // Guardar log exitoso
        await supabase.from('email_logs').insert({
          empleado_id: emp.id,
          tipo: 'aviso_fichaje',
          destinatario: emp.email,
          asunto: '⚠️ Recordatorio: No has fichado hoy',
          estado: 'enviado'
        });

        resultados.enviados++;
        resultados.detalles.push({
          empleado: `${emp.nombre} ${emp.apellido}`,
          email: emp.email,
          estado: 'enviado'
        });

        console.log(`[OK] Email enviado a: ${emp.nombre} ${emp.apellido} (${emp.email})`);

      } catch (error) {
        // Guardar log de error
        await supabase.from('email_logs').insert({
          empleado_id: emp.id,
          tipo: 'aviso_fichaje',
          destinatario: emp.email,
          asunto: '⚠️ Recordatorio: No has fichado hoy',
          estado: 'fallido',
          mensaje_error: error.message
        });

        resultados.fallidos++;
        resultados.detalles.push({
          empleado: `${emp.nombre} ${emp.apellido}`,
          email: emp.email,
          estado: 'fallido',
          error: error.message
        });

        console.error(`[ERROR] No se pudo enviar email a: ${emp.nombre} ${emp.apellido}`, error);
      }
    }

    // 7. Retornar resumen
    return Response.json({
      success: true,
      fecha: hoy,
      empleadosActivos: empleados.length,
      empleadosConFichaje: empleadosConFichaje.size,
      empleadosSinFichar: empleadosSinFichar.length,
      resultados
    });

  } catch (error) {
    console.error('[ERROR FATAL]', error);
    return Response.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
```

### 3.3 Agregar Variable de Entorno CRON_SECRET

En Vercel:
1. Settings → Environment Variables
2. Agregar:
   ```
   Name: CRON_SECRET
   Value: mi_token_super_secreto_12345
   ```
3. Save y Redeploy

---

## 📝 PASO 4: Configurar Supabase pg_cron

### 4.1 Habilitar Extensión pg_cron

En Supabase SQL Editor:

```sql
-- Habilitar extensión pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Verificar que está habilitada
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

### 4.2 Crear Función que Llama a la API

```sql
-- Función que hace HTTP Request a tu API de Next.js
CREATE OR REPLACE FUNCTION trigger_verificar_fichajes()
RETURNS void AS $$
DECLARE
  response TEXT;
BEGIN
  -- Hacer HTTP Request a tu API
  SELECT content::text INTO response
  FROM http((
    'GET',
    'https://control-horario100.vercel.app/api/cron/verificar-fichajes',
    ARRAY[http_header('Authorization', 'Bearer mi_token_super_secreto_12345')],
    'application/json',
    ''
  )::http_request);
  
  -- Log del resultado
  RAISE NOTICE 'Cron ejecutado. Respuesta: %', response;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error al ejecutar cron: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
```

⚠️ **IMPORTANTE**: Reemplaza `mi_token_super_secreto_12345` con tu CRON_SECRET real.

### 4.3 Habilitar Extensión http (para hacer requests)

```sql
-- Habilitar extensión http para hacer requests externos
CREATE EXTENSION IF NOT EXISTS http;
```

### 4.4 Programar Ejecución Diaria

```sql
-- Programar cron para ejecutarse todos los días a las 10:00 AM
SELECT cron.schedule(
  'verificar-fichajes-10am',           -- Nombre del job
  '0 10 * * *',                        -- Cron expression (10:00 AM todos los días)
  'SELECT trigger_verificar_fichajes();'
);
```

### 4.5 Verificar que el Cron está Programado

```sql
-- Ver todos los cron jobs programados
SELECT * FROM cron.job;
```

Deberías ver algo como:
```
jobid | schedule    | command                              | nodename
------+-------------+--------------------------------------+---------
1     | 0 10 * * *  | SELECT trigger_verificar_fichajes(); | localhost
```

---

## 📝 PASO 5: Probar el Sistema

### 5.1 Prueba Manual de la API

Abre tu navegador o Postman y haz una petición GET:

```
URL: https://control-horario100.vercel.app/api/cron/verificar-fichajes
Headers:
  Authorization: Bearer mi_token_super_secreto_12345
```

Deberías recibir una respuesta JSON como:

```json
{
  "success": true,
  "fecha": "2026-02-07",
  "empleadosActivos": 2,
  "empleadosConFichaje": 1,
  "empleadosSinFichar": 1,
  "resultados": {
    "total": 1,
    "enviados": 1,
    "fallidos": 0,
    "detalles": [
      {
        "empleado": "Marcos2 Medina Trujillo",
        "email": "marcos@example.com",
        "estado": "enviado"
      }
    ]
  }
}
```

### 5.2 Verificar Email Recibido

1. Revisa la bandeja de entrada del empleado
2. Busca email con asunto: "⚠️ Recordatorio: No has fichado hoy"
3. Verifica que el botón "Fichar Ahora" funciona

### 5.3 Verificar Logs en Supabase

```sql
-- Ver últimos emails enviados
SELECT 
  el.*,
  e.nombre,
  e.apellido
FROM email_logs el
LEFT JOIN empleados e ON el.empleado_id = e.id
ORDER BY el.created_at DESC
LIMIT 10;
```

### 5.4 Prueba del Cron (Ejecución Manual)

Para probar sin esperar a las 10:00 AM:

```sql
-- Ejecutar manualmente la función
SELECT trigger_verificar_fichajes();
```

Esto debería:
1. Llamar a tu API
2. Enviar emails
3. Guardar logs

---

## 📝 PASO 6: Activar/Desactivar Empleados para Pruebas

### 6.1 Funcionalidad Implementada

Ahora puedes **activar o desactivar empleados** desde la página `/empleados`. Esto te permite:

- ✅ Hacer pruebas solo con un empleado (tú mismo)
- ✅ Desactivar temporalmente empleados sin eliminarlos
- ✅ Controlar quién recibe notificaciones por email

### 6.2 Cómo Usar

1. Ve a la página **Empleados** en el admin
2. Verás un botón de estado en cada empleado:
   - **✅ Activo** (verde): El empleado recibe notificaciones
   - **⏸️ Inactivo** (gris): El empleado NO recibe notificaciones
3. Haz clic en el botón para cambiar el estado
4. Confirma la acción en el diálogo

### 6.3 Vista Móvil

En móvil, el botón aparece en la parte superior de cada tarjeta de empleado:
- Botón ancho que muestra el estado actual
- Color verde si está activo, gris si está inactivo

### 6.4 Vista Escritorio

En escritorio, el botón aparece en la columna "Acciones":
- Botón compacto con icono (✅ o ⏸️)
- Junto a los botones de Editar y Eliminar

### 6.5 Comportamiento del Sistema

El sistema de avisos por email **solo envía notificaciones a empleados activos**:

```javascript
// En la API de verificar-fichajes
const { data: empleados } = await supabase
  .from('empleados')
  .select('*')
  .eq('activo', true);  // ← Solo empleados activos
```

### 6.6 Ejemplo de Uso para Pruebas

**Escenario**: Quieres probar el sistema solo contigo

1. Ve a `/empleados`
2. Desactiva todos los empleados excepto el tuyo
3. Espera a que se ejecute el cron (o prueba manualmente)
4. Solo tú recibirás el email de prueba
5. Una vez verificado, reactiva a los demás empleados

---

## 📝 PASO 7: Configuración Avanzada (Opcional)

### 7.1 Múltiples Horarios de Aviso

Si quieres avisar a las 10:00 AM y a las 14:00 PM:

```sql
-- Aviso de la mañana (10:00 AM)
SELECT cron.schedule(
  'verificar-fichajes-10am',
  '0 10 * * *',
  'SELECT trigger_verificar_fichajes();'
);

-- Aviso de la tarde (14:00 PM / 2:00 PM)
SELECT cron.schedule(
  'verificar-fichajes-2pm',
  '0 14 * * *',
  'SELECT trigger_verificar_fichajes();'
);
```

### 7.2 Solo Días Laborables (Lunes a Viernes)

```sql
-- Solo de lunes a viernes
SELECT cron.schedule(
  'verificar-fichajes-laborables',
  '0 10 * * 1-5',  -- 1-5 = Lunes a Viernes
  'SELECT trigger_verificar_fichajes();'
);
```

### 7.3 Desactivar un Cron Job

```sql
-- Ver ID del job
SELECT jobid, jobname FROM cron.job;

-- Desactivar job por ID
SELECT cron.unschedule(1);  -- Reemplaza 1 con el jobid real

-- O por nombre
SELECT cron.unschedule('verificar-fichajes-10am');
```

### 7.4 Ver Historial de Ejecuciones

```sql
-- Ver últimas ejecuciones del cron
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🔧 Solución de Problemas

### Problema 1: "Extension pg_cron does not exist"

**Solución:**
```sql
CREATE EXTENSION pg_cron;
```

Si da error, contacta con soporte de Supabase para habilitar la extensión.

### Problema 2: "Extension http does not exist"

**Solución:**
```sql
CREATE EXTENSION http;
```

### Problema 3: Emails no se envían

**Verificar:**
1. API Key de Resend es correcta
2. Variable `RESEND_API_KEY` está en Vercel
3. Empleados tienen email válido en la BD
4. Revisar logs en Supabase:
   ```sql
   SELECT * FROM email_logs WHERE estado = 'fallido';
   ```

### Problema 4: Cron no se ejecuta

**Verificar:**
1. Cron está programado:
   ```sql
   SELECT * FROM cron.job;
   ```
2. Función existe:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'trigger_verificar_fichajes';
   ```
3. Ejecutar manualmente para ver errores:
   ```sql
   SELECT trigger_verificar_fichajes();
   ```

### Problema 5: Error 401 Unauthorized

**Solución:**
- Verificar que el token en Supabase coincide con `CRON_SECRET` en Vercel
- Revisar que el header Authorization está bien formado

---

## 📊 Monitoreo y Mantenimiento

### Dashboard de Emails (SQL Query)

```sql
-- Resumen de emails por día
SELECT 
  fecha,
  COUNT(*) as total_emails,
  SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
  SUM(CASE WHEN estado = 'fallido' THEN 1 ELSE 0 END) as fallidos
FROM email_logs
WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY fecha
ORDER BY fecha DESC;
```

### Empleados que Más Olvidan Fichar

```sql
-- Top 10 empleados con más avisos
SELECT 
  e.nombre,
  e.apellido,
  COUNT(*) as avisos_recibidos
FROM email_logs el
JOIN empleados e ON el.empleado_id = e.id
WHERE el.tipo = 'aviso_fichaje'
  AND el.fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY e.id, e.nombre, e.apellido
ORDER BY avisos_recibidos DESC
LIMIT 10;
```

### Limpiar Logs Antiguos (Opcional)

```sql
-- Eliminar logs de más de 90 días
DELETE FROM email_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## ✅ Checklist Final

Antes de dar por terminado, verifica:

- [ ] Cuenta de Resend creada
- [ ] API Key de Resend obtenida
- [ ] Variable `RESEND_API_KEY` agregada en Vercel
- [ ] Variable `CRON_SECRET` agregada en Vercel
- [ ] Tabla `email_logs` creada en Supabase
- [ ] Extensión `pg_cron` habilitada
- [ ] Extensión `http` habilitada
- [ ] Función `trigger_verificar_fichajes()` creada
- [ ] Cron job programado con `cron.schedule()`
- [ ] Prueba manual de API exitosa
- [ ] Email de prueba recibido
- [ ] Logs guardados en Supabase

---

## 📈 Uso Estimado de Recursos

### Resend (Plan Gratuito)
- Emails por día: ~3-5 (3% del límite)
- Emails por mes: ~66-110 (2-4% del límite)
- ✅ Muy por debajo de los límites

### Supabase (Plan Gratuito)
- Ejecuciones de cron: 1-2 por día
- Queries SQL: ~10 por ejecución
- Storage de logs: ~1 KB por email
- ✅ Impacto mínimo

### Vercel (Plan Hobby)
- Function invocations: 1-2 por día
- Execution time: ~2-5 segundos por ejecución
- ✅ Muy por debajo de los límites

---

## 🎯 Resultado Final

Una vez implementado, el sistema:

1. ✅ Se ejecuta automáticamente todos los días a las 10:00 AM
2. ✅ Identifica empleados que no han fichado
3. ✅ Envía email personalizado a cada uno
4. ✅ Guarda logs de todos los envíos
5. ✅ Es 100% gratuito
6. ✅ Es confiable y preciso
7. ✅ Requiere 0 mantenimiento

---

## 📞 Soporte

Si tienes problemas durante la implementación:

1. Revisa la sección "Solución de Problemas"
2. Verifica los logs en Supabase
3. Revisa los logs de Vercel (Dashboard → Functions → Logs)
4. Contacta con soporte de Resend si hay problemas con emails

---

**Fecha de Creación**: 7 de Febrero de 2026  
**Versión**: 1.0  
**Estado**: Listo para Implementar  
**Tiempo Estimado**: 30-45 minutos
