import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { callClaude, CV_SYSTEM_PROMPT, ATS_SYSTEM_PROMPT, cleanJson } from '@/lib/anthropic';
import type { GeneratedCvContent, AtsScoreResponse } from '@/types/cv';

const generateSchema = z.object({
  jobDescription: z.string().min(50).max(5000),
  template: z.enum(['classic', 'modern', 'minimalist']),
  language: z.enum(['es', 'en']).default('es'),
});

export const generateCacheKey = (profileId: string, jobDescription: string): string => {
  return createHash('sha256')
    .update(`${profileId}::${jobDescription}`)
    .digest('hex');
};

export const POST = async (req: NextRequest) => {
  // 1. Verificar sesión
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // 2. Validar body
  try {
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { jobDescription, language } = parsed.data;

    // 3. Cargar perfil del usuario
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Debe completar su perfil antes de generar un CV' },
        { status: 400 }
      );
    }

    // 4. Verificar caché
    const cacheKey = generateCacheKey(profile.id, jobDescription);
    const cached = await prisma.cV.findFirst({
      where: { cacheKey, userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (cached) {
      return NextResponse.json({ cv: cached.generatedContent, cvId: cached.id, fromCache: true }, { status: 200 });
    }

    // 5. Llamar a Claude API
    const profileData = profile as Record<string, unknown>;
    const userMessage = `
      Descripción de la vacante:
      ${jobDescription}

      Datos personales del usuario (incluir SIEMPRE en personalInfo):
      - Nombre completo: ${profileData.fullName ?? 'No proporcionado'}
      - Cargo/Título profesional: ${profileData.jobTitle ?? 'No proporcionado'}
      - Teléfono: ${profileData.phone ?? 'No proporcionado'}
      - Email: ${profileData.email ?? 'No proporcionado'}
      - Ciudad: ${profileData.city ?? 'No proporcionado'}
      - LinkedIn: ${profileData.linkedin ?? ''}
      - Portfolio: ${profileData.portfolio ?? ''}

      Perfil profesional completo del usuario:
      ${JSON.stringify(profile)}

      outputLanguage: ${language}

      Devuelve el CV adaptado en formato JSON siguiendo exactamente la estructura indicada en el system prompt. Incluye personalInfo como primer campo.
    `;

    const result = await callClaude({
      systemPrompt: CV_SYSTEM_PROMPT,
      userMessage,
    });

    let generatedCv: GeneratedCvContent;
    try {
      generatedCv = JSON.parse(cleanJson(result));
    } catch {
      console.error('[POST /api/cv/generate] Error al parsear JSON de Claude:', result);
      return NextResponse.json(
        { error: 'La IA devolvió un formato inválido. Intente nuevamente.' },
        { status: 500 }
      );
    }

    // 6. Obtener score ATS real
    const scoreMessage = `
      CV del Candidato (JSON):
      ${JSON.stringify(generatedCv)}

      Descripción de la vacante:
      ${jobDescription}

      Analiza la compatibilidad (0-100) y devuelve únicamente el JSON con el score.
    `;

    let atsScore = 0;
    try {
      const scoreResult = await callClaude({
        systemPrompt: ATS_SYSTEM_PROMPT,
        userMessage: scoreMessage,
        maxTokens: 1024,
      });
      const parsedScore = JSON.parse(cleanJson(scoreResult)) as AtsScoreResponse;
      atsScore = parsedScore.score;
    } catch (scoreError) {
      console.warn('[POST /api/cv/generate] No se pudo obtener el score ATS:', scoreError);
      // No fallamos la generación completa por el score
    }

    // 7. Guardar en DB
    const savedCv = await prisma.cV.create({
      data: {
        userId: session.user.id,
        jobDescription,
        cacheKey,
        generatedContent: generatedCv as any,
        atsScore,
      },
    });

    return NextResponse.json({ cv: savedCv.generatedContent, cvId: savedCv.id, fromCache: false }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/cv/generate]', error);
    return NextResponse.json(
      { error: 'Error inesperado al generar el CV' },
      { status: 500 }
    );
  }
};
