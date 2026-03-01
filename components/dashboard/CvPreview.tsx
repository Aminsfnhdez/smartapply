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

/** Ancho de una hoja A4 a 96 DPI en píxeles. */
const A4_WIDTH = 794;
/** Alto de una hoja A4 a 96 DPI en píxeles. */
const A4_HEIGHT = 1123;

/**
 * Props del componente CvPreview.
 */
interface CvPreviewProps {
  /** Contenido del CV generado por Claude API. */
  content: GeneratedCvContent;
  /** Plantilla seleccionada para renderizar el preview y exportar el PDF. */
  template: 'classic' | 'modern' | 'minimalist';
  /** Idioma del contenido del CV para adaptar etiquetas de sección. */
  language: 'es' | 'en';
  /**
   * ID del CV guardado en la DB.
   * Si es null/undefined, el botón de descarga PDF no se renderiza.
   * Se recibe null antes de que el CV sea guardado y se actualiza tras la generación.
   */
  cvId?: string | null;
}

/**
 * Previsualización interactiva del CV con opción de descarga PDF.
 *
 * Client Component — gestiona el estado de descarga y las notificaciones.
 *
 * Responsabilidades:
 * - Renderiza la plantilla HTML correspondiente (Classic, Modern o Minimalist)
 *   escalada a tamaño A4 dentro del contenedor disponible.
 * - Aplica escalado responsivo mediante `transform: scale()` con tres breakpoints:
 *   - Mobile: scale 0.48
 *   - sm (≥640px): scale 0.55
 *   - md (≥768px): scale 0.65
 *   El wrapper ajusta su altura al tamaño visual escalado para evitar espacios vacíos.
 *   Las media queries se inyectan como `<style>` inline ya que Tailwind no soporta
 *   valores dinámicos de `transform` en clases utilitarias.
 * - Botón de descarga PDF que llama a `POST /api/cv/export` y abre la URL
 *   firmada de Supabase en una nueva pestaña.
 *   - Mientras descarga: muestra estado de carga con Sonner toast y deshabilita el botón.
 *   - En error: toast de error.
 *   - En éxito: toast de éxito y apertura de la URL.
 *
 * Las plantillas HTML son versiones Tailwind de las plantillas PDF, garantizando
 * fidelidad visual entre el preview y el PDF exportado.
 *
 * ⚠️ No usa `PDFViewer` de `@react-pdf/renderer` — causa error con Turbopack.
 *
 * @see lib/pdf-generator.ts — generación del PDF real en el servidor
 * @see app/api/cv/export/route.ts — endpoint de exportación
 * @see components/cv-templates/ — plantillas HTML y PDF
 *
 * @example
 * <CvPreview
 *   content={generatedCv}
 *   template="modern"
 *   language="es"
 *   cvId={savedCvId}
 * />
 */
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

        {/* Media queries para escalas responsivas */}
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

      {/* Botón de descarga PDF — solo visible cuando el CV está guardado */}
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
