import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '../lib/locale';

/**
 * Configuración de next-intl para App Router.
 *
 * Este archivo es el punto de entrada que next-intl busca en `i18n/request.ts`
 * para resolver el locale y cargar los mensajes de traducción en cada request
 * del servidor. Fue ubicado en `i18n/request.ts` (y no en `i18n.ts`) porque
 * esta es la ruta que next-intl resuelve correctamente durante el build con
 * Next.js App Router.
 *
 * --- Flujo de resolución de locale ---
 * 1. `getUserLocale()` lee la cookie `NEXT_LOCALE` del request actual.
 * 2. Si la cookie existe, retorna su valor ('es' o 'en').
 * 3. Si no existe (primera visita), retorna 'es' como idioma por defecto.
 * 4. Se importa dinámicamente el archivo de mensajes correspondiente:
 *    - `messages/es.json` para español.
 *    - `messages/en.json` para inglés.
 *
 * --- Cambio de idioma ---
 * El usuario cambia el idioma desde el selector en `Navbar.tsx`, que llama
 * a `setUserLocale()` (Server Action) para escribir la cookie `NEXT_LOCALE`.
 * El cambio tiene efecto en el siguiente request al servidor.
 *
 * --- Idiomas soportados ---
 * - `es` — Español (por defecto)
 * - `en` — Inglés
 *
 * Para agregar un nuevo idioma: crear `messages/{locale}.json` y actualizar
 * la lógica de validación en `lib/locale.ts` si se requiere.
 *
 * @see lib/locale.ts — `getUserLocale` y `setUserLocale` (Server Actions)
 * @see messages/es.json — traducciones en español
 * @see messages/en.json — traducciones en inglés
 * @see components/dashboard/Navbar.tsx — selector de idioma
 */
export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
