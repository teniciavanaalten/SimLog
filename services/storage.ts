import { SessionLog, IssueReport, MaintenanceLog, IssueSeverity, IssueStatus } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'simlog_sessions',
  ISSUES: 'simlog_issues',
  MAINTENANCE: 'simlog_maintenance',
};

// Initial Seed Data
const INITIAL_SESSIONS: SessionLog[] = [
  { 
    id: 's1', 
    sessionName: 'Airbus A320_2024-05-18',
    instructorName: 'Capt. Reynolds', 
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], 
    startTime: '09:00',
    endTime: '11:30',
    durationHours: 2.5, 
    simulator: 'Airbus A320',
    sessionType: 'Certified',
    downtimeMinutes: 0,
    isSessionLost: false,
    timestamp: Date.now() - 86400000 * 2 
  },
  { 
    id: 's2', 
    sessionName: 'Airbus A320_2024-05-19',
    instructorName: 'Inst. Maverick', 
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
    startTime: '14:00',
    endTime: '15:30',
    durationHours: 1.5, 
    simulator: 'Airbus A320',
    sessionType: 'Non-Certified',
    downtimeMinutes: 15,
    isSessionLost: false,
    timestamp: Date.now() - 86400000 
  },
  { 
    id: 's3', 
    sessionName: `Airbus A320_${new Date().toISOString().split('T')[0]}`,
    instructorName: 'Capt. Reynolds', 
    date: new Date().toISOString().split('T')[0], 
    startTime: '10:00',
    endTime: '13:00',
    durationHours: 3.0, 
    simulator: 'Airbus A320',
    sessionType: 'Certified', 
    downtimeMinutes: 0,
    isSessionLost: false,
    timestamp: Date.now() 
  },
];

const INITIAL_ISSUES: IssueReport[] = [
  { id: 'i1', reportedBy: 'Capt. Reynolds', date: new Date(Date.now() - 86400000 * 5).toISOString(), severity: IssueSeverity.LOW, status: IssueStatus.RESOLVED, component: 'Instructor Station', description: 'Touchscreen lagging slightly.', resolutionNotes: 'Rebooted main server.', timestamp: Date.now() - 86400000 * 5 },
  { id: 'i2', reportedBy: 'Inst. Maverick', date: new Date(Date.now() - 43200000).toISOString(), severity: IssueSeverity.HIGH, status: IssueStatus.OPEN, component: 'Visual System', description: 'Projector 2 flickering intermittently.', timestamp: Date.now() - 43200000 },
];

const INITIAL_MAINTENANCE: MaintenanceLog[] = [
  { id: 'm1', date: new Date(Date.now() - 86400000 * 4).toISOString(), technician: 'Tech Mike', actionPerformed: 'Routine visual inspection', hoursSpent: 1, timestamp: Date.now() - 86400000 * 4 },
];

// Helpers
const get = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return initial;
  try {
    return JSON.parse(stored);
  } catch {
    return initial;
  }
};

const set = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// API
export const storageService = {
  getSessions: () => get<SessionLog[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS),
  addSession: (session: SessionLog) => {
    const sessions = get<SessionLog[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    set(STORAGE_KEYS.SESSIONS, [session, ...sessions]);
  },
  
  getIssues: () => get<IssueReport[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES),
  addIssue: (issue: IssueReport) => {
    const issues = get<IssueReport[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    set(STORAGE_KEYS.ISSUES, [issue, ...issues]);
  },
  updateIssue: (updatedIssue: IssueReport) => {
    const issues = get<IssueReport[]>(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const newIssues = issues.map(i => i.id === updatedIssue.id ? updatedIssue : i);
    set(STORAGE_KEYS.ISSUES, newIssues);
  },

  getMaintenance: () => get<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE),
  addMaintenance: (log: MaintenanceLog) => {
    const logs = get<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE);
    set(STORAGE_KEYS.MAINTENANCE, [log, ...logs]);
  },

  // Reset for demo purposes
  resetData: () => {
    localStorage.clear();
    window.location.reload();
  }
};