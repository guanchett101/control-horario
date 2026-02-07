import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Inicializar Resend solo si hay API Key (para evitar errores en build)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request) {
    try {
        // 1. Seguridad: Verificar Bearer Token (CRON_SECRET)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('No autorizado', { status: 401 });
        }

        // 2. Leer notificaciones pendientes (Lote de 50 para evitar timeouts)
        const { data: notificaciones, error } = await supabase
            .from('notificaciones_pendientes')
            .select('*')
            .eq('estado', 'pendiente')
            .limit(50);

        if (error) throw error;

        if (!notificaciones || notificaciones.length === 0) {
            return NextResponse.json({ message: 'No hay notificaciones pendientes', processed: 0 });
        }

        // 3. Procesar envíos
        const resultados = [];

        for (const notif of notificaciones) {
            try {
                if (!resend) throw new Error('Resend API Key no configurada');

                // Enviar email
                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: 'Control Horario <onboarding@resend.dev>', // Cambiar por tu dominio verificado
                    to: [notif.empleado_email],
                    subject: notif.asunto,
                    html: `<p>${notif.mensaje}</p>`
                });

                if (emailError) throw emailError;

                // Marcar como ENVIADO
                await supabase
                    .from('notificaciones_pendientes')
                    .update({
                        estado: 'enviado',
                        intentos: notif.intentos + 1
                    })
                    .eq('id', notif.id);

                resultados.push({ id: notif.id, status: 'sent' });

            } catch (err) {
                console.error(`Error enviando a ${notif.empleado_email}:`, err);

                // Marcar como FALLIDO o incrementar intentos
                await supabase
                    .from('notificaciones_pendientes')
                    .update({
                        estado: 'fallido', // Podrías poner 'pendiente' si quieres reintentar
                        intentos: notif.intentos + 1
                    })
                    .eq('id', notif.id);

                resultados.push({ id: notif.id, status: 'error', error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            details: results
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
