const { createClient } = require('@supabase/supabase-js');
const { parse } = require('url');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parseo seguro de URL y Query Params
  const { query } = parse(req.url, true);
  const action = query.action;

  try {
    // 1. REGISTRAR ENTRADA
    if (req.method === 'POST' && (action === 'entrada' || req.url.includes('/entrada'))) {
      const { empleadoId } = req.body;
      const fecha = new Date().toISOString().split('T')[0];
      const hora = new Date().toTimeString().split(' ')[0];

      const { data, error } = await supabase
        .from('registros_horario')
        .insert([{ empleado_id: empleadoId, fecha, hora_entrada: hora }])
        .select();

      if (error) throw error;
      return res.status(201).json({ id: data[0].id, message: 'Entrada registrada', hora });
    }

    // 2. REGISTRAR SALIDA
    if (req.method === 'POST' && (action === 'salida' || req.url.includes('/salida'))) {
      const { empleadoId } = req.body;
      const fecha = new Date().toISOString().split('T')[0];
      const hora = new Date().toTimeString().split(' ')[0];

      // Buscar el último registro de entrada que no tenga hora de salida
      // Quitamos la restricción de fecha estricta para que si alguien olvidó fichar ayer
      // o hay desfases de zona horaria, pueda cerrar su turno hoy.
      const { data: registros, error: searchError } = await supabase
        .from('registros_horario')
        .select('*')
        .eq('empleado_id', empleadoId)
        .is('hora_salida', null)
        .order('id', { ascending: false })
        .limit(1);

      if (searchError) throw searchError;
      if (!registros || registros.length === 0) {
        return res.status(404).json({ error: 'No tienes ninguna entrada abierta para registrar salida.' });
      }

      const { error: updateError } = await supabase
        .from('registros_horario')
        .update({ hora_salida: hora })
        .eq('id', registros[0].id);

      if (updateError) throw updateError;
      return res.json({ message: 'Salida registrada', hora });
    }

    // 3. OBTENER REGISTROS DE HOY
    if (req.method === 'GET' && (action === 'hoy' || req.url.includes('/hoy'))) {
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
      return res.json(data || []);
    }

    // 4. REPORTES POR EMPLEADO
    if (req.method === 'GET' && (action === 'empleado' || req.url.includes('/empleado'))) {
      const id = query.id || (req.url.split('/empleado/')[1] || '').split('?')[0];
      const fechaInicio = query.fechaInicio;
      const fechaFin = query.fechaFin;

      if (!id) return res.status(400).json({ error: 'ID de empleado requerido' });

      let querySupabase = supabase
        .from('registros_horario')
        .select('*, empleados(nombre, apellido)')
        .eq('empleado_id', id)
        .order('fecha', { ascending: false });

      if (fechaInicio) querySupabase = querySupabase.gte('fecha', fechaInicio);
      if (fechaFin) querySupabase = querySupabase.lte('fecha', fechaFin);

      const { data, error } = await querySupabase;

      if (error) throw error;
      return res.json(data || []);
    }

    // Fallback error
    res.status(404).json({
      error: 'Ruta de registros no encontrada (r10)',
      debug: { url: req.url, action, method: req.method }
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};
