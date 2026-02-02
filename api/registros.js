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

  // Detectar acción por query param (Vercel rewrite) o por URL original
  const url = req.url || '';
  const query = new URL(url, `http://${req.headers.host}`).searchParams;
  const action = query.get('action');

  const isAction = (target) => action === target || url.includes('/' + target);

  try {
    // Registrar entrada
    if (req.method === 'POST' && isAction('entrada')) {
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

    // Registrar salida
    if (req.method === 'POST' && isAction('salida')) {
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
      return res.json({ message: 'Salida registrada', hora });
    }

    // Obtener todos los registros del día
    if (req.method === 'GET' && isAction('hoy')) {
      const fecha = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('registros_horario')
        .select('*, empleados(nombre, apellido, cargo)')
        .eq('fecha', fecha)
        .order('hora_entrada', { ascending: false });

      if (error) throw error;
      return res.json(data);
    }

    // Reportes por empleado
    if (req.method === 'GET' && isAction('empleado')) {
      const id = query.get('id') || url.split('/empleado/')[1]?.split('?')[0];
      const fechaInicio = query.get('fechaInicio') || url.split('fechaInicio=')[1]?.split('&')[0];
      const fechaFin = query.get('fechaFin') || url.split('fechaFin=')[1]?.split('&')[0];

      const { data, error } = await supabase
        .from('registros_horario')
        .select('*, empleados(nombre, apellido)')
        .eq('empleado_id', id)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: false });

      if (error) throw error;
      return res.json(data);
    }

    res.status(404).json({
      error: 'Ruta no encontrada r9',
      debug: { url, action, method: req.method }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
