import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ytaypvluxvktvizyrrmj.supabase.co';
const supabaseAnonKey = 'sb_publishable__lstDYv41v7la-Q5pDdBsQ_ZGRef6X1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
