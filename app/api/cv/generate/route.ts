import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { callClaude, CV_SYSTEM_PROMPT, ATS_SYSTEM_PROMPT, cleanJson } from '@/lib/anthropic';
import type { GeneratedCvContent, AtsScoreResponse } from '@/types/cv';

/**
 * Esquema de validación Zod para el body del POST /api/cv/generate.
 *
 * - `jobDescription`: descripción completa de la vacante (50–5000 caracteres).
 * - `template`: plantilla de CV seleccionada por el usuario.
 * - `language`: idioma en que se generará el contenido del CV (por defecto 'es').
 */
const generateSchema = z.object({
  jobDescription: z.string().min(50).max(5000),
  template: z.enum(['classic', 'modern', 'minimalist']),
  language: z.enum(['es', 'en']).default('es'),
});

/**
 * Genera una clave de caché determinista para un par perfil + vacante.
 *
 * Usa SHA-256 sobre la concatenación de `profileId` y `jobDescription`
 * para producir un hash único de 64 caracteres hexadecimales.
 *
 * Si el hash ya existe en la DB para ese usuario, se retorna el CV
 * guardado sin llamar a Claude API, ahorrando tiempo y costo de API.
 *
 * @param profileId - ID del perfil del usuario en Prisma.
 * @param jobDescription - Texto completo de la descripción de la vacante.
 * @returns Hash SHA-256 de 64 caracteres en hexadecimal.
 *
 * @example
 * const key = generateCacheKey('clxyz123', 'We are looking for a senior...');
 * // → 'a3f9c2...' (64 chars)
 */
export const generateCacheKey = (profileId: string, jobDescription: string): string => {
  return createHash('sha256')
    .update(`${profileId}::${jobDescription}`)
    .digest('hex');
};

/**
 * POST /api/cv/generate
 *
 * Genera un CV adaptado a la vacante usando Claude API y lo guarda en la DB.
 *
 * Flujo completo:
 * 1. Verifica que el usuario tenga sesión activa.
 * 2. Valida el body con Zod.
 * 3. Carga el perfil del usuario desde la DB (requerido).
 * 4. Calcula el hash SHA-256 del par (profileId + jobDescription).
 * 5. Busca en caché: si existe un CV con ese hash para ese usuario, lo retorna
 *    inmediatamente con `fromCache: true` sin llamar a Claude.
 * 6. Si no hay caché, llama a Claude con `CV_SYSTEM_PROMPT` para generar el CV.
 * 7. Aplica `cleanJson()` y parsea el JSON retornado por Claude.
 * 8. Realiza una segunda llamada a Claude con `ATS_SYSTEM_PROMPT` para calcular
 *    el score ATS (0–100). Si esta llamada falla, no bloquea la generación.
 * 9. Guarda el CV generado, el score y la clave de caché en la DB.
 * 10. Retorna el contenido del CV, su ID y si vino de caché.
 *
 * El campo `template` y `language` se reciben en el body pero el template
 * se guarda en la DB para uso posterior en la exportación PDF. El language
 * se pasa a Claude como `outputLanguage` en el userMessage.
 *
 * @returns 200 con `{ cv, cvId, fromCache }`.
 * @returns 400 si el body es inválido o si el usuario no tiene perfil.
 * @returns 401 si el usuario no está autenticado.
 * @returns 500 si Claude retorna un formato inválido o hay error inesperado.
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
      // El scoring ATS no bloquea la generación del CV
      console.warn('[POST /api/cv/generate] No se pudo obtener el score ATS:', scoreError);
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
