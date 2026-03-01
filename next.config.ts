import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

/**
 * Plugin de next-intl para Next.js App Router.
 *
 * Envuelve la configuración de Next.js con el soporte de internacionalización.
 * Sin argumentos, busca el archivo de configuración en la ruta por defecto:
 * `i18n/request.ts`. Esta ruta fue elegida sobre `i18n.ts` porque next-intl
 * la resuelve correctamente durante el build con App Router.
 *
 * @see i18n/request.ts — configuración de locales y carga de mensajes
 */
const withNextIntl = createNextIntlPlugin();

/**
 * Configuración principal de Next.js.
 *
 * --- Imágenes remotas ---
 * Next.js bloquea por defecto la optimización de imágenes de dominios externos.
 * Se declaran explícitamente los hostnames de los proveedores OAuth para que
 * `next/image` pueda optimizar y servir los avatares de los usuarios:
 *
 * - `lh3.googleusercontent.com` — avatares de Google OAuth.
 * - `avatars.githubusercontent.com` — avatares de GitHub OAuth.
 *
 * Ambos se limitan al protocolo `https` por seguridad.
 * Si se añaden nuevos proveedores OAuth en el futuro, agregar su hostname aquí.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
