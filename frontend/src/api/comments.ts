import client from './client';
import type { Comment } from '../types';

export async function listComments(issueId: number): Promise<Comment[]> {
  const { data } = await client.get<Comment[]>(`/issues/${issueId}/comments`);
  return data;
}

export async function createComment(issueId: number, content: string): Promise<Comment> {
  const { data } = await client.post<Comment>(`/issues/${issueId}/comments`, { content });
  return data;
}

export async function deleteComment(id: number): Promise<void> {
  await client.delete(`/comments/${id}`);
}
