import type { GeneratedCvContent } from "./cv";

/**
 * Props compartidas por todos los componentes de plantilla de CV.
 *
 * Cada plantilla (Classic, Modern, Minimalist) existe en dos versiones:
 * - **PDF** (`*TemplatePDF`): usa primitivos de `@react-pdf/renderer`
 *   (`Document`, `Page`, `Text`, `View`, `StyleSheet`). Se renderiza
 *   exclusivamente en el servidor desde `lib/pdf-generator.ts`.
 * - **HTML** (`*TemplatePreview`): usa JSX estándar con Tailwind CSS.
 *   Se renderiza en el cliente para la previsualización en `/generate`.
 *
 * Ambas versiones reciben exactamente las mismas props, lo que garantiza
 * que el preview HTML sea fiel al PDF exportado.
 *
 * @see lib/pdf-generator.ts — usa las versiones PDF en el servidor
 * @see app/(dashboard)/generate/page.tsx — usa las versiones HTML en el cliente
 * @see types/cv.ts — definición de GeneratedCvContent
 */
export interface CvTemplateProps {
  /** Contenido del CV generado por Claude API. */
  content: GeneratedCvContent;
  /**
   * Idioma en que está escrito el contenido del CV.
   * Las plantillas lo usan para adaptar etiquetas de sección
   * (ej: "Experiencia" vs "Experience", "Educación" vs "Education").
   */
  language: 'es' | 'en';
}
