export enum IssueSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical (Grounded)'
}

export enum IssueStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export interface SessionLog {
  id: string;
  sessionName: string; // Auto-generated: Simulator_Date
  instructorName: string;
  date: string; // ISO string (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  simulator: string; // e.g., 'Airbus A320'
  sessionType: 'Certified' | 'Non-Certified';
  downtimeMinutes: number;
  isSessionLost: boolean;
  sessionLostReason?: string;
  notes?: string;
  timestamp: number;
}

export interface IssueReport {
  id: string;
  reportedBy: string;
  date: string; // ISO string
  severity: IssueSeverity;
  status: IssueStatus;
  component: string; // e.g., 'Visual System', 'Controls', 'Avionics'
  description: string;
  resolutionNotes?: string;
  timestamp: number;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  technician: string;
  actionPerformed: string;
  relatedIssueId?: string; // Optional link to an issue
  hoursSpent: number;
  timestamp: number;
}

export type ViewMode = 'LANDING' | 'INSTRUCTOR' | 'MAINTENANCE' | 'ADMIN';

export const MOCK_INSTRUCTORS = ['Capt. Reynolds', 'Inst. Maverick', 'Inst. Goose', 'Capt. Starbuck'];
export const MOCK_COMPONENTS = ['Visual System', 'Motion Platform', 'Avionics', 'Controls (Yoke/Pedals)', 'Instructor Station', 'Software'];