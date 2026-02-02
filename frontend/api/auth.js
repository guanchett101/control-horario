const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Obtener action de query params o del path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get('action');
  const path = action ? `/${action}` : req.url.replace('/api/auth', '');

  try {
    // Login
    if (req.method === 'POST' && (path === '/login' || action === 'login')) {
      const { username, password } = req.body;

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
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, data.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: data.id, empleadoId: data.empleado_id, rol: data.rol },
        process.env.JWT_SECRET || 'secret-key-default',
        { expiresIn: '8h' }
      );

      return res.json({
        token,
        user: {
          id: data.id,
          empleadoId: data.empleado_id,
          nombre: data.empleados.nombre,
          apellido: data.empleados.apellido,
          rol: data.rol,
          username: data.username
        }
      });
    }

    // Registrar usuario
    if (req.method === 'POST' && (path === '/register' || action === 'register')) {
      const { empleadoId, username, password, rol } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            empleado_id: empleadoId,
            username,
            password_hash: passwordHash,
            rol: rol || 'empleado'
          }
        ])
        .select();

      if (error) throw error;
      return res.status(201).json({ message: 'Usuario creado exitosamente', id: data[0].id });
    }

    // Cambiar contraseña
    if (req.method === 'POST' && (path === '/cambiar-password' || action === 'cambiar-password')) {
      const { userId, passwordActual, passwordNueva } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'ID de usuario no proporcionado' });
      }

      // Obtener usuario actual
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (userError || !usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado. Cierra sesión y vuelve a entrar.' });
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      }

      // Actualizar con nueva contraseña
      const nuevoHash = await bcrypt.hash(passwordNueva, 10);
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password_hash: nuevoHash })
        .eq('id', userId);

      if (updateError) throw updateError;

      return res.json({ message: 'Contraseña actualizada exitosamente' });
    }

    // Obtener lista de usuarios
    if (req.method === 'GET' && (path === '/usuarios' || action === 'usuarios')) {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          username,
          rol,
          empleados (
            nombre,
            apellido
          )
        `)
        .order('username', { ascending: true });

      if (error) throw error;

      const usuariosFormateados = data.map(u => ({
        username: u.username,
        nombre: u.empleados.nombre,
        apellido: u.empleados.apellido,
        rol: u.rol
      }));

      return res.json(usuariosFormateados);
    }

    res.status(404).json({ error: 'Ruta no encontrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
