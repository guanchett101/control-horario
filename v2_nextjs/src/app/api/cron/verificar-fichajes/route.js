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
    const expectedToken = process.env.CRON_SECRET || 'cambiar_este_token_secreto';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verificar que no sea fin de semana
    const ahora = new Date();
    const diaSemana = ahora.getDay(); // 0=Domingo, 6=Sábado
    
    if (diaSemana === 0 || diaSemana === 6) {
      return Response.json({ 
        success: true,
        mensaje: 'Fin de semana - No se envían notificaciones',
        dia: diaSemana === 0 ? 'Domingo' : 'Sábado'
      });
    }

    // 3. Obtener fecha y hora actual
    const hoy = new Date().toISOString().split('T')[0];
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const minutosDesdeMedianoche = horaActual * 60 + minutosActuales;

    console.log(`[CRON] Verificando fichajes para: ${hoy} a las ${horaActual}:${minutosActuales}`);

    // 4. Obtener todos los empleados activos
    const { data: empleados, error: errorEmpleados } = await supabase
      .from('empleados')
      .select('id, nombre, apellido, email, cargo, horario_entrada, horario_salida, horario_entrada_tarde, horario_salida_tarde')
      .eq('activo', true);

    if (errorEmpleados) {
      console.error('[ERROR] Al obtener empleados:', errorEmpleados);
      return Response.json({ error: errorEmpleados.message }, { status: 500 });
    }

    console.log(`[INFO] Empleados activos: ${empleados.length}`);

    // 5. Obtener registros de hoy
    const { data: registrosHoy, error: errorRegistros } = await supabase
      .from('registros')
      .select('empleado_id, hora_entrada, hora_salida')
      .eq('fecha', hoy);

    if (errorRegistros) {
      console.error('[ERROR] Al obtener registros:', errorRegistros);
      return Response.json({ error: errorRegistros.message }, { status: 500 });
    }

    console.log(`[INFO] Registros de hoy: ${registrosHoy.length}`);

    // 6. Procesar cada empleado
    const resultados = {
      fecha: hoy,
      hora: `${horaActual}:${minutosActuales}`,
      empleadosActivos: empleados.length,
      empleadosConFichaje: 0,
      notificacionesEnviadas: 0,
      notificacionesFallidas: 0,
      detalles: []
    };

    for (const emp of empleados) {
      // Verificar si tiene email
      if (!emp.email) {
        console.log(`[SKIP] ${emp.nombre} ${emp.apellido} - Sin email`);
        continue;
      }

      // Obtener horario de entrada (por defecto 09:00)
      const horarioEntrada = emp.horario_entrada || '09:00';
      const [horaEntrada, minutosEntrada] = horarioEntrada.split(':').map(Number);
      const minutosEntradaEmpleado = horaEntrada * 60 + minutosEntrada;

      // Margen de tolerancia: 15 minutos
      const margenMinutos = 15;
      const minutosLimite = minutosEntradaEmpleado + margenMinutos;

      // Verificar si ya pasó su hora de entrada + margen
      if (minutosDesdeMedianoche < minutosLimite) {
        console.log(`[SKIP] ${emp.nombre} - Aún no es su hora (${horarioEntrada} + ${margenMinutos}min)`);
        continue;
      }

      // Verificar si ya fichó
      const yaFicho = registrosHoy.some(r => r.empleado_id === emp.id && r.hora_entrada);

      if (yaFicho) {
        resultados.empleadosConFichaje++;
        console.log(`[OK] ${emp.nombre} ${emp.apellido} - Ya fichó`);
        continue;
      }

      // El empleado NO ha fichado y ya pasó su hora
      console.log(`[AVISO] ${emp.nombre} ${emp.apellido} - No ha fichado (horario: ${horarioEntrada})`);

      try {
        // Enviar email
        const { data, error } = await resend.emails.send({
          from: 'Control Horario <onboarding@resend.dev>',
          to: emp.email,
          subject: '⚠️ Recordatorio: No has fichado hoy',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
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
                  <p>Tu horario de entrada es: <strong>${horarioEntrada}</strong></p>
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

        resultados.notificacionesEnviadas++;
        resultados.detalles.push({
          empleado: `${emp.nombre} ${emp.apellido}`,
          email: emp.email,
          horario: horarioEntrada,
          estado: 'enviado'
        });

        console.log(`[✓] Email enviado a: ${emp.nombre} ${emp.apellido} (${emp.email})`);

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

        resultados.notificacionesFallidas++;
        resultados.detalles.push({
          empleado: `${emp.nombre} ${emp.apellido}`,
          email: emp.email,
          horario: horarioEntrada,
          estado: 'fallido',
          error: error.message
        });

        console.error(`[✗] Error al enviar email a: ${emp.nombre} ${emp.apellido}`, error);
      }
    }

    // 7. Retornar resumen
    return Response.json({
      success: true,
      ...resultados
    });

  } catch (error) {
    console.error('[ERROR FATAL]', error);
    return Response.json({ 
      error: 'Error interno del servidor',
      details: error.message 
    }, { status: 500 });
  }
}
