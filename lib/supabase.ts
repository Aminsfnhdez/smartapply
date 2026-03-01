import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Cliente de Supabase con privilegios de administrador (Service Role).
 *
 * Usa la `SUPABASE_SERVICE_ROLE_KEY` que bypasea todas las políticas RLS
 * de Supabase. Debe usarse EXCLUSIVAMENTE en el servidor (Route Handlers,
 * Server Actions, lib/) — nunca exponer este cliente al navegador.
 *
 * Se deshabilita la persistencia de sesión (`persistSession: false`) porque
 * este cliente es stateless y no necesita mantener tokens de usuario.
 *
 * Casos de uso:
 * - Subir PDFs al bucket `cvs` en nombre del usuario.
 * - Generar URLs firmadas para descarga privada.
 * - Operaciones de base de datos que requieren bypass de RLS.
 *
 * @example
 * import { supabaseAdmin } from '@/lib/supabase';
 * await supabaseAdmin.storage.from('cvs').upload(path, buffer);
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Cliente de Supabase anónimo (clave pública).
 *
 * Usa la `NEXT_PUBLIC_SUPABASE_ANON_KEY` y respeta todas las políticas RLS.
 * Puede usarse tanto en el servidor como en el cliente (browser).
 *
 * Actualmente reservado para operaciones públicas o futuras integraciones
 * del lado del cliente. La mayor parte de las operaciones del proyecto
 * usan `supabaseAdmin` por ejecutarse en el servidor.
 *
 * @example
 * import { supabase } from '@/lib/supabase';
 * const { data } = await supabase.from('public_table').select('*');
 */
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
