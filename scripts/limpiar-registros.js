const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function clearRecords() {
    console.log('⚠️ Borrando todos los registros de entrada/salida...');

    // Borrar todos los registros de la tabla registros_horario
    // En Supabase, para borrar todo sin filtro hay que usar un filtro que siempre sea cierto o .neq('id', 0)
    const { data, error, count } = await supabase
        .from('registros_horario')
        .delete()
        .neq('id', 0); // Esto borrará todos los registros cuyos IDs no sean 0 (todos)

    if (error) {
        console.error('❌ Error al borrar registros:', error);
    } else {
        console.log('✅ Todos los registros han sido eliminados correctamente.');
        console.log('Ahora el sistema está limpio para nuevas pruebas.');
    }
}

clearRecords();
