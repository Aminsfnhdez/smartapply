/**
 * Tipos que representan el perfil profesional del usuario en SmartApply.
 *
 * Estos tipos modelan los datos del formulario multi-paso de perfil y su
 * representación en la base de datos (modelo Profile de Prisma). Son la
 * fuente de información que Claude recibe para generar el CV adaptado.
 *
 * Convenciones de fechas: `"Ene 2022"` en español, `"Jan 2022"` en inglés.
 * El formulario muestra una nota de ayuda para garantizar este formato.
 */

/**
 * Entrada de experiencia laboral del usuario.
 *
 * `isCurrent` indica que el usuario sigue trabajando en este puesto.
 * Cuando es `true`, el formulario oculta el campo `endDate` y la plantilla
 * de CV muestra "Actualidad" / "Present" como fecha de fin.
 */
export interface Experience {
  company: string;
  position: string;
  /** Fecha de inicio en formato "Mmm YYYY" (ej: "Ene 2022"). */
  startDate: string;
  /** Fecha de fin en formato "Mmm YYYY". Omitido si `isCurrent` es true. */
  endDate: string;
  /** Indica si el usuario trabaja actualmente en este puesto. */
  isCurrent?: boolean;
  city?: string;
  description: string;
}

/**
 * Entrada de formación académica del usuario.
 *
 * `isOngoing` indica que el usuario está cursando actualmente este grado.
 * `status` permite diferenciar entre estudios finalizados, en curso o incompletos,
 * lo que puede reflejarse en la descripción del CV generado por Claude.
 */
export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  /** Fecha de fin. Omitido si `isOngoing` es true. */
  endDate: string;
  /** Indica si el usuario está cursando actualmente este programa. */
  isOngoing?: boolean;
  city?: string;
  /** Estado de la formación: finalizada, en curso o incompleta. */
  status?: 'finished' | 'ongoing' | 'incomplete';
}

/**
 * Entrada de formación complementaria: cursos, bootcamps, talleres, etc.
 * No confundir con la formación académica formal (`Education`).
 */
export interface ComplementaryEducation {
  institution: string;
  program: string;
  /** Año de realización o finalización (ej: "2023"). */
  year: string;
}

/**
 * Idioma del usuario con su nivel de dominio.
 *
 * @example
 * { name: 'Inglés', level: 'C1 – Avanzado' }
 * { name: 'English', level: 'Native' }
 */
export interface Language {
  name: string;
  level: string;
}

/**
 * Perfil profesional completo del usuario tal como se almacena en la DB.
 *
 * Refleja el modelo Profile de Prisma. Los campos de datos personales son
 * `null` cuando el usuario no los ha completado aún (perfil parcial).
 *
 * Los campos JSON en Prisma (experience, education, languages,
 * complementaryEducation) se tipizan aquí con sus interfaces específicas
 * para tener seguridad de tipos en el resto de la aplicación.
 *
 * @see prisma/schema.prisma — modelo Profile
 * @see app/api/profile/route.ts — GET y PUT que retornan/reciben este tipo
 */
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string | null;
  jobTitle: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  linkedin: string | null;
  portfolio: string | null;
  summary: string | null;
  experience: Experience[];
  education: Education[];
  technicalSkills: string[];
  softSkills: string[];
  languages: Language[];
  certifications: string[];
  complementaryEducation: ComplementaryEducation[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo para los datos del formulario de perfil.
 *
 * Omite los campos generados por la DB (`id`, `userId`, `createdAt`, `updatedAt`)
 * que no deben ser enviados por el cliente. Es el tipo usado por `ProfileForm`
 * al construir el body del PUT /api/profile.
 *
 * @see components/forms/ProfileForm.tsx
 * @see app/api/profile/route.ts — PUT espera este shape (validado con Zod)
 */
export type ProfileFormData = Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
