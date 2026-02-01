const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const app = express();
app.use(express.json());

// Login
app.post('/login', async (req, res) => {
  try {
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
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: data.id,
        empleadoId: data.empleado_id,
        nombre: data.empleados.nombre,
        apellido: data.empleados.apellido,
        rol: data.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar usuario
app.post('/register', async (req, res) => {
  try {
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
    res.status(201).json({ message: 'Usuario creado exitosamente', id: data[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener lista de usuarios
app.get('/usuarios', async (req, res) => {
  try {
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

    res.json(usuariosFormateados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
