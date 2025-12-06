export enum IncidentType {
  Kidnapping = 'Kidnapping',
  Banditry = 'Banditry',
  CivilUnrest = 'Civil Unrest',
  Robbery = 'Armed Robbery',
  Harassment = 'Police Harassment',
  SuspiciousActivity = 'Suspicious Activity',
  Other = 'Other'
}

export enum SeverityLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum IncidentStatus {
  Submitted = 'Submitted',
  Verified = 'Verified',
  InProgress = 'In Progress',
  Resolved = 'Resolved'
}

export interface IncidentReport {
  id: string;
  type: IncidentType;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: SeverityLevel;
  timestamp: number;
  status: IncidentStatus;
  isAnonymous: boolean;
  mediaUrl?: string;
  media?: {
    image: string | null;
    audio: string | null;
  };
}

export interface NewIncidentPayload {
  description: string;
  type: IncidentType;
  severity: SeverityLevel;
  isAnonymous: boolean;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  media: {
    image: string | null;
    audio: string | null;
  };
  timestamp: number;
}

export interface GeminiAnalysisResult {
  suggestedType: IncidentType;
  severityScore: number; // 1-10
  severityLevel: SeverityLevel;
  summary: string;
  keywords: string[];
}

export interface SecurityNewsItem {
  id: string;
  headline: string;
  source: string;
  url: string;
  time: string;
}