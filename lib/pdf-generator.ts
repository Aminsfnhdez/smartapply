import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ClassicTemplatePDF } from '@/components/cv-templates/ClassicTemplate';
import { ModernTemplatePDF } from '@/components/cv-templates/ModernTemplate';
import { MinimalistTemplatePDF } from '@/components/cv-templates/MinimalistTemplate';
import type { GeneratedCvContent } from '@/types/cv';

export type TemplateType = 'classic' | 'modern' | 'minimalist';

export const generatePdfBuffer = async (content: GeneratedCvContent, template: TemplateType): Promise<Buffer> => {
  let TemplateComponent;

  switch (template) {
    case 'modern':
      TemplateComponent = ModernTemplatePDF;
      break;
    case 'minimalist':
      TemplateComponent = MinimalistTemplatePDF;
      break;
    case 'classic':
    default:
      TemplateComponent = ClassicTemplatePDF;
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
