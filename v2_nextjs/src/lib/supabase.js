import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno si existen, o valores dummy durante el build para evitar crashes
// Vercel build puede no tener las env vars si no se han configurado aun en el proyecto
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
