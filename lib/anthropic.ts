import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

/**
 * Cliente singleton de la SDK de Anthropic.
 *
 * Inicializado con la API key validada desde `lib/env.ts`.
 * Se usa exclusivamente desde el servidor — nunca en componentes cliente.
 */
export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

/**
 * Modelo de Claude usado en todo el proyecto.
 *
 * Centralizado aquí para facilitar actualizaciones futuras de modelo
 * sin tener que buscar referencias en múltiples archivos.
 */
export const CLAUDE_MODEL = 'claude-sonnet-4-6';

/**
 * System prompt para la generación y adaptación de CVs.
 *
 * Instruye a Claude para actuar como especialista en redacción de CVs
 * y optimización ATS. Reglas clave que aplica:
 * - Nunca inventa ni altera información del usuario.
 * - Siempre incluye los datos personales tal como fueron proporcionados.
 * - Integra keywords de la vacante de forma natural en el texto.
 * - Separa habilidades en `technicalSkills` y `softSkills`.
 * - Usa fechas en formato consistente: "Jan 2022 – Mar 2024".
 * - Produce texto seleccionable y compatible con parsers ATS.
 * - Escribe el CV en el idioma indicado por el campo `outputLanguage`.
 * - Devuelve ÚNICAMENTE JSON válido, sin markdown ni texto adicional.
 *
 * La estructura JSON retornada es:
 * ```
 * {
 *   personalInfo, summary, experience, education,
 *   technicalSkills, softSkills, complementaryEducation, languages
 * }
 * ```
 */
export const CV_SYSTEM_PROMPT = `
You are an expert professional CV writer and ATS (Applicant Tracking System) optimization specialist.
Your task is to adapt the user's CV to the provided job offer.

Strict rules:
- NEVER invent or alter any truthful information provided by the user.
- ALWAYS include the user's personal data exactly as provided (fullName, jobTitle, phone, email, city, linkedin, portfolio). Never omit or modify them.
- Prioritize and reframe the most relevant experience for the position.
- Naturally integrate the key keywords from the vacancy into the text.
- Clearly separate skills into technicalSkills and softSkills.
- Use dates in consistent format: "Jan 2022 – Mar 2024".
- Avoid tables, multiple columns, icons or decorative graphics.
- The result must be clean, selectable text compatible with ATS parsers.
- IMPORTANT: Write the entire CV content in the language specified in the "outputLanguage" field of the user message. Ignore the language of the job description for this purpose.
- Return the response ONLY as valid JSON, with no additional text, no markdown, no code blocks.

Mandatory JSON structure:
{
  "personalInfo": { "fullName": "...", "jobTitle": "...", "phone": "...", "email": "...", "city": "...", "linkedin": "...", "portfolio": "..." },
  "summary": "...",
  "experience": [{ "company": "...", "position": "...", "startDate": "...", "endDate": "...", "description": "..." }],
  "education": [{ "institution": "...", "degree": "...", "startDate": "...", "endDate": "..." }],
  "technicalSkills": ["..."],
  "softSkills": ["..."],
  "complementaryEducation": [{ "institution": "...", "program": "...", "year": "..." }],
  "languages": [{ "name": "...", "level": "..." }]
}
`;

/**
 * System prompt para el análisis de compatibilidad ATS.
 *
 * Instruye a Claude para comparar un CV contra una descripción de vacante
 * y retornar un score de 0 a 100 junto con keywords y sugerencias.
 *
 * Si el score es menor a 80, Claude debe incluir al menos 3 sugerencias
 * concretas de mejora. Devuelve ÚNICAMENTE JSON válido.
 */
export const ATS_SYSTEM_PROMPT = `
You are an ATS compatibility analyzer. Your task is to compare a CV with a job description
and return a score from 0 to 100 along with improvement suggestions.

Rules:
- Analyze the density and relevance of matching keywords.
- Evaluate the structure and readability of the CV.
- If the score is below 80, include at least 3 concrete improvement suggestions.
- Return ONLY valid JSON with the indicated structure, no additional text, no markdown, no code blocks.
`;

/**
 * Opciones de configuración para una llamada a la Claude API.
 */
interface CallClaudeOptions {
  /** System prompt que define el rol y las instrucciones de Claude. */
  systemPrompt: string;
  /** Mensaje del usuario con los datos específicos de la solicitud. */
  userMessage: string;
  /** Número máximo de tokens en la respuesta. Por defecto: 4096. */
  maxTokens?: number;
}

/**
 * Realiza una llamada a la Claude API con reintentos automáticos.
 *
 * Implementa un mecanismo de reintento con backoff lineal (1s, 2s) para
 * manejar errores transitorios de la API. Máximo 2 intentos.
 *
 * @param options - Configuración de la llamada (systemPrompt, userMessage, maxTokens).
 * @returns El texto de la respuesta de Claude.
 * @throws Error si la API falla en todos los intentos o retorna un tipo inesperado.
 *
 * @example
 * const result = await callClaude({
 *   systemPrompt: CV_SYSTEM_PROMPT,
 *   userMessage: `Vacante: ${jobDescription}\nPerfil: ${JSON.stringify(profile)}`,
 * });
 */
export const callClaude = async ({
  systemPrompt,
  userMessage,
  maxTokens = 4096,
}: CallClaudeOptions): Promise<string> => {
  const MAX_RETRIES = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Respuesta inesperada de Claude API');

      return content.text;
    } catch (error) {
      lastError = error as Error;
      console.error(`[Claude API] Intento ${attempt} fallido:`, error);

      // Esperar antes del siguiente intento (backoff simple)
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new Error(`Claude API falló después de ${MAX_RETRIES} intentos: ${lastError?.message}`);
};

/**
 * Limpia la respuesta de Claude eliminando bloques de código markdown.
 *
 * Claude ocasionalmente envuelve las respuestas JSON en bloques markdown
 * (` ```json ... ``` `), lo que rompe `JSON.parse()`. Esta función elimina
 * esos delimitadores antes de parsear.
 *
 * Debe aplicarse a TODA respuesta de Claude antes de llamar a `JSON.parse()`.
 *
 * @param raw - Texto crudo retornado por Claude.
 * @returns Texto limpio listo para `JSON.parse()`.
 *
 * @example
 * const result = await callClaude({ ... });
 * const parsed = JSON.parse(cleanJson(result));
 */
export const cleanJson = (raw: string): string => {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
};
