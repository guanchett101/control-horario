const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  const query = new URL(url, `http://${req.headers.host}`).searchParams;
  const action = query.get('action');

  const isAction = (target) => action === target || url.includes('/' + target);

  try {
    // Login
    if (req.method === 'POST' && isAction('login')) {
      const { username, password } = req.body;
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, empleados(nombre, apellido)')
        .eq('username', username)
        .single();

      if (error || !data) return res.status(401).json({ error: 'Credenciales inválidas' });

      const isMatch = await bcrypt.compare(password, data.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

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

    // Obtener lista de usuarios
    if (req.method === 'GET' && isAction('usuarios')) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('username, rol, empleados(nombre, apellido)')
        .order('username', { ascending: true });

      if (error) throw error;
      return res.json(data.map(u => ({
        username: u.username,
        nombre: u.empleados.nombre,
        apellido: u.empleados.apellido,
        rol: u.rol
      })));
    }

    // Cambiar contraseña
    if (req.method === 'POST' && isAction('cambiar-password')) {
      const { userId, passwordActual, passwordNueva } = req.body;
      const { data: usuario, error: userError } = await supabase.from('usuarios').select('password_hash').eq('id', userId).single();
      if (userError || !usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
      if (!isMatch) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

      const nuevoHash = await bcrypt.hash(passwordNueva, 10);
      await supabase.from('usuarios').update({ password_hash: nuevoHash }).eq('id', userId);
      return res.json({ message: 'Contraseña actualizada' });
    }

    res.status(404).json({ error: 'Ruta no encontrada r9', debug: { url, action } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
