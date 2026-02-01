#!/usr/bin/env node

/**
 * Script para generar hash de contraseña
 * Uso: node scripts/generar-password.js tu_contraseña
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Debes proporcionar una contraseña');
  console.log('\nUso: node scripts/generar-password.js tu_contraseña');
  console.log('Ejemplo: node scripts/generar-password.js admin123\n');
  process.exit(1);
}

console.log('\n🔐 Generando hash de contraseña...\n');

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error al generar hash:', err);
    process.exit(1);
  }
  
  console.log('✅ Hash generado exitosamente:\n');
  console.log(hash);
  console.log('\n📋 Copia este hash y úsalo en Supabase SQL Editor:\n');
  console.log(`UPDATE usuarios SET password_hash = '${hash}' WHERE username = 'admin';\n`);
});
