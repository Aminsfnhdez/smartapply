/**
 * Contenido de un CV generado por Claude API.
 *
 * Representa la estructura JSON que Claude retorna tras adaptar el perfil
 * del usuario a una vacante específica. Esta misma estructura se guarda en
 * la columna `generatedContent` (Json) del modelo CV en Prisma, y es consumida
 * por las plantillas de CV para renderizar tanto el preview HTML como el PDF.
 *
 * Todos los campos de `personalInfo` son opcionales porque Claude los toma
 * del perfil del usuario, que puede estar incompleto. El resto de las secciones
 * son requeridas para garantizar un CV estructurado y compatible con ATS.
 *
 * Formato de fechas esperado: `"Jan 2022"`, `"Mar 2024"` o `"Present"`.
 *
 * @see CV_SYSTEM_PROMPT en lib/anthropic.ts — instrucciones que definen esta estructura
 * @see CvTemplateProps en types/cv-template.ts — consumo en plantillas
 * @see lib/pdf-generator.ts — uso en generación de PDF
 */
export interface GeneratedCvContent {
  /** Datos personales de contacto del candidato. */
  personalInfo?: {
    fullName?: string;
    jobTitle?: string;
    phone?: string;
    email?: string;
    city?: string;
    /** URL del perfil de LinkedIn. */
    linkedin?: string;
    /** URL del portfolio o sitio web personal. */
    portfolio?: string;
  };
  /** Resumen o perfil profesional adaptado a la vacante. */
  summary: string;
  /** Historial de experiencia laboral, del más reciente al más antiguo. */
  experience: Array<{
    company: string;
    position: string;
    /** Fecha de inicio en formato "Mmm YYYY" (ej: "Jan 2022"). */
    startDate: string;
    /** Fecha de fin en formato "Mmm YYYY" o "Present". */
    endDate: string;
    /** Descripción de responsabilidades y logros, optimizada con keywords ATS. */
    description: string;
  }>;
  /** Formación académica, de la más reciente a la más antigua. */
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  /** Habilidades técnicas (hard skills) relevantes para la vacante. */
  technicalSkills: string[];
  /** Habilidades blandas (soft skills) relevantes para la vacante. */
  softSkills: string[];
  /** Cursos, bootcamps y formación complementaria (opcional). */
  complementaryEducation?: Array<{
    institution: string;
    program: string;
    /** Año de finalización o realización (ej: "2023"). */
    year: string;
  }>;
  /** Idiomas del candidato con su nivel de dominio. */
  languages: Array<{
    name: string;
    /** Nivel de dominio (ej: "Native", "C1", "Intermediate"). */
    level: string;
  }>;
  /** Certificaciones profesionales del candidato (opcional). */
  certifications?: string[];
}

/**
 * Respuesta del análisis de compatibilidad ATS retornada por Claude API.
 *
 * Se obtiene llamando a `callClaude` con `ATS_SYSTEM_PROMPT` y es el tipo
 * de respuesta tanto del endpoint `/api/cv/score` como del cálculo automático
 * dentro de `/api/cv/generate`.
 *
 * El score se guarda en la columna `atsScore` del modelo CV en Prisma y se
 * muestra en el componente `AtsScoreBar`.
 *
 * @see ATS_SYSTEM_PROMPT en lib/anthropic.ts
 * @see app/api/cv/score/route.ts
 * @see components/dashboard/AtsScoreBar.tsx
 */
export interface AtsScoreResponse {
  /** Puntuación de compatibilidad ATS de 0 a 100. */
  score: number;
  /** Keywords de la vacante encontradas en el CV generado. */
  matchedKeywords: string[];
  /** Keywords relevantes de la vacante ausentes en el CV. */
  missingKeywords: string[];
  /**
   * Sugerencias concretas de mejora.
   * Claude incluye al menos 3 cuando el score es menor a 80.
   */
  suggestions: string[];
}

/**
 * Body esperado por el endpoint POST /api/cv/generate.
 *
 * @see app/api/cv/generate/route.ts
 */
export interface CvGenerateRequest {
  /** Descripción completa de la vacante (50–5000 caracteres). */
  jobDescription: string;
  /** Plantilla de diseño a aplicar al CV exportado en PDF. */
  template: 'classic' | 'modern' | 'minimalist';
  /** Idioma en que se generará el contenido del CV. Por defecto 'es'. */
  language?: 'es' | 'en';
}
