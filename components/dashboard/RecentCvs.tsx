'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CvHistoryCard } from './CvHistoryCard';
import { FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface RecentCvsProps {
  initialCvs: Array<{
    id: string;
    jobDescription: string;
    createdAt: Date;
    generatedContent: any;
    atsScore: number;
  }>;
}

export const RecentCvs = ({ initialCvs }: RecentCvsProps) => {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [cvs, setCvs] = useState(initialCvs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    // Mantengo confirm por ahora ya que el usuario pidió específicamente reemplazar alert() y notificaciones inline, 
    // pero confirm() es una acción de interrupción. Si desea reemplazarlo por un diálogo custom sería parte de otra mejora.
    // Sin embargo, por consistencia usaré toast para el feedback.
    if (!confirm(t('confirmDelete'))) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(t('success_delete'));
        // Optimistic update: remove from local state
        setCvs(prev => prev.filter(cv => cv.id !== id));
        // Refresh server components to update stats (Total, Average Score)
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
          <Button variant="default" className="font-bold px-8">
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
