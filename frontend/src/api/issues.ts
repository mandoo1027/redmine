import client from './client';
import type { Issue, IssueLink, IssueRequest } from '../types';

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

// ===== 관련 이슈(양방향 링크) =====

export async function fetchIssueLinks(issueId: number): Promise<IssueLink[]> {
  const { data } = await client.get<IssueLink[]>(`/issues/${issueId}/links`);
  return data;
}

export async function addIssueLink(issueId: number, targetId: number): Promise<IssueLink> {
  const { data } = await client.post<IssueLink>(`/issues/${issueId}/links`, { targetId });
  return data;
}

export async function deleteIssueLink(linkId: number): Promise<void> {
  await client.delete(`/issues/links/${linkId}`);
}
