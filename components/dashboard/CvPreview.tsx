'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedCvContent } from '@/types/cv';
import { ClassicTemplate } from '../cv-templates/ClassicTemplate';
import { ModernTemplate } from '../cv-templates/ModernTemplate';
import { MinimalistTemplate } from '../cv-templates/MinimalistTemplate';

/** Ancho y alto de una hoja A4 a 96 DPI (px) */
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface CvPreviewProps {
  content: GeneratedCvContent;
  template: 'classic' | 'modern' | 'minimalist';
  language: 'es' | 'en';
  cvId?: string | null;
}

export const CvPreview = ({ content, template, language, cvId }: CvPreviewProps) => {
  const t = useTranslations('generate');
  const [downloading, setDownloading] = useState(false);

  const renderTemplate = () => {
    switch (template) {
      case 'modern':
        return <ModernTemplate content={content} language={language} />;
      case 'minimalist':
        return <MinimalistTemplate content={content} language={language} />;
      case 'classic':
      default:
        return <ClassicTemplate content={content} language={language} />;
    }
  };

  const handleDownload = async () => {
    if (!cvId) return;

    const toastId = toast.loading(t('downloadLoading'));
    setDownloading(true);

    try {
      const res = await fetch('/api/cv/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvId, template }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('downloadError'));
      }

      toast.success(t('downloadSuccess'), { id: toastId });
      window.open(data.url, '_blank');
    } catch {
      toast.error(t('downloadError'), { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Escala responsiva: se aplica transform scale para mostrar la hoja A4
   * dentro del contenedor disponible. origin-top-left evita el recorte
   * y el wrapper ajusta su altura visual al tamaño escalado.
   */
  const scale = 0.48;
  const scaleSm = 0.55;
  const scaleMd = 0.65;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t('previewTitle')}</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 uppercase">
          {template}
        </span>
      </div>

      {/* Contenedor de previsualización tipo página A4 */}
      <div className="relative w-full overflow-x-auto rounded-2xl border bg-gray-100 p-4 shadow-inner sm:p-6 md:p-8">
        <div
          className="cv-preview-wrapper mx-auto"
          style={{
            width: `${A4_WIDTH * scale}px`,
            height: `${A4_HEIGHT * scale}px`,
          }}
        >
          <div
            className="cv-preview-page origin-top-left rounded-sm bg-white shadow-lg ring-1 ring-gray-200"
            style={{
              width: `${A4_WIDTH}px`,
              minHeight: `${A4_HEIGHT}px`,
              transform: `scale(${scale})`,
            }}
          >
            {renderTemplate()}
          </div>
        </div>

        {/* Media queries para escalas responsivas via style tag inline */}
        <style>{`
          @media (min-width: 640px) {
            .cv-preview-wrapper { width: ${A4_WIDTH * scaleSm}px !important; height: ${A4_HEIGHT * scaleSm}px !important; }
            .cv-preview-page { transform: scale(${scaleSm}) !important; }
          }
          @media (min-width: 768px) {
            .cv-preview-wrapper { width: ${A4_WIDTH * scaleMd}px !important; height: ${A4_HEIGHT * scaleMd}px !important; }
            .cv-preview-page { transform: scale(${scaleMd}) !important; }
          }
        `}</style>
      </div>

      <p className="text-center text-xs text-gray-500">
        {t('previewNote')}
      </p>

      {/* Botón de descarga PDF */}
      {cvId && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold text-white shadow-md transition-all',
            downloading
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98]'
          )}
        >
          <Download className="h-5 w-5" />
          {downloading ? t('downloadLoading') : t('downloadPdf')}
        </button>
      )}
    </div>
  );
};
