import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const { data, error } = await supabase.from('empleados').select('*').eq('id', id).single();
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { nombre, apellido, email, telefono, cargo, horario_entrada, horario_salida, horario_entrada_tarde, horario_salida_tarde } = body;

        const { error } = await supabase
            .from('empleados')
            .update({ nombre, apellido, email, telefono, cargo, horario_entrada, horario_salida, horario_entrada_tarde, horario_salida_tarde })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Empleado actualizado' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { activo } = body;

        const { error } = await supabase
            .from('empleados')
            .update({ activo })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Estado del empleado actualizado', activo });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Borrar usuario asociado si existe
        await supabase.from('usuarios').delete().eq('empleado_id', id);

        // Marcar empleado como inactivo (Soft Delete)
        const { error } = await supabase
            .from('empleados')
            .update({ activo: false })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Empleado eliminado' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
