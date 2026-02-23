export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  summary: string | null;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileFormData = Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
