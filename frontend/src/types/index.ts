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
