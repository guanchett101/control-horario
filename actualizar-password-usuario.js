// Script para actualizar contraseña de un usuario específico
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function actualizarPassword() {
  const username = 'marcos.medina';
  const nuevaPassword = '123456';

  console.log('🔐 Actualizando contraseña...\n');
  
  try {
    // Buscar el usuario
    const { data: usuario, error: searchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('username', username)
      .single();

    if (searchError || !usuario) {
      console.log('❌ Usuario "' + username + '" no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('   - ID:', usuario.id);
    console.log('   - Username:', usuario.username);
    console.log('   - Rol:', usuario.rol);
    console.log('');

    // Generar nuevo hash
    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);

    // Actualizar contraseña
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ password_hash: nuevoHash })
      .eq('id', usuario.id);

    if (updateError) {
      console.error('❌ Error al actualizar:', updateError.message);
      return;
    }

    console.log('✅ Contraseña actualizada exitosamente');
    console.log('');
    console.log('📋 Nuevas credenciales:');
    console.log('   Usuario: ' + username);
    console.log('   Contraseña: ' + nuevaPassword);
    console.log('');
    console.log('💡 El usuario puede cambiar su contraseña desde la opción "🔐 Contraseña" en el menú');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

actualizarPassword();
