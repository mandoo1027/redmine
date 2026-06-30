export type Role = 'ADMIN' | 'USER';

export interface User {
  id: number;
  username: string;
  displayName: string | null;
  role: Role;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  displayName?: string;
  role?: Role;
}

export interface UpdateUserPayload {
  displayName?: string;
  role?: Role;
  password?: string;
}

export interface Project {
  id: number;
  key: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface ProjectMember {
  id: number;
  userId: number;
  username: string;
  displayName: string | null;
  role: string | null;
}

export type TrackerType = 'BUG' | 'FEATURE' | 'TASK';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type IssuePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Issue {
  id: number;
  projectId: number;
  projectKey: string;
  subject: string;
  description: string | null;
  tracker: TrackerType;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: number | null;
  assigneeName: string | null;
  reporterId: number | null;
  reporterName: string | null;
  milestoneId: number | null;
  milestoneName: string | null;
  startDate: string | null;
  dueDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueRequest {
  projectId: number;
  subject: string;
  description?: string | null;
  tracker?: TrackerType;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: number | null;
  milestoneId?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  progress?: number;
}

export interface Milestone {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  dueDate: string | null;
}

export interface WikiPage {
  id: number;
  projectId: number;
  slug: string;
  title: string;
  content: string | null;
  updatedByName: string | null;
  updatedAt: string;
}

export const TRACKERS: TrackerType[] = ['BUG', 'FEATURE', 'TASK'];
export const STATUSES: IssueStatus[] = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
export const PRIORITIES: IssuePriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

// 영어 enum 값은 유지하고, 표시만 한글로.
export const TRACKER_LABELS: Record<TrackerType, string> = {
  BUG: '버그',
  FEATURE: '기능',
  TASK: '작업',
};
export const STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: '열림',
  IN_PROGRESS: '진행중',
  CLOSED: '완료',
};
export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  LOW: '낮음',
  NORMAL: '보통',
  HIGH: '높음',
  URGENT: '긴급',
};
