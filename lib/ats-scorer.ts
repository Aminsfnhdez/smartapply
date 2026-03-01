/**
 * Normaliza un texto para comparación de keywords.
 *
 * Aplica las siguientes transformaciones en orden:
 * 1. Convierte a minúsculas.
 * 2. Descompone caracteres Unicode (NFD) para separar letras de sus diacríticos.
 * 3. Elimina acentos y tildes (rango Unicode U+0300–U+036F).
 * 4. Reemplaza puntuación por espacios.
 * 5. Normaliza espacios múltiples en uno solo.
 * 6. Elimina espacios al inicio y al final.
 *
 * @param text - Texto a normalizar.
 * @returns Texto normalizado sin acentos, en minúsculas y sin puntuación.
 *
 * @example
 * normalizeText("Desarrollo Ágil – Scrum & Kanban");
 * // → "desarrollo agil scrum kanban"
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, ' ')        // Quitar puntuación
    .replace(/\s+/g, ' ')            // Normalizar espacios
    .trim();
};

/**
 * Lista de stopwords a ignorar durante la extracción de keywords.
 *
 * Incluye palabras vacías en español e inglés: artículos, preposiciones,
 * conjunciones, pronombres y verbos auxiliares comunes. Estas palabras
 * no aportan valor semántico para la comparación de CVs con vacantes.
 */
const STOPWORDS = new Set([
  // ES
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'e', 'o', 'u', 'pero', 'mas', 'sino',
  'de', 'a', 'en', 'con', 'por', 'para', 'si', 'no', 'mi', 'tu', 'su', 'este', 'esta', 'estos', 'estas',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'que', 'como', 'cuando', 'donde', 'quien', 'cual', 'cuanto',
  'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ver', 'ir', 'dar', 'saber', 'querer', 'llegar',
  // EN
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'with', 'by', 'at', 'from', 'to', 'in',
  'on', 'of', 'up', 'down', 'out', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'shall', 'should', 'would', 'can', 'could', 'may', 'might', 'must', 'i',
  'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that',
  'these', 'those', 'who', 'whom', 'whose', 'which', 'what', 'where', 'when', 'why', 'how'
]);

/**
 * Extrae keywords relevantes de un texto.
 *
 * Proceso:
 * 1. Normaliza el texto con `normalizeText()`.
 * 2. Divide en palabras individuales.
 * 3. Filtra palabras de menos de 3 caracteres (muy cortas para ser relevantes).
 * 4. Filtra stopwords en español e inglés.
 * 5. Elimina duplicados con `Set`.
 *
 * Se usa para calcular la intersección entre keywords del CV generado
 * y keywords de la descripción de la vacante en el scoring ATS.
 *
 * @param text - Texto del que extraer keywords (CV o descripción de vacante).
 * @returns Array de keywords únicas, normalizadas y sin stopwords.
 *
 * @example
 * extractKeywords("Experiencia con React, TypeScript y gestión de proyectos ágiles");
 * // → ["experiencia", "react", "typescript", "gestion", "proyectos", "agiles"]
 */
export const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');

  const keywords = words.filter(word =>
    word.length > 2 && !STOPWORDS.has(word)
  );

  return Array.from(new Set(keywords));
};
