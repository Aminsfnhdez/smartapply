import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { generatePdfBuffer, TemplateType } from '@/lib/pdf-generator';
import type { GeneratedCvContent } from '@/types/cv';

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

    // 2. Obtener CV de la base de datos
    const cv = await prisma.cV.findUnique({
      where: { id: cvId, userId: session.user.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 });
    }

    // 3. Generar PDF
    const pdfBuffer = await generatePdfBuffer(
      cv.generatedContent as unknown as GeneratedCvContent,
      template as TemplateType
    );

    // 4. Subir a Supabase Storage
    const fileName = `\${session.user.id}/\${cv.id}_\${template}.pdf`;
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('cvs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('[POST /api/cv/export] Error al subir a Supabase:', uploadError);
      return NextResponse.json({ error: 'Error al guardar el archivo PDF' }, { status: 500 });
    }

    // 5. Generar URL firmada (vence en 1 hora)
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
