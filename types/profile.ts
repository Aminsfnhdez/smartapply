export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  city?: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  isOngoing?: boolean;
  city?: string;
  status?: 'finished' | 'ongoing' | 'incomplete';
}

export interface ComplementaryEducation {
  institution: string;
  program: string;
  year: string;
}

export interface Language {
  name: string;
  level: string;
}

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

export type ProfileFormData = Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
