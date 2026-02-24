"use client";

import { useState } from "react";
import { CvHistoryCard } from "@/components/dashboard/CvHistoryCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface HistoryClientProps {
  initialCvs: any[];
}

export const HistoryClient = ({ initialCvs }: HistoryClientProps) => {
  const [cvs, setCvs] = useState(initialCvs);
  const t = useTranslations("history");

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const res = await fetch(`/api/cv/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("success_delete"));
        setCvs(cvs.filter((cv) => cv.id !== id));
      } else {
        toast.error(t("deleteError"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("deleteError"));
    }
  };

  if (cvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-20 text-center">
        <div className="mb-4 text-gray-300">
           <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
        </div>
        <p className="text-gray-500 font-medium">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cvs.map((cv) => (
        <CvHistoryCard key={cv.id} cv={cv} onDelete={handleDelete} />
      ))}
    </div>
  );
};
