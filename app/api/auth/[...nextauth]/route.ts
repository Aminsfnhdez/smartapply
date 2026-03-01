import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/**
 * Configuración central de NextAuth.js v5.
 *
 * Este archivo es el único punto de verdad para la autenticación en el proyecto.
 * Exporta los handlers HTTP (`GET`, `POST`), y los helpers `auth`, `signIn` y
 * `signOut` que se reutilizan en otros módulos del servidor.
 *
 * --- Adaptador ---
 * Usa `PrismaAdapter` para persistir usuarios, cuentas, sesiones y tokens
 * de verificación en Supabase (PostgreSQL) a través del cliente Prisma singleton.
 *
 * --- Proveedores ---
 * - Google OAuth 2.0
 * - GitHub OAuth
 * Las credenciales se leen desde `lib/env.ts` (validadas con Zod al arranque).
 *
 * --- Estrategia de sesión ---
 * JWT: la sesión se mantiene en un token firmado en la cookie del navegador,
 * sin necesidad de consultar la base de datos en cada request.
 *
 * --- Callback de sesión ---
 * El callback `session` inyecta el `token.sub` (ID del usuario en la DB)
 * dentro de `session.user.id`, permitiendo que los Route Handlers identifiquen
 * al usuario autenticado sin consultas adicionales:
 * ```ts
 * const session = await auth();
 * session.user.id; // ID del usuario en Prisma/Supabase
 * ```
 *
 * --- Página de login personalizada ---
 * NextAuth redirige a `/login` en lugar de su página por defecto cuando
 * el usuario no está autenticado.
 *
 * --- Protección de rutas ---
 * El middleware en `middleware.ts` importa `auth` de este archivo para
 * proteger las rutas del dashboard sin lógica duplicada.
 *
 * @see middleware.ts — protección de rutas `/(dashboard)`
 * @see lib/prisma.ts — cliente Prisma usado por el adaptador
 */
const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Enriquece el objeto de sesión con el ID del usuario desde el JWT.
     *
     * Por defecto, NextAuth no expone el ID de la base de datos en la sesión.
     * Este callback copia `token.sub` (que NextAuth asigna automáticamente
     * como el ID del registro en la tabla User de Prisma) a `session.user.id`.
     *
     * Sin este callback, `session.user.id` sería `undefined` en los
     * Route Handlers que llaman a `auth()`.
     */
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

/**
 * Handlers HTTP para la ruta dinámica `/api/auth/[...nextauth]`.
 *
 * - `GET`: maneja callbacks OAuth, verificación de sesión, logout.
 * - `POST`: maneja inicio de sesión con credenciales y tokens CSRF.
 */
export const { GET, POST } = handlers;

/**
 * Helper para obtener la sesión activa del usuario en el servidor.
 *
 * Se importa en Route Handlers, Server Components y el middleware
 * para verificar autenticación sin llamadas adicionales a la DB.
 *
 * @example
 * const session = await auth();
 * if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
 */
export { auth, signIn, signOut };
