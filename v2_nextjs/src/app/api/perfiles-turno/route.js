import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('perfiles_turno')
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

        const { data, error } = await supabase
            .from('perfiles_turno')
            .insert({
                nombre,
                descripcion,
                tipo,
                hora_entrada,
                hora_salida,
                pausa_inicio,
                pausa_fin,
                hora_entrada_tarde,
                hora_salida_tarde
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
