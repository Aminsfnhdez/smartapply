"use client";

import { useState } from "react";
import { CvHistoryCard } from "@/components/dashboard/CvHistoryCard";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Ghost } from "lucide-react";

interface HistoryClientProps {
  initialCvs: any[];
}

export const HistoryClient = ({ initialCvs }: HistoryClientProps) => {
  const [cvs, setCvs] = useState(initialCvs);
  const t = useTranslations("history");

  const handleDelete = async (id: string) => {
    toast(t("confirmDelete"), {
      action: {
        label: t("confirmDeleteAction"),
        onClick: async () => {
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
        },
      },
      duration: 5000,
    });
  };

  if (cvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-24 text-center">
        <div className="mb-6 rounded-full bg-gray-50 p-6">
           <Ghost className="h-12 w-12 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{t("noHistory")}</h3>
        <p className="mt-2 text-gray-500 max-w-xs mx-auto">{t("empty")}</p>
        <Link href="/generate" className="mt-8">
          <Button className="font-bold px-8">
            {t("generateFirst")}
          </Button>
        </Link>
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
