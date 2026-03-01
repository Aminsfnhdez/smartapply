import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { callClaude, ATS_SYSTEM_PROMPT, cleanJson } from '@/lib/anthropic';
import type { AtsScoreResponse } from '@/types/cv';

/**
 * Esquema de validación Zod para el body del POST /api/cv/score.
 *
 * - `cvContent`: objeto JSON con el contenido del CV generado (GeneratedCvContent).
 * - `jobDescription`: descripción de la vacante a comparar (50–5000 caracteres).
 */
const scoreSchema = z.object({
  cvContent: z.any(),
  jobDescription: z.string().min(50).max(5000),
});

/**
 * POST /api/cv/score
 *
 * Calcula el score de compatibilidad ATS entre un CV y una descripción de vacante.
 *
 * Delega el análisis a Claude API usando `ATS_SYSTEM_PROMPT`. Claude evalúa:
 * - Densidad y relevancia de keywords coincidentes.
 * - Estructura y legibilidad del CV.
 * - Brecha entre las keywords del CV y las requeridas por la vacante.
 *
 * Si el score resultante es menor a 80, Claude incluye al menos 3 sugerencias
 * concretas de mejora en la respuesta.
 *
 * Este endpoint se llama de forma independiente cuando el usuario quiere
 * re-evaluar un CV editado manualmente. La generación inicial del CV
 * (`/api/cv/generate`) calcula y guarda el score automáticamente sin
 * necesidad de llamar a este endpoint.
 *
 * Aplica `cleanJson()` antes de `JSON.parse()` para manejar el caso en que
 * Claude envuelva la respuesta en bloques markdown.
 *
 * @returns 200 con `AtsScoreResponse`: `{ score, foundKeywords, missingKeywords, suggestions }`.
 * @returns 400 si el body no pasa la validación de Zod.
 * @returns 401 si el usuario no está autenticado.
 * @returns 500 si Claude retorna un formato inválido o hay error inesperado.
 *
 * @example
 * const res = await fetch('/api/cv/score', {
 *   method: 'POST',
 *   body: JSON.stringify({ cvContent: generatedCv, jobDescription: '...' }),
 * });
 * const { score, suggestions } = await res.json();
 */
export const POST = async (req: NextRequest) => {
  // 1. Verificar sesión
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // 2. Validar body
  try {
    const body = await req.json();
    const parsed = scoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { cvContent, jobDescription } = parsed.data;

    // 3. Llamar a Claude API para scoring
    const userMessage = `
      CV del Candidato (JSON):
      ${JSON.stringify(cvContent)}

      Descripción de la vacante:
      ${jobDescription}

      Analiza la compatibilidad (0-100), extrae las keywords coincidentes, las faltantes y proporciona sugerencias concretas.
      Responde únicamente con un JSON que siga la estructura AtsScoreResponse.
    `;

    const result = await callClaude({
      systemPrompt: ATS_SYSTEM_PROMPT,
      userMessage,
      maxTokens: 1024,
    });

    let atsResponse: AtsScoreResponse;
    try {
      atsResponse = JSON.parse(cleanJson(result));
    } catch {
      console.error('[POST /api/cv/score] Error al parsear JSON de Claude:', result);
      return NextResponse.json(
        { error: 'Error al analizar el score ATS. Intente nuevamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json(atsResponse, { status: 200 });

  } catch (error) {
    console.error('[POST /api/cv/score]', error);
    return NextResponse.json(
      { error: 'Error inesperado al calcular el score ATS' },
      { status: 500 }
    );
  }
};
