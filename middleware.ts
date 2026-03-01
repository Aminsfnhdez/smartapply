/**
 * Middleware de protección de rutas para el dashboard.
 *
 * Reutiliza el helper `auth` de NextAuth v5 directamente como middleware,
 * siguiendo el patrón recomendado para App Router. NextAuth se encarga
 * internamente de verificar el JWT de sesión en cada request entrante.
 *
 * Si el usuario no tiene sesión válida al intentar acceder a una ruta
 * protegida, NextAuth lo redirige automáticamente a la página configurada
 * en `pages.signIn` (`/login`).
 *
 * --- Rutas protegidas (matcher) ---
 * - /dashboard y subrutas
 * - /profile y subrutas
 * - /generate y subrutas
 * - /history y subrutas
 *
 * La landing page `/` y la página `/login` son públicas y no están
 * incluidas en el matcher, por lo que el middleware no las intercepta.
 *
 * --- Por qué no se usa un matcher con regex ---
 * Next.js recomienda matchers de string con `:path*` para rutas de App Router.
 * Evitar regex complejas reduce el riesgo de falsos positivos o negativos
 * en la protección de rutas.
 *
 * @see app/api/auth/[...nextauth]/route.ts — configuración de NextAuth y `auth`
 */
export { auth as middleware } from "@/app/api/auth/[...nextauth]/route";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/generate/:path*",
    "/history/:path*",
  ],
};
