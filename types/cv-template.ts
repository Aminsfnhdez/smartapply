import type { GeneratedCvContent } from "./cv";

export interface CvTemplateProps {
  content: GeneratedCvContent;
  language: 'es' | 'en';
}
