'use client';

import { useTranslations } from 'next-intl';
import type { GeneratedCvContent } from '@/types/cv';
import { ClassicTemplate } from '../cv-templates/ClassicTemplate';
import { ModernTemplate } from '../cv-templates/ModernTemplate';
import { MinimalistTemplate } from '../cv-templates/MinimalistTemplate';

interface CvPreviewProps {
  content: GeneratedCvContent;
  template: 'classic' | 'modern' | 'minimalist';
  language: 'es' | 'en';
}

export const CvPreview = ({ content, template, language }: CvPreviewProps) => {
  const t = useTranslations('generate');

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

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{t('previewTitle')}</h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 uppercase">
          {template}
        </span>
      </div>
      
      {/* Contenedor con scroll y escala para previsualización tipo página A4 */}
      <div className="relative w-full overflow-hidden rounded-2xl border bg-gray-100 shadow-inner">
        <div className="flex justify-center p-4 sm:p-8">
          <div className="origin-top scale-[0.5] sm:scale-[0.7] md:scale-[0.85] lg:scale-[0.6] xl:scale-[0.75] transition-transform duration-300">
            {renderTemplate()}
          </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-gray-500">
        {t('previewNote')}
      </p>
    </div>
  );
};
