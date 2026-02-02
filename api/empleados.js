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
  const id = query.get('id');

  try {
    // Listado
    if (req.method === 'GET' && (action === 'list' || url === '/api/empleados' || url === '/api/empleados/')) {
      const { data, error } = await supabase.from('empleados').select('*').eq('activo', true).order('id', { ascending: true });
      if (error) throw error;
      return res.json(data);
    }

    // Detalle / Update / Delete
    if (id && !isNaN(id)) {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('empleados').select('*').eq('id', id).single();
        if (error) throw error;
        return res.json(data);
      }
      if (req.method === 'PUT') {
        const { nombre, apellido, email, telefono, cargo } = req.body;
        const { error } = await supabase.from('empleados').update({ nombre, apellido, email, telefono, cargo }).eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Empleado actualizado' });
      }
      if (req.method === 'DELETE') {
        await supabase.from('usuarios').delete().eq('empleado_id', id);
        const { error } = await supabase.from('empleados').update({ activo: false }).eq('id', id);
        if (error) throw error;
        return res.json({ message: 'Empleado desactivado' });
      }
    }

    // Crear
    if (req.method === 'POST') {
      const { nombre, apellido, email, telefono, cargo, fechaIngreso } = req.body;
      const { data, error } = await supabase.from('empleados').insert([{ nombre, apellido, email, telefono, cargo, fecha_ingreso: fechaIngreso }]).select();
      if (error) throw error;
      return res.status(201).json({ id: data[0].id, message: 'Empleado creado' });
    }

    res.status(404).json({ error: 'Ruta no encontrada r9', debug: { url, action, id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
