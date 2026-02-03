const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { parse } = require('url');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('FATAL: Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return res.status(500).json({ error: 'Faltan variables de entorno (SUPABASE_URL/KEY) en el servidor' });
  }

  const { query } = parse(req.url, true);
  const action = query.action;

  try {
    // LOGIN
    if (req.method === 'POST' && (action === 'login' || req.url.includes('/login'))) {
      const { username, password } = req.body;

      // Buscar usuario
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
        return res.status(401).json({ error: 'Usuario no encontrado o credenciales inválidas' });
      }

      // Verificar password
      const isMatch = await bcrypt.compare(password, data.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Generar Token
      const token = jwt.sign(
        { id: data.id, empleadoId: data.empleado_id, rol: data.rol },
        process.env.JWT_SECRET || 'secret-key-default',
        { expiresIn: '12h' }
      );

      return res.json({
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

    // LISTAR USUARIOS
    if (req.method === 'GET' && (action === 'usuarios' || req.url.includes('/usuarios'))) {
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

      return res.json(usuariosFormateados);
    }

    // CAMBIAR PASSWORD
    if (req.method === 'POST' && (action === 'cambiar-password' || req.url.includes('/cambiar-password'))) {
      const { userId, passwordActual, passwordNueva } = req.body;

      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (userError || !usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'La contraseña actual no es correcta' });

      const nuevoHash = await bcrypt.hash(passwordNueva, 10);
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password_hash: nuevoHash })
        .eq('id', userId);

      if (updateError) throw updateError;
      return res.json({ message: 'Contraseña actualizada correctamente' });
    }

    // REGISTRO (Solo Admin suele usar esto implícitamente al crear empleado, o login)
    if (req.method === 'POST' && (action === 'register' || req.url.includes('/register'))) {
      const { empleadoId, username, password, rol } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const { data, error } = await supabase.from('usuarios').insert([{
        empleado_id: empleadoId, username, password_hash: passwordHash, rol: rol || 'empleado'
      }]).select();
      if (error) throw error;
      return res.status(201).json({ message: 'Usuario registrado', id: data[0].id });
    }

    res.status(404).json({
      error: 'Ruta de auth no encontrada (r10)',
      debug: { url: req.url, action }
    });

  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: error.message });
  }
};
