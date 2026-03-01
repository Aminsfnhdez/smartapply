'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CvHistoryCard } from './CvHistoryCard';
import { FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * Props del componente RecentCvs.
 */
interface RecentCvsProps {
  /**
   * Lista inicial de CVs recientes del usuario, obtenida en el servidor
   * desde `dashboard/page.tsx`. Se muestra un máximo de 2 CVs.
   */
  initialCvs: Array<{
    id: string;
    jobDescription: string;
    createdAt: Date;
    generatedContent: any;
    atsScore: number;
  }>;
}

/**
 * Sección de CVs recientes en el dashboard con eliminación reactiva.
 *
 * Client Component — mantiene estado local de la lista de CVs para
 * reflejar eliminaciones sin recargar la página completa.
 *
 * Recibe los CVs iniciales como prop desde el Server Component padre
 * (patrón de hidratación: server fetch → client state).
 *
 * Responsabilidades:
 * - Muestra hasta 2 CVs recientes usando `CvHistoryCard`.
 * - Gestiona la eliminación con confirmación via Sonner toast action:
 *   - Muestra un toast con botón de confirmación (duración 5s).
 *   - Si el usuario confirma, llama a `DELETE /api/cv/[id]`.
 *   - En éxito: filtra el CV del estado local y llama a `router.refresh()`
 *     para actualizar las métricas del dashboard (DashboardStats).
 *   - En error: toast de error.
 * - Mientras un CV está siendo eliminado, aplica `opacity-50 pointer-events-none`
 *   para indicar el estado de carga sin deshabilitar otros CVs.
 * - Estado vacío: si no hay CVs, muestra un empty state con CTA a `/generate`.
 *
 * @see components/dashboard/CvHistoryCard.tsx — tarjeta individual de CV
 * @see app/(dashboard)/dashboard/page.tsx — Server Component que provee initialCvs
 * @see app/api/cv/[id]/route.ts — DELETE endpoint
 *
 * @example
 * <RecentCvs initialCvs={recentCvs} />
 */
export const RecentCvs = ({ initialCvs }: RecentCvsProps) => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [cvs, setCvs] = useState(initialCvs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  /**
   * Muestra un toast de confirmación antes de eliminar el CV.
   * La eliminación real ocurre solo si el usuario hace clic en el botón de confirmación.
   */
  const handleDelete = async (id: string) => {
    toast(t('confirmDelete'), {
      action: {
        label: t('confirmDeleteAction'),
        onClick: async () => {
          setIsDeleting(id);
          try {
            const res = await fetch(`/api/cv/${id}`, {
              method: 'DELETE',
            });

            if (res.ok) {
              toast.success(t('success_delete'));
              setCvs(prev => prev.filter(cv => cv.id !== id));
              router.refresh();
            } else {
              toast.error(t('deleteError'));
            }
          } catch (error) {
            console.error(error);
            toast.error(t('deleteError'));
          } finally {
            setIsDeleting(null);
          }
        },
      },
      duration: 5000,
    });
  };

  if (cvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-20 text-center">
        <div className="mb-6 rounded-full bg-slate-50 p-6">
          <FilePlus className="h-10 w-10 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{t("noRecentActivity")}</h3>
        <p className="mt-2 text-gray-500 max-w-xs mx-auto">{t("noRecentCvs")}</p>
        <Link href="/generate" className="mt-8">
          <Button variant="primary" className="font-bold px-8">
            {t("generateFirst")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {cvs.slice(0, 2).map((cv) => (
        <div key={cv.id} className={isDeleting === cv.id ? 'opacity-50 pointer-events-none' : ''}>
          <CvHistoryCard cv={cv} onDelete={handleDelete} />
        </div>
      ))}
    </div>
  );
};
