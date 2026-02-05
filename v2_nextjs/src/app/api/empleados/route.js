import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// LISTAR y CREAR
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('empleados')
            .select('*')
            .eq('activo', true)
            .order('id', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nombre, apellido, email, telefono, cargo, fechaIngreso, horario_entrada, horario_salida } = body;

        const { data, error } = await supabase
            .from('empleados')
            .insert([{
                nombre,
                apellido,
                email,
                telefono,
                cargo,
                fecha_ingreso: fechaIngreso,
                horario_entrada,
                horario_salida
            }])
            .select();

        if (error) throw error;
        return NextResponse.json({ id: data[0].id, message: 'Empleado creado' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
