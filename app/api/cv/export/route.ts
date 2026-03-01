import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePdfBuffer, TemplateType } from '@/lib/pdf-generator';
import type { GeneratedCvContent } from '@/types/cv';

/**
 * POST /api/cv/export
 *
 * Genera el PDF de un CV guardado y retorna una URL firmada para su descarga.
 *
 * Flujo:
 * 1. Verifica que el usuario tenga sesión activa.
 * 2. Valida que `cvId` y `template` estén presentes en el body.
 * 3. Busca el CV en la DB verificando que pertenezca al usuario autenticado.
 * 4. Genera el PDF en el servidor con `generatePdfBuffer()` usando la plantilla indicada.
 * 5. Sube el PDF a Supabase Storage en el bucket privado `cvs`,
 *    bajo la ruta `{userId}/{cvId}_{template}.pdf`. Usa `upsert: true`
 *    para sobrescribir si ya existe una versión previa del mismo CV y plantilla.
 * 6. Genera una URL firmada con validez de 1 hora para descarga directa.
 * 7. Retorna la URL firmada al cliente.
 *
 * Consideraciones:
 * - La generación del PDF ocurre SIEMPRE en el servidor. No se usa PDFViewer
 *   ni ningún componente de `@react-pdf/renderer` en el cliente para evitar
 *   el error `su is not a function` con Turbopack/Next.js 16.
 * - El bucket `cvs` es privado: solo se puede acceder mediante URLs firmadas
 *   generadas con `supabaseAdmin` (service role). El usuario nunca accede
 *   directamente al storage.
 * - La URL firmada vence en 3600 segundos (1 hora). Si el usuario necesita
 *   descargar nuevamente después de ese tiempo, debe llamar a este endpoint otra vez.
 * - La plantilla puede diferir de la guardada originalmente en la DB, permitiendo
 *   exportar el mismo CV en múltiples formatos sin regenerar el contenido.
 *
 * @returns 200 con `{ url: string }` — URL firmada de Supabase Storage.
 * @returns 400 si faltan `cvId` o `template` en el body.
 * @returns 401 si el usuario no está autenticado.
 * @returns 404 si el CV no existe o no pertenece al usuario.
 * @returns 500 si falla la generación del PDF, la subida a Storage o la firma de la URL.
 *
 * @example
 * const res = await fetch('/api/cv/export', {
 *   method: 'POST',
 *   body: JSON.stringify({ cvId: 'clxyz123', template: 'modern' }),
 * });
 * const { url } = await res.json();
 * window.open(url); // Descarga directa
 */
export const POST = async (req: NextRequest) => {
  // 1. Verificar sesión
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { cvId, template } = await req.json();

    if (!cvId || !template) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // 2. Obtener CV de la base de datos (verificando pertenencia al usuario)
    const cv = await prisma.cV.findUnique({
      where: { id: cvId, userId: session.user.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 });
    }

    // 3. Generar PDF en el servidor
    const pdfBuffer = await generatePdfBuffer(
      cv.generatedContent as unknown as GeneratedCvContent,
      template as TemplateType
    );

    // 4. Subir a Supabase Storage (bucket privado 'cvs')
    const fileName = `${session.user.id}/${cv.id}_${template}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('cvs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[POST /api/cv/export] Error al subir a Supabase:', uploadError);
      return NextResponse.json({ error: 'Error al guardar el archivo PDF' }, { status: 500 });
    }

    // 5. Generar URL firmada con validez de 1 hora
    const { data: signedUrlData, error: signedError } = await supabaseAdmin.storage
      .from('cvs')
      .createSignedUrl(fileName, 3600);

    if (signedError) {
      console.error('[POST /api/cv/export] Error al firmar URL:', signedError);
      return NextResponse.json({ error: 'Error al generar link de descarga' }, { status: 500 });
    }

    return NextResponse.json({ url: signedUrlData.signedUrl }, { status: 200 });

  } catch (error) {
    console.error('[POST /api/cv/export]', error);
    return NextResponse.json(
      { error: 'Error inesperado al exportar el PDF' },
      { status: 500 }
    );
  }
};
