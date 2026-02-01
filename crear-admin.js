// Script para crear usuario admin en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function crearAdmin() {
  console.log('🔧 Creando usuario admin...\n');
  
  try {
    // 1. Crear empleado admin
    console.log('📝 Paso 1: Creando empleado admin...');
    const { data: empleado, error: empError } = await supabase
      .from('empleados')
      .insert([
        {
          nombre: 'Administrador',
          apellido: 'Sistema',
          email: 'admin@sistema.com',
          telefono: '000000000',
          cargo: 'Administrador',
          fecha_ingreso: new Date().toISOString().split('T')[0],
          activo: true
        }
      ])
      .select()
      .single();

    if (empError) {
      console.error('❌ Error al crear empleado:', empError.message);
      return;
    }

    console.log('✅ Empleado creado con ID:', empleado.id);

    // 2. Crear usuario admin
    console.log('📝 Paso 2: Creando usuario admin...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .insert([
        {
          empleado_id: empleado.id,
          username: 'admin',
          password_hash: passwordHash,
          rol: 'admin'
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('❌ Error al crear usuario:', userError.message);
      return;
    }

    console.log('✅ Usuario creado con ID:', usuario.id);
    console.log('\n🎉 ¡Usuario admin creado exitosamente!');
    console.log('📋 Credenciales:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('\n✅ Ahora puedes iniciar sesión en Vercel');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

crearAdmin();
