const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario con datos del empleado
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

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, data.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        id: data.id, 
        empleadoId: data.empleado_id, 
        rol: data.rol 
      },
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

// Registrar nuevo usuario (solo para testing, en producción proteger esta ruta)
router.post('/register', async (req, res) => {
  try {
    const { empleadoId, username, password, rol } = req.body;

    // Hash de la contraseña
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

module.exports = router;
