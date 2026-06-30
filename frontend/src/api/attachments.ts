import client from './client';

export interface Attachment {
  id: number;
  originalName: string;
  contentType: string | null;
  fileSize: number;
  uploadedByName: string | null;
  url: string;
  createdAt: string;
}

export type ParentType = 'ISSUE' | 'WIKI';

export async function uploadAttachment(
  parentType: ParentType,
  parentId: number,
  file: File
): Promise<Attachment> {
  const form = new FormData();
  form.append('file', file);
  form.append('parentType', parentType);
  form.append('parentId', String(parentId));
  const { data } = await client.post<Attachment>('/attachments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function listAttachments(
  parentType: ParentType,
  parentId: number
): Promise<Attachment[]> {
  const { data } = await client.get<Attachment[]>('/attachments', {
    params: { parentType, parentId },
  });
  return data;
}

export async function deleteAttachment(id: number): Promise<void> {
  await client.delete(`/attachments/${id}`);
}

// 다운로드/이미지 표시용 절대 URL (client baseURL 기준)
export function attachmentDownloadUrl(id: number, inline = false): string {
  const base = client.defaults.baseURL || '/api';
  return `${base}/attachments/${id}/download${inline ? '?inline=true' : ''}`;
}
