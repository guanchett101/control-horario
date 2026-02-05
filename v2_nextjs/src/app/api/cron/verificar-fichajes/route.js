import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function GET() {
    try {
        const now = new Date();
        const fechaHoy = now.toISOString().split('T')[0];

        // Ajuste básico de hora local (suponiendo servidor UTC y usuario en GMT+1/+2)
        // Para producción real, lo ideal es usar librerías como 'date-fns-tz' o configurar la zona horaria del servidor.
        // Aquí comparamos usando la hora del servidor actual.
        const minutosActuales = now.getHours() * 60 + now.getMinutes();

        // 1. Obtener todos los empleados activos
        const { data: empleados, error: errorEmp } = await supabase
            .from('empleados')
            .select('*')
            .eq('activo', true);

        if (errorEmp) throw errorEmp;

        // 2. Obtener registros de HOY
        const { data: registros, error: errorReg } = await supabase
            .from('registros')
            .select('*')
            .eq('fecha', fechaHoy);

        if (errorReg) throw errorReg;

        // 3. Analizar discrepancias
        const reporte = {
            timestamp: now.toISOString(),
            total_empleados: empleados.length,
            incidentes: []
        };

        empleados.forEach(emp => {
            // Si el empleado no tiene horario definido, saltamos (o usamos default)
            // Asumimos formato HH:mm
            const entradaTeorica = emp.horario_entrada || '09:00';
            const salidaTeorica = emp.horario_salida || '18:00';

            const [hE, mE] = entradaTeorica.split(':').map(Number);
            const [hS, mS] = salidaTeorica.split(':').map(Number);

            const minutosEntrada = hE * 60 + mE;
            const minutosSalida = hS * 60 + mS;

            // Buscar registro del empleado para hoy
            const registroHoy = registros.find(r => r.empleado_id === emp.id);

            // CASO A: FALTA DE ASISTENCIA / RETRASO (Ya pasó hora entrada y no hay registro)
            // Damos 15 mins de margen antes de considerar "falta de notificación"
            if (minutosActuales > (minutosEntrada + 15) && !registroHoy) {
                reporte.incidentes.push({
                    empleado: `${emp.nombre} ${emp.apellido}`,
                    tipo: 'AUSENCIA_SIN_FICHAJE',
                    mensaje: `Son las ${now.toLocaleTimeString()} y debía entrar a las ${entradaTeorica}. No hay fichaje.`,
                    accion_recomendada: 'Enviar correo de: ¿Olvidaste fichar la entrada?'
                });
            }

            // CASO B: OLVIDÓ SALIDA (Ya pasó hora salida, hay entrada pero no salida)
            // Damos 30 mins de margen después de la salida
            if (registroHoy && !registroHoy.hora_salida && minutosActuales > (minutosSalida + 30)) {
                reporte.incidentes.push({
                    empleado: `${emp.nombre} ${emp.apellido}`,
                    tipo: 'OLVIDO_SALIDA',
                    mensaje: `Son las ${now.toLocaleTimeString()} y debía salir a las ${salidaTeorica}. Tiene entrada pero no salida.`,
                    accion_recomendada: 'Enviar correo de: Recordatorio cierre de turno.'
                });
            }
        });

        return NextResponse.json(reporte);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
