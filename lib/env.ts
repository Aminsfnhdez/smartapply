import { z } from 'zod';

const envSchema = z.object({
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  // Base de Datos
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // IA - Claude
  ANTHROPIC_API_KEY: z.string().min(1).startsWith('sk-ant-'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const processEnv = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas o faltantes:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('La aplicación no puede iniciar: variables de entorno incorrectas.');
}

export const env = parsed.data;
