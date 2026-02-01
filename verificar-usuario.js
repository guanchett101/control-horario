// Script para verificar si el usuario admin existe en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function verificarUsuario() {
  console.log('🔍 Verificando usuario admin en Supabase...\n');
  
  try {
    // Buscar usuario admin
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', 'admin');

    if (error) {
      console.error('❌ Error al buscar usuario:', error.message);
      return;
    }

    if (!usuarios || usuarios.length === 0) {
      console.log('❌ Usuario admin NO existe en la base de datos');
      console.log('📝 Necesitas crear el usuario admin');
      return;
    }

    console.log('✅ Usuario admin encontrado:');
    console.log('   - ID:', usuarios[0].id);
    console.log('   - Username:', usuarios[0].username);
    console.log('   - Rol:', usuarios[0].rol);
    console.log('   - Empleado ID:', usuarios[0].empleado_id);
    console.log('   - Password hash existe:', !!usuarios[0].password_hash);
    
    // Verificar si el empleado existe
    if (usuarios[0].empleado_id) {
      const { data: empleado, error: empError } = await supabase
        .from('empleados')
        .select('*')
        .eq('id', usuarios[0].empleado_id)
        .single();
      
      if (empError) {
        console.log('⚠️  Empleado asociado NO encontrado');
      } else {
        console.log('✅ Empleado asociado:', empleado.nombre, empleado.apellido);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarUsuario();
