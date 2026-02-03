// Script para verificar contraseña de un usuario
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function verificarPassword() {
  console.log('🔍 Verificando contraseñas de usuarios...\n');
  
  try {
    // Obtener todos los usuarios
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        username,
        password_hash,
        rol,
        empleados (
          nombre,
          apellido
        )
      `);

    if (error) throw error;

    console.log('📋 Usuarios encontrados:\n');

    for (const user of usuarios) {
      console.log(`👤 ${user.empleados.nombre} ${user.empleados.apellido}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Rol: ${user.rol}`);
      
      // Probar contraseñas comunes
      const passwordsProbar = ['admin123', '123456', 'admin', 'password'];
      let encontrada = false;
      
      for (const pwd of passwordsProbar) {
        const match = await bcrypt.compare(pwd, user.password_hash);
        if (match) {
          console.log(`   ✅ Contraseña actual: ${pwd}`);
          encontrada = true;
          break;
        }
      }
      
      if (!encontrada) {
        console.log(`   ⚠️  Contraseña: No es ninguna de las comunes`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificarPassword();
