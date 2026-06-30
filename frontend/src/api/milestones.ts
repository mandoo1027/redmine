import client from './client';
import type { Milestone } from '../types';

export async function fetchMilestones(projectId: number): Promise<Milestone[]> {
  const { data } = await client.get<Milestone[]>(`/projects/${projectId}/milestones`);
  return data;
}

export async function createMilestone(
  projectId: number,
  payload: { name: string; description?: string; dueDate?: string }
): Promise<Milestone> {
  const { data } = await client.post<Milestone>(`/projects/${projectId}/milestones`, payload);
  return data;
}

export async function updateMilestone(
  id: number,
  payload: { name: string; description?: string; dueDate?: string }
): Promise<Milestone> {
  const { data } = await client.put<Milestone>(`/milestones/${id}`, payload);
  return data;
}

export async function deleteMilestone(id: number): Promise<void> {
  await client.delete(`/milestones/${id}`);
}
