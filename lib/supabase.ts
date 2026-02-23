import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Cliente de Supabase con Service Role para bypass de RLS en el servidor (uso interno)
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Cliente de Supabase anónimo (si fuera necesario para operaciones públicas)
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
