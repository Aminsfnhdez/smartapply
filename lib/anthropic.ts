import Anthropic from '@anthropic-ai/sdk';
import { env } from './env';

// Cliente singleton
export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

// Modelo a usar en todo el proyecto
export const CLAUDE_MODEL = 'claude-sonnet-4-6';

// Prompt del sistema para adaptación de CV
export const CV_SYSTEM_PROMPT = `
Eres un experto en redacción de CVs profesionales y optimización ATS (Applicant Tracking System).
Tu tarea es adaptar el CV del usuario a la oferta de empleo indicada.

Reglas estrictas:
- NUNCA inventes ni alteres información verídica del usuario.
- Prioriza y reformula la experiencia más relevante para el puesto.
- Integra de forma natural las keywords clave de la vacante en el texto.
- La estructura debe seguir este orden: Resumen, Experiencia, Educación, Habilidades.
- Usa fechas en formato consistente: "Ene 2022 – Mar 2024".
- Evita tablas, columnas múltiples, íconos o gráficos decorativos.
- El resultado debe ser texto limpio y seleccionable, compatible con parsers ATS.
- Responde siempre en el mismo idioma de la descripción de la vacante.
- Devuelve la respuesta únicamente en formato JSON válido, sin texto adicional.
`;

// Prompt del sistema para puntuación ATS
export const ATS_SYSTEM_PROMPT = `
Eres un analizador de compatibilidad ATS. Tu tarea es comparar un CV con una descripción de vacante
y retornar una puntuación de 0 a 100 junto con sugerencias de mejora.

Reglas:
- Analiza la densidad y relevancia de keywords coincidentes.
- Evalúa la estructura y legibilidad del CV.
- Si el score es menor a 80, incluye al menos 3 sugerencias concretas de mejora.
- Devuelve únicamente JSON válido con la estructura indicada, sin texto adicional.
`;

interface CallClaudeOptions {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}

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
 * Limpia la respuesta de Claude eliminando bloques de código markdown
 * para asegurar que JSON.parse() funcione correctamente.
 */
export const cleanJson = (raw: string): string => {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
};
