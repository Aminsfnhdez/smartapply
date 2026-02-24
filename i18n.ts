import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async () => {
  // En una configuración sin prefijo de [locale], el locale suele ser fijo
  // o detectado por una cookie que el middleware maneja.
  const locale = 'es';
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
