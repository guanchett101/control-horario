import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const { data, error } = await supabase
            .from('perfiles_turno')
            .select('*')
            .eq('id', id)
            .single();
        
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
        const { 
            nombre, 
            descripcion, 
            tipo, 
            hora_entrada, 
            hora_salida, 
            pausa_inicio, 
            pausa_fin,
            hora_entrada_tarde,
            hora_salida_tarde
        } = body;

        const { error } = await supabase
            .from('perfiles_turno')
            .update({
                nombre,
                descripcion,
                tipo,
                hora_entrada,
                hora_salida,
                pausa_inicio,
                pausa_fin,
                hora_entrada_tarde,
                hora_salida_tarde,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Perfil actualizado' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Soft delete: marcar como inactivo
        const { error } = await supabase
            .from('perfiles_turno')
            .update({ activo: false })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ message: 'Perfil eliminado' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
