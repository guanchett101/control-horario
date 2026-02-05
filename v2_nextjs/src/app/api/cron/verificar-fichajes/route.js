import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { enviarAviso } from '@/lib/email';

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

        for (const emp of empleados) {
            // --- TURNO MAÑANA / CONTINUO ---
            const entradaMañana = emp.horario_entrada || '09:00';
            const salidaMañana = emp.horario_salida || '18:00';

            const [hE1, mE1] = entradaMañana.split(':').map(Number);
            const [hS1, mS1] = salidaMañana.split(':').map(Number);

            const minutosEntrada1 = hE1 * 60 + mE1;
            const minutosSalida1 = hS1 * 60 + mS1;

            // Buscar registros del empleado para hoy
            const registrosEmp = registros.filter(r => r.empleado_id === emp.id);
            // Ordenar por hora (aunque suelen venir ordenados)
            registrosEmp.sort((a, b) => a.hora_entrada.localeCompare(b.hora_entrada));

            const primerFichaje = registrosEmp[0];
            const ultimoFichaje = registrosEmp[registrosEmp.length - 1];

            // 1. CHEQUEO MAÑANA: Ausencia
            if (minutosActuales > (minutosEntrada1 + 30) && !primerFichaje) {
                const mensaje = `Hola ${emp.nombre}, son las ${now.toLocaleTimeString()} y no hemos registrado tu entrada de las ${entradaMañana}. Por favor, contacta con administración si es un error.`;
                reporte.incidentes.push({
                    empleado: `${emp.nombre} ${emp.apellido}`,
                    tipo: 'AUSENCIA_MAÑANA',
                    mensaje: mensaje,
                    accion_recomendada: 'Correo enviado.'
                });

                if (emp.email) {
                    await enviarAviso(emp.email, '⚠️ Alerta de Asistencia: Entrada Pendiente', mensaje);
                }
            }

            // 2. CHEQUEO MAÑANA: Olvido Salida (si no tiene turno de tarde o si estamos en el hueco del mediodía)
            // Si tiene turno de tarde, definimos el hueco. Si no, fin del día.
            const tieneTarde = !!emp.horario_entrada_tarde;

            if (primerFichaje && !primerFichaje.hora_salida) {
                // Si ya pasó mucho tiempo de su hora de salida teórica
                if (minutosActuales > (minutosSalida1 + 60)) {
                    const mensaje = `Hola ${emp.nombre}, parece que olvidaste fichar tu salida de las ${salidaMañana}.`;
                    reporte.incidentes.push({
                        empleado: `${emp.nombre} ${emp.apellido}`,
                        tipo: 'OLVIDO_SALIDA_MAÑANA',
                        mensaje: mensaje,
                        accion_recomendada: 'Correo enviado.'
                    });

                    if (emp.email) {
                        await enviarAviso(emp.email, '⚠️ Recordatorio: Fichar Salida', mensaje);
                    }
                }
            }

            // --- TURNO TARDE (Opcional) ---
            if (tieneTarde) {
                const entradaTarde = emp.horario_entrada_tarde;
                const salidaTarde = emp.horario_salida_tarde;

                const [hE2, mE2] = entradaTarde.split(':').map(Number);
                const [hS2, mS2] = salidaTarde.split(':').map(Number);

                const minutosEntrada2 = hE2 * 60 + mE2;
                const minutosSalida2 = hS2 * 60 + mS2;

                // 3. CHEQUEO TARDE: Ausencia (Ya pasó hora entrada tarde y no hay segundo fichaje)
                // Buscamos si hay algún fichaje que haya empezado CERCA de la hora de la tarde (ej. +/- 1 hora)
                // O simplemente si hay más de 1 fichaje.
                const fichajeTarde = registrosEmp.find(r => {
                    const [hR, mR] = r.hora_entrada.split(':').map(Number);
                    const minsR = hR * 60 + mR;
                    // Consideramos fichaje de tarde si es después de la salida teórica de la mañana
                    return minsR > (minutosSalida1 - 30);
                });

                if (minutosActuales > (minutosEntrada2 + 30) && !fichajeTarde) {
                    // Solo reportar si ya fichó por la mañana (si no fichó mañana, ya saltó la alarma de ausencia total)
                    if (primerFichaje) {
                        const mensaje = `Hola ${emp.nombre}, es tu turno de tarde (${entradaTarde}) y no vemos tu fichaje de entrada.`;
                        reporte.incidentes.push({
                            empleado: `${emp.nombre} ${emp.apellido}`,
                            tipo: 'AUSENCIA_TARDE',
                            mensaje: mensaje,
                            accion_recomendada: 'Correo enviado.'
                        });

                        if (emp.email) {
                            await enviarAviso(emp.email, '⚠️ Alerta Tarde: Entrada Pendiente', mensaje);
                        }
                    }
                }

                // 4. CHEQUEO TARDE: Olvido Salida
                if (fichajeTarde && !fichajeTarde.hora_salida) {
                    if (minutosActuales > (minutosSalida2 + 60)) {
                        const mensaje = `Hola ${emp.nombre}, tu turno de tarde acababa a las ${salidaTarde} y sigues fichado.`;
                        reporte.incidentes.push({
                            empleado: `${emp.nombre} ${emp.apellido}`,
                            tipo: 'OLVIDO_SALIDA_TARDE',
                            mensaje: mensaje,
                            accion_recomendada: 'Correo enviado.'
                        });

                        if (emp.email) {
                            await enviarAviso(emp.email, '⚠️ Recordatorio: Cerrar Turno Tarde', mensaje);
                        }
                    }
                }
            }
        }

        return NextResponse.json(reporte);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
