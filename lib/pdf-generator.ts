import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ClassicTemplatePDF } from '@/components/cv-templates/ClassicTemplate';
import { ModernTemplatePDF } from '@/components/cv-templates/ModernTemplate';
import { MinimalistTemplatePDF } from '@/components/cv-templates/MinimalistTemplate';
import type { GeneratedCvContent } from '@/types/cv';

/**
 * Plantillas de CV disponibles en el proyecto.
 *
 * - `classic`: diseño tradicional, formal y conservador.
 * - `modern`: diseño contemporáneo con mayor uso del espacio visual.
 * - `minimalist`: diseño limpio y minimalista, máxima legibilidad ATS.
 */
export type TemplateType = 'classic' | 'modern' | 'minimalist';

/**
 * Genera un PDF del CV en el servidor y lo retorna como Buffer.
 *
 * Selecciona el componente de plantilla correspondiente al tipo recibido
 * y lo renderiza a bytes usando `@react-pdf/renderer`.
 *
 * ⚠️ Esta función debe ejecutarse ÚNICAMENTE en el servidor (Route Handlers,
 * Server Actions). El uso de `@react-pdf/renderer` en el cliente con
 * Turbopack/Next.js 16 provoca el error `su is not a function`.
 *
 * Las plantillas PDF son componentes React que usan primitivos de
 * `@react-pdf/renderer` (`Document`, `Page`, `Text`, `View`, etc.)
 * y están ubicadas en `components/cv-templates/`.
 *
 * @param content - Contenido del CV generado por Claude (estructura JSON tipada).
 * @param template - Tipo de plantilla a aplicar. Por defecto usa `classic`.
 * @returns Buffer con los bytes del PDF generado.
 *
 * @example
 * // En un Route Handler (servidor):
 * const pdfBuffer = await generatePdfBuffer(cv.generatedContent, 'modern');
 * await supabaseAdmin.storage.from('cvs').upload(path, pdfBuffer);
 */
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
