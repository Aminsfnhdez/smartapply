'use server';

import { cookies } from 'next/headers';

/**
 * Server Actions para gestión del locale del usuario.
 *
 * Implementan la persistencia del idioma seleccionado usando una cookie
 * HTTP (`NEXT_LOCALE`) en lugar de parámetros de URL o localStorage.
 * Esto permite que next-intl resuelva el locale en el servidor sin
 * necesidad de prefijos de idioma en las rutas (`/es/dashboard`, etc.).
 *
 * Ambas funciones son Server Actions (`'use server'`), lo que significa
 * que se ejecutan en el servidor aunque sean llamadas desde componentes
 * cliente, y tienen acceso a la API de cookies de Next.js.
 *
 * @see i18n/request.ts — consume `getUserLocale` para configurar next-intl
 * @see components/dashboard/Navbar.tsx — llama a `setUserLocale` al cambiar idioma
 */

/**
 * Persiste el locale seleccionado por el usuario en una cookie HTTP.
 *
 * Configura la cookie `NEXT_LOCALE` con:
 * - `path: '/'` — disponible en todas las rutas de la aplicación.
 * - `maxAge: 1 año` — persiste entre sesiones del navegador.
 * - `sameSite: 'lax'` — protección CSRF básica permitiendo navegación normal.
 *
 * El cambio de locale tiene efecto en el siguiente request al servidor,
 * momento en que `i18n/request.ts` leerá el nuevo valor de la cookie.
 *
 * @param locale - Código de idioma a persistir ('es' o 'en').
 *
 * @example
 * // Desde un componente cliente o Server Action
 * await setUserLocale('en');
 */
export async function setUserLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 año
    sameSite: 'lax',
  });
}

/**
 * Lee el locale actual del usuario desde la cookie `NEXT_LOCALE`.
 *
 * Si la cookie no existe (primera visita o cookies borradas), retorna
 * `'es'` como idioma por defecto de la aplicación.
 *
 * @returns El código de locale activo: `'es'` o `'en'`.
 *
 * @example
 * const locale = await getUserLocale();
 * // → 'es' | 'en'
 */
export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value || 'es';
}
