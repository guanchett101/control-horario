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

  const path = req.url.replace('/api/empleados', '');
  const id = path.split('/')[1];

  try {
    // Obtener todos los empleados
    if (req.method === 'GET' && path === '') {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('activo', true)
        .order('id', { ascending: true });

      if (error) throw error;
      return res.json(data);
    }

    // Obtener empleado por ID
    if (req.method === 'GET' && id) {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Empleado no encontrado' });
      
      return res.json(data);
    }

    // Crear nuevo empleado
    if (req.method === 'POST') {
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
      return res.status(201).json({ id: data[0].id, message: 'Empleado creado exitosamente' });
    }

    // Actualizar empleado
    if (req.method === 'PUT' && id) {
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
        .eq('id', id);

      if (error) throw error;
      return res.json({ message: 'Empleado actualizado exitosamente' });
    }

    // Desactivar empleado y eliminar usuario
    if (req.method === 'DELETE' && id) {
      // Primero eliminar el usuario asociado
      const { error: deleteUserError } = await supabase
        .from('usuarios')
        .delete()
        .eq('empleado_id', id);

      // Luego desactivar el empleado
      const { error } = await supabase
        .from('empleados')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;
      return res.json({ message: 'Empleado y usuario eliminados exitosamente' });
    }

    res.status(404).json({ error: 'Ruta no encontrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
