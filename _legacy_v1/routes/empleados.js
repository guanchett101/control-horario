const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todos los empleados
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('activo', true)
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener empleado por ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Empleado no encontrado' });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo empleado
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, cargo, fechaIngreso } = req.body;

    const { data, error } = await supabase
      .from('empleados')
      .insert([
        {
          nombre,
          apellido,
          email,
          telefono,
          cargo,
          fecha_ingreso: fechaIngreso
        }
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ id: data[0].id, message: 'Empleado creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar empleado
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, cargo } = req.body;

    const { error } = await supabase
      .from('empleados')
      .update({
        nombre,
        apellido,
        email,
        telefono,
        cargo
      })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Desactivar empleado
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('empleados')
      .update({ activo: false })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Empleado desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
