// Script para ver todos los usuarios
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function verUsuarios() {
  console.log('👥 Listando todos los usuarios...\n');
  
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empleados (
          nombre,
          apellido,
          activo
        )
      `)
      .order('id', { ascending: true });

    if (error) throw error;

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }

    console.log(`📋 Total de usuarios: ${usuarios.length}\n`);
    
    usuarios.forEach(u => {
      console.log(`Usuario ID: ${u.id}`);
      console.log(`  Username: ${u.username}`);
      console.log(`  Rol: ${u.rol}`);
      console.log(`  Empleado ID: ${u.empleado_id}`);
      if (u.empleados) {
        console.log(`  Empleado: ${u.empleados.nombre} ${u.empleados.apellido}`);
        console.log(`  Activo: ${u.empleados.activo ? 'Sí' : 'No'}`);
      } else {
        console.log(`  ⚠️  Empleado no encontrado`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verUsuarios();
