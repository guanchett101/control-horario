const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const app = express();
app.use(express.json());

// Registrar entrada
app.post('/entrada', async (req, res) => {
  try {
    const { empleadoId } = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().split(' ')[0];

    const { data, error } = await supabase
      .from('registros_horario')
      .insert([
        {
          empleado_id: empleadoId,
          fecha,
          hora_entrada: hora
        }
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ id: data[0].id, message: 'Entrada registrada', hora });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar salida
app.post('/salida', async (req, res) => {
  try {
    const { empleadoId } = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().split(' ')[0];

    const { data: registros, error: searchError } = await supabase
      .from('registros_horario')
      .select('*')
      .eq('empleado_id', empleadoId)
      .eq('fecha', fecha)
      .is('hora_salida', null)
      .order('id', { ascending: false })
      .limit(1);

    if (searchError) throw searchError;
    if (!registros || registros.length === 0) {
      return res.status(404).json({ error: 'No hay registro de entrada para hoy' });
    }

    const { error: updateError } = await supabase
      .from('registros_horario')
      .update({ hora_salida: hora })
      .eq('id', registros[0].id);

    if (updateError) throw updateError;
    res.json({ message: 'Salida registrada', hora });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener registros por empleado y rango de fechas
app.get('/empleado/:id', async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    const { data, error } = await supabase
      .from('registros_horario')
      .select(`
        *,
        empleados (
          nombre,
          apellido
        )
      `)
      .eq('empleado_id', req.params.id)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: false })
      .order('hora_entrada', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los registros del día
app.get('/hoy', async (req, res) => {
  try {
    const fecha = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('registros_horario')
      .select(`
        *,
        empleados (
          nombre,
          apellido,
          cargo
        )
      `)
      .eq('fecha', fecha)
      .order('hora_entrada', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
