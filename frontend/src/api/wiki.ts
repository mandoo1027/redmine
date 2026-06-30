import client from './client';
import type { WikiPage } from '../types';

export async function fetchWikiPages(projectId: number): Promise<WikiPage[]> {
  const { data } = await client.get<WikiPage[]>(`/projects/${projectId}/wiki`);
  return data;
}

export async function fetchWikiPage(projectId: number, slug: string): Promise<WikiPage> {
  const { data } = await client.get<WikiPage>(`/projects/${projectId}/wiki/${slug}`);
  return data;
}

export async function createWikiPage(
  projectId: number,
  payload: { slug: string; title: string; content?: string }
): Promise<WikiPage> {
  const { data } = await client.post<WikiPage>(`/projects/${projectId}/wiki`, payload);
  return data;
}

export async function updateWikiPage(
  projectId: number,
  slug: string,
  payload: { slug: string; title: string; content?: string }
): Promise<WikiPage> {
  const { data } = await client.put<WikiPage>(`/projects/${projectId}/wiki/${slug}`, payload);
  return data;
}

export async function deleteWikiPage(projectId: number, slug: string): Promise<void> {
  await client.delete(`/projects/${projectId}/wiki/${slug}`);
}
