// Script para eliminar usuarios de empleados inactivos
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function limpiarUsuarios() {
  console.log('🧹 Limpiando usuarios huérfanos...\n');
  
  try {
    // Obtener todos los empleados inactivos
    const { data: empleadosInactivos, error: empError } = await supabase
      .from('empleados')
      .select('id, nombre, apellido')
      .eq('activo', false);

    if (empError) throw empError;

    if (!empleadosInactivos || empleadosInactivos.length === 0) {
      console.log('✅ No hay empleados inactivos');
      return;
    }

    console.log(`📋 Empleados inactivos encontrados: ${empleadosInactivos.length}`);
    empleadosInactivos.forEach(emp => {
      console.log(`   - ID ${emp.id}: ${emp.nombre} ${emp.apellido}`);
    });
    console.log('');

    // Eliminar usuarios de empleados inactivos
    const idsInactivos = empleadosInactivos.map(e => e.id);
    
    const { data: usuariosEliminados, error: deleteError } = await supabase
      .from('usuarios')
      .delete()
      .in('empleado_id', idsInactivos)
      .select();

    if (deleteError) throw deleteError;

    if (usuariosEliminados && usuariosEliminados.length > 0) {
      console.log(`✅ Usuarios eliminados: ${usuariosEliminados.length}`);
      usuariosEliminados.forEach(u => {
        console.log(`   - Username: ${u.username}`);
      });
    } else {
      console.log('✅ No había usuarios asociados a empleados inactivos');
    }

    console.log('');
    console.log('🎉 Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

limpiarUsuarios();
