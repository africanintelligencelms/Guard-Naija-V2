import { IncidentType, IncidentStatus, SeverityLevel, IncidentReport } from './types';

export const APP_NAME = "Guard Nigeria";

export const INCIDENT_CATEGORIES = [
  { value: IncidentType.Kidnapping, label: "Kidnapping", color: "text-red-600" },
  { value: IncidentType.Banditry, label: "Banditry", color: "text-orange-600" },
  { value: IncidentType.Robbery, label: "Armed Robbery", color: "text-yellow-600" },
  { value: IncidentType.CivilUnrest, label: "Civil Unrest", color: "text-purple-600" },
  { value: IncidentType.Harassment, label: "Harassment", color: "text-blue-600" },
  { value: IncidentType.SuspiciousActivity, label: "Suspicious Activity", color: "text-gray-600" },
];



// Mock Data for Dashboard
export const MOCK_INCIDENTS: IncidentReport[] = [
  {
    id: '1',
    type: IncidentType.Banditry,
    description: 'Reports of armed men on the Kaduna-Abuja highway.',
    location: { lat: 10.5105, lng: 7.4165, address: 'Kaduna-Abuja Highway' },
    severity: SeverityLevel.Critical,
    timestamp: Date.now() - 3600000,
    status: IncidentStatus.Verified,
    isAnonymous: true
  },
  {
    id: '2',
    type: IncidentType.CivilUnrest,
    description: 'Protest gathering at Lekki Toll Gate, traffic building up.',
    location: { lat: 6.4500, lng: 3.6000, address: 'Lekki, Lagos' },
    severity: SeverityLevel.Medium,
    timestamp: Date.now() - 7200000,
    status: IncidentStatus.InProgress,
    isAnonymous: false
  },
  {
    id: '3',
    type: IncidentType.Kidnapping,
    description: 'Suspicious vehicle following students near University gate.',
    location: { lat: 6.3350, lng: 5.6037, address: 'Benin City' },
    severity: SeverityLevel.High,
    timestamp: Date.now() - 86400000,
    status: IncidentStatus.Submitted,
    isAnonymous: true
  }
];

export const STATES_GEO = [
  // Simplified coordinates for visual demo
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Abuja', lat: 9.0765, lng: 7.3986 },
  { name: 'Kano', lat: 12.0022, lng: 8.5920 },
  { name: 'Port Harcourt', lat: 4.8156, lng: 7.0498 },
  { name: 'Enugu', lat: 6.4584, lng: 7.5464 },
  { name: 'Kaduna', lat: 10.5105, lng: 7.4165 },
];
