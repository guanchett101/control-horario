import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // 3. OBTENER REGISTROS DE HOY
        if (action === 'hoy') {
            const fecha = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('registros_horario')
                .select(`
          *,
          empleados (
            nombre,
            apellido,
            cargo
          )
        `)
                .eq('fecha', fecha)
                .order('hora_entrada', { ascending: false });

            if (error) throw error;
            return NextResponse.json(data || []);
        }

        // 4. REPORTES POR EMPLEADO
        if (action === 'empleado') {
            const id = searchParams.get('id');
            const fechaInicio = searchParams.get('fechaInicio');
            const fechaFin = searchParams.get('fechaFin');

            if (!id) return NextResponse.json({ error: 'ID de empleado requerido' }, { status: 400 });

            let querySupabase = supabase
                .from('registros_horario')
                .select('*, empleados(nombre, apellido)')
                .eq('empleado_id', id)
                .order('fecha', { ascending: false });

            if (fechaInicio) querySupabase = querySupabase.gte('fecha', fechaInicio);
            if (fechaFin) querySupabase = querySupabase.lte('fecha', fechaFin);

            const { data, error } = await querySupabase;

            if (error) throw error;
            return NextResponse.json(data || []);
        }

        return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const body = await request.json();

        // 1. REGISTRAR ENTRADA
        if (action === 'entrada') {
            const { empleadoId } = body;
            const fecha = new Date().toISOString().split('T')[0];
            const hora = new Date().toTimeString().split(' ')[0];

            const { data, error } = await supabase
                .from('registros_horario')
                .insert([{ empleado_id: empleadoId, fecha, hora_entrada: hora }])
                .select();

            if (error) throw error;
            return NextResponse.json({ id: data[0].id, message: 'Entrada registrada', hora }, { status: 201 });
        }

        // 2. REGISTRAR SALIDA
        if (action === 'salida') {
            const { empleadoId } = body;
            const hora = new Date().toTimeString().split(' ')[0];

            // Buscar el último registro de entrada que no tenga hora de salida
            const { data: registros, error: searchError } = await supabase
                .from('registros_horario')
                .select('*')
                .eq('empleado_id', empleadoId)
                .is('hora_salida', null)
                .order('id', { ascending: false })
                .limit(1);

            if (searchError) throw searchError;
            if (!registros || registros.length === 0) {
                return NextResponse.json({ error: 'No tienes ninguna entrada abierta para registrar salida.' }, { status: 404 });
            }

            const { error: updateError } = await supabase
                .from('registros_horario')
                .update({ hora_salida: hora })
                .eq('id', registros[0].id);

            if (updateError) throw updateError;
            return NextResponse.json({ message: 'Salida registrada', hora });
        }

        return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
