'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { GeneratedCvContent } from '@/types/cv';

// Carga dinámica de plantillas para evitar errores de SSR con @react-pdf/renderer
const ClassicTemplate = dynamic(() => import('../cv-templates/ClassicTemplate').then(m => m.ClassicTemplate), { 
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
});

const ModernTemplate = dynamic(() => import('../cv-templates/ModernTemplate').then(m => m.ModernTemplate), { 
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
});

const MinimalistTemplate = dynamic(() => import('../cv-templates/MinimalistTemplate').then(m => m.MinimalistTemplate), { 
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-gray-100" />
});

// Importamos PDFViewer dinámicamente también
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(m => m.PDFViewer), {
  ssr: false,
});

interface CvPreviewProps {
  content: GeneratedCvContent;
  template: 'classic' | 'modern' | 'minimalist';
  language: 'es' | 'en';
}

export const CvPreview = ({ content, template, language }: CvPreviewProps) => {
  const t = useTranslations('generate');

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t('previewTitle')}</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 uppercase">
          {template}
        </span>
      </div>
      
      <div className="aspect-[1/1.414] w-full overflow-hidden rounded-2xl border bg-white shadow-inner">
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }} showToolbar={false}>
          {template === 'classic' ? (
            <ClassicTemplate content={content} language={language} />
          ) : template === 'modern' ? (
            <ModernTemplate content={content} language={language} />
          ) : (
            <MinimalistTemplate content={content} language={language} />
          )}
        </PDFViewer>
      </div>
      
      <p className="text-center text-xs text-gray-500">
        {t('previewNote')}
      </p>
    </div>
  );
};
