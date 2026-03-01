import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cv/[id]
 *
 * Retorna el detalle completo de un CV específico del usuario autenticado.
 *
 * Verifica que el CV exista y pertenezca al usuario de la sesión activa
 * usando el filtro combinado `{ id, userId }`, evitando que un usuario
 * acceda a CVs de otros usuarios aunque conozca el ID.
 *
 * @param params.id - ID del CV a consultar (cuid).
 * @returns 200 con el objeto CV completo de Prisma.
 * @returns 401 si el usuario no está autenticado.
 * @returns 404 si el CV no existe o no pertenece al usuario.
 * @returns 500 en caso de error inesperado de base de datos.
 *
 * @example
 * const res = await fetch('/api/cv/clxyz123');
 * const cv = await res.json();
 */
export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const cv = await prisma.cV.findUnique({
      where: { id, userId: session.user.id },
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
 *
 * Elimina un CV del usuario autenticado y sus archivos PDF asociados en Storage.
 *
 * Flujo:
 * 1. Verifica sesión activa.
 * 2. Busca el CV en la DB verificando que pertenezca al usuario (previene IDOR).
 * 3. Elimina el registro de la DB con `prisma.cV.delete`.
 * 4. Intenta eliminar los archivos PDF del bucket `cvs` en Supabase Storage.
 *    Lista los archivos de la carpeta del usuario que coincidan con el ID del CV
 *    y los elimina. Este paso es no-bloqueante: si falla (ej. el PDF nunca
 *    fue generado), se registra una advertencia pero la respuesta sigue siendo 200.
 *
 * La eliminación en Storage es best-effort para evitar que errores de limpieza
 * de archivos bloqueen la eliminación del registro principal en la DB.
 *
 * @param params.id - ID del CV a eliminar (cuid).
 * @returns 200 con `{ success: true }` si el CV fue eliminado correctamente.
 * @returns 401 si el usuario no está autenticado.
 * @returns 404 si el CV no existe o no pertenece al usuario.
 * @returns 500 en caso de error inesperado de base de datos.
 *
 * @example
 * await fetch('/api/cv/clxyz123', { method: 'DELETE' });
 */
export const DELETE = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // 1. Verificar existencia y pertenencia
    const cv = await prisma.cV.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!cv) {
      return NextResponse.json({ error: 'CV no encontrado' }, { status: 404 });
    }

    // 2. Eliminar de la base de datos
    await prisma.cV.delete({
      where: { id },
    });

    // 3. Intentar eliminar archivos en Supabase Storage (no-bloqueante)
    try {
      if (!session.user?.id) throw new Error('Usuario no autenticado');

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
