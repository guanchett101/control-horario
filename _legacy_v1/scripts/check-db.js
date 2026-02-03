const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function checkRecords() {
    console.log('--- Ultimos 10 registros ---');
    const { data, error } = await supabase
        .from('registros_horario')
        .select('*, empleados(nombre, apellido)')
        .order('id', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    data.forEach(r => {
        console.log(`ID: ${r.id} | Empleado: ${r.empleados?.nombre} ${r.empleados?.apellido} (${r.empleado_id}) | Fecha: ${r.fecha} | Entrada: ${r.hora_entrada} | Salida: ${r.hora_salida}`);
    });

    const hoy = new Date().toISOString().split('T')[0];
    console.log(`\n--- Hoy (UTC): ${hoy} ---`);
}

checkRecords();
