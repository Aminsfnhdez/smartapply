'use server';

import { cookies } from 'next/headers';

/**
 * Establece el locale del usuario en una cookie persistente.
 * No requiere prefijo en la URL.
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
 * Obtiene el locale actual desde la cookie o el valor por defecto.
 */
export async function getUserLocale() {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value || 'es';
}
