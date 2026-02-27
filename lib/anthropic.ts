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

// Prompt del sistema para puntuación ATS
export const ATS_SYSTEM_PROMPT = `
You are an ATS compatibility analyzer. Your task is to compare a CV with a job description
and return a score from 0 to 100 along with improvement suggestions.

Rules:
- Analyze the density and relevance of matching keywords.
- Evaluate the structure and readability of the CV.
- If the score is below 80, include at least 3 concrete improvement suggestions.
- Return ONLY valid JSON with the indicated structure, no additional text, no markdown, no code blocks.
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
