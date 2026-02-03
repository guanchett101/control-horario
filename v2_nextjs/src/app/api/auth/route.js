import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'usuarios') {
            const { data, error } = await supabase
                .from('usuarios')
                .select('username, rol, empleados(nombre, apellido)')
                .order('username', { ascending: true });

            if (error) throw error;

            const usuariosFormateados = data.map(u => ({
                username: u.username,
                nombre: u.empleados?.nombre,
                apellido: u.empleados?.apellido,
                rol: u.rol
            }));

            return NextResponse.json(usuariosFormateados);
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

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

        // LOGIN
        if (action === 'login') {
            const { username, password } = body;

            const { data, error } = await supabase
                .from('usuarios')
                .select(`
          *,
          empleados (
            nombre,
            apellido
          )
        `)
                .eq('username', username)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Usuario no encontrado o credenciales inválidas' }, { status: 401 });
            }

            const isMatch = await bcrypt.compare(password, data.password_hash);
            if (!isMatch) {
                return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
            }

            const token = jwt.sign(
                { id: data.id, empleadoId: data.empleado_id, rol: data.rol },
                process.env.JWT_SECRET || 'secret-key-default',
                { expiresIn: '12h' }
            );

            return NextResponse.json({
                token,
                user: {
                    id: data.id,
                    empleadoId: data.empleado_id,
                    nombre: data.empleados?.nombre || 'Usuario',
                    apellido: data.empleados?.apellido || '',
                    rol: data.rol,
                    username: data.username
                }
            });
        }

        // REGISTRO (Simple)
        if (action === 'register') {
            const { empleadoId, username, password, rol } = body;
            const passwordHash = await bcrypt.hash(password, 10);
            const { data, error } = await supabase.from('usuarios').insert([{
                empleado_id: empleadoId, username, password_hash: passwordHash, rol: rol || 'empleado'
            }]).select();

            if (error) throw error;
            return NextResponse.json({ message: 'Usuario registrado', id: data[0].id }, { status: 201 });
        }

        // CAMBIAR PASSWORD
        if (action === 'cambiar-password') {
            const { userId, passwordActual, passwordNueva } = body;

            const { data: usuario, error: userError } = await supabase
                .from('usuarios')
                .select('password_hash')
                .eq('id', userId)
                .single();

            if (userError || !usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

            const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
            if (!isMatch) return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 401 });

            const nuevoHash = await bcrypt.hash(passwordNueva, 10);
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ password_hash: nuevoHash })
                .eq('id', userId);

            if (updateError) throw updateError;
            return NextResponse.json({ message: 'Contraseña actualizada correctamente' });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
