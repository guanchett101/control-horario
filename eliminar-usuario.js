// Script para eliminar empleado "marcos medina" (NO TOCA AL ADMIN)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function eliminarEmpleado() {
  console.log('🔍 Buscando empleado "marcos medina"...\n');
  
  try {
    // Buscar todos los empleados
    const { data: empleados, error: searchError } = await supabase
      .from('empleados')
      .select('*');

    if (searchError) {
      console.error('❌ Error al buscar empleados:', searchError.message);
      return;
    }

    console.log('📋 Empleados en la base de datos:');
    empleados.forEach(emp => {
      console.log(`   - ID: ${emp.id} | ${emp.nombre} ${emp.apellido} | ${emp.cargo}`);
    });
    console.log('');

    // Buscar el empleado Marcos Medina (que NO sea admin)
    const empleadoMarcos = empleados.find(emp => 
      emp.nombre.toLowerCase().includes('marcos') && 
      emp.apellido.toLowerCase().includes('medina') &&
      emp.cargo.toLowerCase() !== 'administrador'
    );

    if (!empleadoMarcos) {
      console.log('❌ Empleado "marcos medina" (no admin) no encontrado');
      return;
    }

    console.log('✅ Empleado encontrado:');
    console.log(`   - ID: ${empleadoMarcos.id}`);
    console.log(`   - Nombre: ${empleadoMarcos.nombre} ${empleadoMarcos.apellido}`);
    console.log(`   - Cargo: ${empleadoMarcos.cargo}`);
    console.log(`   - Email: ${empleadoMarcos.email || 'N/A'}`);
    console.log('');

    // Verificar si tiene usuario asociado
    const { data: usuarios, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empleado_id', empleadoMarcos.id);

    if (usuarios && usuarios.length > 0) {
      console.log('🗑️  Eliminando usuario asociado...');
      const { error: deleteUserError } = await supabase
        .from('usuarios')
        .delete()
        .eq('empleado_id', empleadoMarcos.id);

      if (deleteUserError) {
        console.error('❌ Error al eliminar usuario:', deleteUserError.message);
        return;
      }
      console.log('✅ Usuario asociado eliminado');
    }

    // Eliminar el empleado
    console.log('🗑️  Eliminando empleado...');
    const { error: deleteEmpError } = await supabase
      .from('empleados')
      .delete()
      .eq('id', empleadoMarcos.id);

    if (deleteEmpError) {
      console.error('❌ Error al eliminar empleado:', deleteEmpError.message);
      return;
    }

    console.log('✅ Empleado eliminado');
    console.log('\n🎉 Empleado "marcos medina" eliminado completamente');
    console.log('⚠️  ADMIN protegido - no se tocó');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

eliminarEmpleado();
