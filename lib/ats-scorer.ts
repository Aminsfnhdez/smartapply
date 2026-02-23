/**
 * Normaliza un texto para comparación de keywords (quita tildes, convierte a minúsculas, quita puntuación)
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s]/g, ' ') // Quitar puntuación
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
};

/**
 * Lista de stopwords básicas en español e inglés
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
 * Extrae keywords relevantes de un texto
 */
export const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  
  const keywords = words.filter(word => 
    word.length > 2 && !STOPWORDS.has(word)
  );

  return Array.from(new Set(keywords));
};
