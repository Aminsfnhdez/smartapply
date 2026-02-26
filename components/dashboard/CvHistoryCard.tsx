"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Trash2, FileText } from "lucide-react";

interface CvHistoryCardProps {
  cv: {
    id: string;
    jobDescription: string;
    createdAt: Date;
    generatedContent: any;
  };
  onDelete: (id: string) => void;
}

const CvHistoryCard = ({ cv, onDelete }: CvHistoryCardProps) => {
  const t = useTranslations("history");
  const [isExporting, setIsExporting] = useState(false);

  // Intentar extraer el cargo de la descripción o del contenido generado
  const jobTitle = cv.generatedContent?.experience?.[0]?.position || "CV Personalizado";
  const date = new Date(cv.createdAt).toLocaleDateString();

  const handleDownload = async (template: 'classic' | 'modern' | 'minimalist') => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/cv/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: cv.id, template }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        toast.error(t("downloadError"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("downloadError"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {jobTitle}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
              {date}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(cv.id)}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
          title={t("delete")}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Button
          variant="secondary"
          className="text-xs py-2"
          onClick={() => handleDownload('classic')}
          disabled={isExporting}
        >
          {t("classic")}
        </Button>
        <Button
          variant="secondary"
          className="text-xs py-2"
          onClick={() => handleDownload('modern')}
          disabled={isExporting}
        >
          {t("modern")}
        </Button>
        <Button
          variant="secondary"
          className="text-xs py-2"
          onClick={() => handleDownload('minimalist')}
          disabled={isExporting}
        >
          {t("minimalist")}
        </Button>
      </div>
    </div>
  );
};

export { CvHistoryCard };
