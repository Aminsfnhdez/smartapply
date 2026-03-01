"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Trash2, FileText } from "lucide-react";

/**
 * Props del componente CvHistoryCard.
 */
interface CvHistoryCardProps {
  cv: {
    id: string;
    jobDescription: string;
    createdAt: Date;
    generatedContent: any;
  };
  /**
   * Callback ejecutado cuando el usuario confirma la eliminación del CV.
   * El padre (`RecentCvs` o `history/page.tsx`) se encarga de actualizar
   * su estado local para reflejar la eliminación sin recargar la página.
   */
  onDelete: (id: string) => void;
}

/**
 * Tarjeta de CV en el historial del usuario.
 *
 * Client Component — usa estado local para manejar la carga de exportación
 * y se comunica con el padre mediante el callback `onDelete`.
 *
 * Muestra:
 * - Ícono, título del puesto (extraído del primer item de experience) y fecha.
 * - Botón de eliminación que delega la lógica al componente padre.
 * - Tres botones de descarga (uno por plantilla: Classic, Modern, Minimalist)
 *   que llaman a `POST /api/cv/export` y abren la URL firmada en nueva pestaña.
 *
 * El título del puesto se extrae de `generatedContent.experience[0].position`
 * como aproximación al nombre del CV. Si no existe, muestra "CV Personalizado".
 *
 * La fecha se formatea como `DD/MM/AAAA HH:mm:ss` en hora local del navegador.
 *
 * Durante la exportación, todos los botones de descarga se deshabilitan
 * con `isExporting` para evitar solicitudes simultáneas.
 *
 * Errores de exportación se notifican con Sonner (`toast.error`).
 *
 * @see components/dashboard/RecentCvs.tsx — uso en el dashboard
 * @see app/(dashboard)/history/page.tsx — uso en la página de historial
 * @see app/api/cv/export/route.ts — endpoint de exportación
 *
 * @example
 * <CvHistoryCard cv={cv} onDelete={handleDelete} />
 */
const CvHistoryCard = ({ cv, onDelete }: CvHistoryCardProps) => {
  const t = useTranslations("history");
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Formatea una fecha como `DD/MM/AAAA HH:mm:ss` en hora local.
   */
  const formatDate = (dateValue: Date | string) => {
    const d = new Date(dateValue);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const jobTitle = cv.generatedContent?.experience?.[0]?.position || "CV Personalizado";
  const date = formatDate(cv.createdAt);

  /**
   * Solicita la exportación del CV en la plantilla indicada.
   * Llama a POST /api/cv/export y abre la URL firmada retornada en una nueva pestaña.
   */
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
