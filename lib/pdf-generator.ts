import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ClassicTemplate } from '@/components/cv-templates/ClassicTemplate';
import { ModernTemplate } from '@/components/cv-templates/ModernTemplate';
import { MinimalistTemplate } from '@/components/cv-templates/MinimalistTemplate';
import type { GeneratedCvContent } from '@/types/cv';

export type TemplateType = 'classic' | 'modern' | 'minimalist';

export const generatePdfBuffer = async (content: GeneratedCvContent, template: TemplateType): Promise<Buffer> => {
  let TemplateComponent;

  switch (template) {
    case 'modern':
      TemplateComponent = ModernTemplate;
      break;
    case 'minimalist':
      TemplateComponent = MinimalistTemplate;
      break;
    case 'classic':
    default:
      TemplateComponent = ClassicTemplate;
      break;
  }

  // Renderizar a Buffer (solo en el servidor)
  const buffer = await renderToBuffer(
    React.createElement(TemplateComponent, {
      content,
      language: 'es', // Por ahora fallback a es, se podría pasar por param
    })
  );

  return buffer as Buffer;
};
