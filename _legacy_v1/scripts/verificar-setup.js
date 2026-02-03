#!/usr/bin/env node

/**
 * Script para verificar que todo está configurado correctamente
 * Uso: node scripts/verificar-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración del proyecto...\n');

let errores = 0;
let advertencias = 0;

// Verificar archivo .env
console.log('📄 Verificando archivo .env...');
if (fs.existsSync('.env')) {
  console.log('  ✅ Archivo .env existe');
  
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('SUPABASE_URL=')) {
    if (envContent.includes('https://') && envContent.includes('.supabase.co')) {
      console.log('  ✅ SUPABASE_URL configurada');
    } else {
      console.log('  ⚠️  SUPABASE_URL parece incorrecta');
      advertencias++;
    }
  } else {
    console.log('  ❌ Falta SUPABASE_URL');
    errores++;
  }
  
  if (envContent.includes('SUPABASE_KEY=')) {
    console.log('  ✅ SUPABASE_KEY configurada');
  } else {
    console.log('  ❌ Falta SUPABASE_KEY');
    errores++;
  }
  
  if (envContent.includes('JWT_SECRET=')) {
    console.log('  ✅ JWT_SECRET configurada');
  } else {
    console.log('  ❌ Falta JWT_SECRET');
    errores++;
  }
} else {
  console.log('  ❌ Archivo .env no existe');
  console.log('  💡 Ejecuta: cp .env.example .env');
  errores++;
}

// Verificar node_modules
console.log('\n📦 Verificando dependencias...');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ Dependencias del backend instaladas');
} else {
  console.log('  ❌ Faltan dependencias del backend');
  console.log('  💡 Ejecuta: npm install');
  errores++;
}

if (fs.existsSync('client/node_modules')) {
  console.log('  ✅ Dependencias del frontend instaladas');
} else {
  console.log('  ⚠️  Faltan dependencias del frontend');
  console.log('  💡 Ejecuta: cd client && npm install');
  advertencias++;
}

// Verificar archivos importantes
console.log('\n📁 Verificando archivos del proyecto...');
const archivosImportantes = [
  'server.js',
  'config/supabase.js',
  'routes/auth.js',
  'routes/empleados.js',
  'routes/registros.js',
  'client/src/App.js',
  'database/supabase_schema.sql'
];

archivosImportantes.forEach(archivo => {
  if (fs.existsSync(archivo)) {
    console.log(`  ✅ ${archivo}`);
  } else {
    console.log(`  ❌ Falta ${archivo}`);
    errores++;
  }
});

// Verificar package.json
console.log('\n📋 Verificando package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (pkg.dependencies['@supabase/supabase-js']) {
    console.log('  ✅ Supabase instalado');
  } else {
    console.log('  ❌ Falta @supabase/supabase-js');
    console.log('  💡 Ejecuta: npm install @supabase/supabase-js');
    errores++;
  }
  
  if (pkg.dependencies['express']) {
    console.log('  ✅ Express instalado');
  } else {
    console.log('  ❌ Falta express');
    errores++;
  }
  
  if (pkg.scripts['dev']) {
    console.log('  ✅ Script "dev" configurado');
  } else {
    console.log('  ⚠️  Falta script "dev"');
    advertencias++;
  }
} catch (error) {
  console.log('  ❌ Error al leer package.json');
  errores++;
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN');
console.log('='.repeat(50));

if (errores === 0 && advertencias === 0) {
  console.log('\n✅ ¡Todo está configurado correctamente!');
  console.log('\n🚀 Próximos pasos:');
  console.log('   1. Crea tu proyecto en Supabase');
  console.log('   2. Ejecuta el SQL de database/supabase_schema.sql');
  console.log('   3. Inicia el backend: npm run dev');
  console.log('   4. Inicia el frontend: npm run client');
  console.log('\n📚 Lee INICIO_RAPIDO.md para más detalles\n');
} else {
  if (errores > 0) {
    console.log(`\n❌ ${errores} error(es) encontrado(s)`);
  }
  if (advertencias > 0) {
    console.log(`⚠️  ${advertencias} advertencia(s) encontrada(s)`);
  }
  console.log('\n💡 Revisa los mensajes arriba para solucionar los problemas\n');
  process.exit(1);
}
