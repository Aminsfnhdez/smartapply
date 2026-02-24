'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    if (!confirm(t('confirmDelete'))) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Optimistic update: remove from local state
        setCvs(prev => prev.filter(cv => cv.id !== id));
        // Refresh server components to update stats (Total, Average Score)
        router.refresh();
      } else {
        alert(t('deleteError'));
      }
    } catch (error) {
      console.error(error);
      alert(t('deleteError'));
    } finally {
      setIsDeleting(null);
    }
  };

  if (cvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-16 text-center">
        <div className="mb-4 rounded-full bg-slate-50 p-4">
          <FilePlus className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-bold">{t("noRecentCvs")}</p>
        <Link href="/generate" className="mt-4">
          <Button variant="outline" size="sm" className="font-bold">
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
