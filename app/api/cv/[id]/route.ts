import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cv/[id]
 * Obtener detalles de un CV específico
 */
export const GET = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const cv = await prisma.cV.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 });
    }

    return NextResponse.json(cv, { status: 200 });

  } catch (error) {
    console.error('[GET /api/cv/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener el CV' }, { status: 500 });
  }
};

/**
 * DELETE /api/cv/[id]
 * Eliminar un CV y sus archivos asociados en Storage
 */
export const DELETE = async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // 1. Verificar existencia y pertenencia
    const cv = await prisma.cV.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 });
    }

    // 2. Eliminar de la base de datos
    await prisma.cV.delete({
      where: { id: params.id },
    });

    // 3. Intentar eliminar archivos en Supabase Storage (opcional, no bloqueante)
    try {
      if (!session.user?.id) throw new Error('Usuario no autenticado');
      
      // Listamos los archivos que empiezan con el ID del CV para ese usuario
      const { data: files } = await supabaseAdmin.storage
        .from('cvs')
        .list(session.user.id, { search: cv.id });

      if (files && files.length > 0 && session.user?.id) {
        const filesToRemove = files.map(f => `${session.user!.id}/${f.name}`);
        await supabaseAdmin.storage.from('cvs').remove(filesToRemove);
      }
    } catch (storageError) {
      console.warn('[DELETE /api/cv/[id]] Error al limpiar storage:', storageError);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('[DELETE /api/cv/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar el CV' }, { status: 500 });
  }
};
