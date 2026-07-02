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

// 부모 엔티티(이슈/문서)가 아직 저장되지 않은 작성 화면에서 본문 이미지를
// 서버 첨부로 업로드한다. parentId 없이(draft) 업로드하며, 반환된 첨부의
// inline 다운로드 URL 을 본문 <img src> 로 사용한다. base64 를 본문에 넣지
// 않으므로 이슈/문서 본문이 무거워지지 않는다.
export async function uploadDraftAttachment(
  parentType: ParentType,
  file: File
): Promise<Attachment> {
  const form = new FormData();
  form.append('file', file);
  form.append('parentType', parentType);
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
