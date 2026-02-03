const { createClient } = require('@supabase/supabase-js');
const { parse } = require('url');

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

  const { query } = parse(req.url, true);
  const action = query.action;

  // ID puede venir en query (?id=1) o en path normal (/123)
  let id = query.id;
  if (!id) {
    const parts = req.url.split('/');
    const lastPart = parts[parts.length - 1].split('?')[0];
    if (!isNaN(lastPart)) {
      id = lastPart;
    }
  }

  try {
    // 1. LISTAR O DETALLE
    if (req.method === 'GET') {
      if (id) {
        // Detalle
        const { data, error } = await supabase.from('empleados').select('*').eq('id', id).single();
        if (error) throw error;
        return res.json(data);
      } else {
        // Listar todos
        // (Si action es 'list' o simplemente root)
        const { data, error } = await supabase.from('empleados').select('*').eq('activo', true).order('id', { ascending: true });
        if (error) throw error;
        return res.json(data);
      }
    }

    // 2. CREAR
    if (req.method === 'POST') {
      const { nombre, apellido, email, telefono, cargo, fechaIngreso } = req.body;
      const { data, error } = await supabase
        .from('empleados')
        .insert([{ nombre, apellido, email, telefono, cargo, fecha_ingreso: fechaIngreso }])
        .select();
      if (error) throw error;
      return res.status(201).json({ id: data[0].id, message: 'Empleado creado' });
    }

    // 3. ACTUALIZAR
    if (req.method === 'PUT' && id) {
      const { nombre, apellido, email, telefono, cargo } = req.body;
      const { error } = await supabase.from('empleados').update({ nombre, apellido, email, telefono, cargo }).eq('id', id);
      if (error) throw error;
      return res.json({ message: 'Empleado actualizado' });
    }

    // 4. ELIMINAR (Soft Delete)
    if (req.method === 'DELETE' && id) {
      // Borrar usuario asociado si existe
      await supabase.from('usuarios').delete().eq('empleado_id', id);
      // Marcar empleado como inactivo
      const { error } = await supabase.from('empleados').update({ activo: false }).eq('id', id);
      if (error) throw error;
      return res.json({ message: 'Empleado eliminado' });
    }

    res.status(404).json({
      error: 'Ruta de empleados no encontrada (r10)',
      debug: { url: req.url, action, id, method: req.method }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
