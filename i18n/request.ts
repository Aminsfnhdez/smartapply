import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '../lib/locale';
 
export default getRequestConfig(async () => {
  // Obtenemos el locale persistido en la cookie o 'es' por defecto
  const locale = await getUserLocale();
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
