import client from './client';
import type { Project, ProjectMember } from '../types';

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await client.get<Project[]>('/projects');
  return data;
}

export async function fetchProject(id: number): Promise<Project> {
  const { data } = await client.get<Project>(`/projects/${id}`);
  return data;
}

export async function createProject(payload: {
  key: string;
  name: string;
  description?: string;
}): Promise<Project> {
  const { data } = await client.post<Project>('/projects', payload);
  return data;
}

export async function updateProject(
  id: number,
  payload: { key: string; name: string; description?: string }
): Promise<Project> {
  const { data } = await client.put<Project>(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: number): Promise<void> {
  await client.delete(`/projects/${id}`);
}

export async function fetchMembers(projectId: number): Promise<ProjectMember[]> {
  const { data } = await client.get<ProjectMember[]>(`/projects/${projectId}/members`);
  return data;
}

export async function addMember(
  projectId: number,
  payload: { userId: number; role?: string }
): Promise<ProjectMember> {
  const { data } = await client.post<ProjectMember>(`/projects/${projectId}/members`, payload);
  return data;
}

export async function removeMember(projectId: number, userId: number): Promise<void> {
  await client.delete(`/projects/${projectId}/members/${userId}`);
}
