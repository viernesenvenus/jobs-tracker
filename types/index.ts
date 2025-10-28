export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  onboardingCompleted: boolean;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  notifications: boolean;
  language: 'es' | 'pt' | 'en';
  priorityFeatures: ('job_tracking' | 'cv_management' | 'ai_adaptation')[];
  activeProcesses: number;
}

export interface JobApplication {
  id: string;
  userId: string;
  role: string;
  company: string;
  position: string;
  source: ApplicationSource;
  applicationDate: Date;
  firstInterviewDate?: Date;
  responseTime?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  jobLink?: string;
  jobDescription?: string;
  status: ApplicationStatus;
  nextAction?: Date;
  notes?: string;
  cvId?: string;
  adaptedCvId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationSource = 
  | 'portal'
  | 'referral'
  | 'linkedin'
  | 'company_website'
  | 'recruiter'
  | 'other';

export type ApplicationStatus = 
  | 'applied'
  | 'interview'
  | 'feedback'
  | 'closed'
  | 'rejected'
  | 'offer';

export interface CV {
  id: string;
  userId: string;
  userEmail?: string; // Agregar el email del usuario
  name: string;
  type: 'base' | 'adapted';
  originalCvId?: string;
  jobApplicationId?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  keywords?: string[];
  coverage?: number;
  adaptedContent?: string; // Contenido adaptado del CV
  createdAt: Date;
  updatedAt: Date;
}

export interface CVAdaptation {
  id: string;
  cvId: string;
  jobApplicationId: string;
  originalContent: string;
  adaptedContent: string;
  suggestions: CVSuggestion[];
  keywords: string[];
  coverage: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface CVSuggestion {
  id: string;
  type: 'add' | 'modify' | 'remove';
  section: string;
  originalText?: string;
  suggestedText: string;
  reason: string;
  confidence: number;
  accepted?: boolean;
}

export interface OnboardingData {
  desiredRole: string;
  activeProcesses: 'none' | '1-2' | '3+';
  priorityFeatures: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'deadline' | 'update' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  jobApplicationId: string;
  type: 'status_change' | 'cv_upload' | 'cv_adaptation' | 'note_added' | 'reminder_set';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  responsesReceived: number;
  averageResponseTime: number;
  successRate: number;
}

export interface TableColumn {
  key: string;
  label: string;
  editable: boolean;
  type: 'text' | 'date' | 'select' | 'url';
  options?: string[];
  required?: boolean;
  width?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'file' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  type: 'application' | 'cv_adaptation' | 'follow_up' | 'confirmation' | 'cv_upload';
  data?: any;
  onClose: () => void;
  onConfirm?: (data: any) => void;
}
