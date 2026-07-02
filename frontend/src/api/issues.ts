import client from './client';
import type { Issue, IssueRequest } from '../types';

export interface IssueFilters {
  projectId?: number;
  status?: string;
  priority?: string;
  tracker?: string;
  assigneeId?: number;
  subject?: string;
  text?: string;
  assigneeName?: string;
}

export async function fetchIssues(filters: IssueFilters = {}): Promise<Issue[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      params.append(k, String(v));
    }
  });
  const { data } = await client.get<Issue[]>(`/issues?${params.toString()}`);
  return data;
}

export async function fetchProjectIssues(projectId: number): Promise<Issue[]> {
  const { data } = await client.get<Issue[]>(`/projects/${projectId}/issues`);
  return data;
}

export async function fetchIssue(id: number): Promise<Issue> {
  const { data } = await client.get<Issue>(`/issues/${id}`);
  return data;
}

export async function createIssue(payload: IssueRequest): Promise<Issue> {
  const { data } = await client.post<Issue>('/issues', payload);
  return data;
}

export async function updateIssue(id: number, payload: IssueRequest): Promise<Issue> {
  const { data } = await client.put<Issue>(`/issues/${id}`, payload);
  return data;
}

export async function deleteIssue(id: number): Promise<void> {
  await client.delete(`/issues/${id}`);
}
