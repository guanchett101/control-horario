// Restaurar contraseña a 123456
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function restaurarPassword() {
  console.log('🔄 Restaurando contraseña a 123456...\n');
  
  const userId = 4; // marcos2
  const password = '123456';
  
  try {
    const nuevoHash = await bcrypt.hash(password, 10);
    
    const { error } = await supabase
      .from('usuarios')
      .update({ password_hash: nuevoHash })
      .eq('id', userId);

    if (error) throw error;

    console.log('✅ Contraseña restaurada a: 123456');
    console.log('');
    console.log('Ahora puedes entrar con:');
    console.log('  Usuario: Marcos2 Medina Trujillo');
    console.log('  Contraseña: 123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

restaurarPassword();
