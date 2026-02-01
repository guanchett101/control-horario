// Test para cambiar contraseña directamente
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function testCambiarPassword() {
  console.log('🧪 Probando cambio de contraseña...\n');
  
  const userId = 4; // ID del usuario marcos2
  const passwordActual = '123456';
  const passwordNueva = 'nuevapass123';
  
  try {
    // 1. Obtener usuario
    console.log('1️⃣ Obteniendo usuario ID:', userId);
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, username, password_hash')
      .eq('id', userId)
      .single();

    if (userError || !usuario) {
      console.log('❌ Usuario no encontrado:', userError?.message);
      return;
    }

    console.log('✅ Usuario encontrado:', usuario.username);
    console.log('');

    // 2. Verificar contraseña actual
    console.log('2️⃣ Verificando contraseña actual...');
    const isMatch = await bcrypt.compare(passwordActual, usuario.password_hash);
    
    if (!isMatch) {
      console.log('❌ Contraseña actual incorrecta');
      console.log('   Hash en BD:', usuario.password_hash.substring(0, 20) + '...');
      
      // Probar con la contraseña que podría estar
      console.log('');
      console.log('🔍 Probando otras contraseñas...');
      const passwords = ['123456', 'admin123', 'marcos123'];
      for (const pass of passwords) {
        const match = await bcrypt.compare(pass, usuario.password_hash);
        if (match) {
          console.log(`✅ La contraseña correcta es: "${pass}"`);
          break;
        }
      }
      return;
    }

    console.log('✅ Contraseña actual correcta');
    console.log('');

    // 3. Actualizar contraseña
    console.log('3️⃣ Actualizando contraseña...');
    const nuevoHash = await bcrypt.hash(passwordNueva, 10);
    
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password_hash: nuevoHash })
      .eq('id', userId);

    if (updateError) {
      console.log('❌ Error al actualizar:', updateError.message);
      return;
    }

    console.log('✅ Contraseña actualizada exitosamente');
    console.log('');
    console.log('📋 Nueva contraseña:', passwordNueva);
    console.log('');
    console.log('🎉 Prueba completada con éxito');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCambiarPassword();
