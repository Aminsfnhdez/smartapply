import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { callClaude, ATS_SYSTEM_PROMPT, cleanJson } from '@/lib/anthropic';
import type { AtsScoreResponse } from '@/types/cv';

const scoreSchema = z.object({
  cvContent: z.any(), // GeneratedCvContent
  jobDescription: z.string().min(50).max(5000),
});

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
      maxTokens: 1024, // Increased tokens to avoid truncating json
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
