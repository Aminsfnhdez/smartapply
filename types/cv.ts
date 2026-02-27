export interface GeneratedCvContent {
  personalInfo?: {
    fullName?: string;
    jobTitle?: string;
    phone?: string;
    email?: string;
    city?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  technicalSkills: string[];
  softSkills: string[];
  complementaryEducation?: Array<{
    institution: string;
    program: string;
    year: string;
  }>;
  languages: Array<{
    name: string;
    level: string;
  }>;
  certifications?: string[];
}

export interface AtsScoreResponse {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface CvGenerateRequest {
  jobDescription: string;
  template: 'classic' | 'modern' | 'minimalist';
  language?: 'es' | 'en';
}
