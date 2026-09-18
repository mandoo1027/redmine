import client from './client';
import type { ScheduleEvent, ScheduleEventRequest, ScheduleTask, ScheduleTaskStatus } from '../types';

// 조회는 공개(비로그인). from/to(YYYY-MM-DD)로 기간 필터 가능.
export async function fetchScheduleEvents(from?: string, to?: string): Promise<ScheduleEvent[]> {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const qs = params.toString();
  const { data } = await client.get<ScheduleEvent[]>(`/schedule${qs ? `?${qs}` : ''}`);
  return data;
}

// 이하 생성/수정/삭제는 로그인 필요(토큰 자동 첨부).
export async function createScheduleEvent(payload: ScheduleEventRequest): Promise<ScheduleEvent> {
  const { data } = await client.post<ScheduleEvent>('/schedule', payload);
  return data;
}

export async function updateScheduleEvent(id: number, payload: ScheduleEventRequest): Promise<ScheduleEvent> {
  const { data } = await client.put<ScheduleEvent>(`/schedule/${id}`, payload);
  return data;
}

export async function deleteScheduleEvent(id: number): Promise<void> {
  await client.delete(`/schedule/${id}`);
}

// 첨부파일 업로드(로그인 필요, multipart)
export async function uploadScheduleAttachment(id: number, file: File): Promise<ScheduleEvent> {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await client.post<ScheduleEvent>(`/schedule/${id}/attachment`, fd);
  return data;
}

// 첨부파일 다운로드(로그인 필요) — 토큰이 자동 첨부되며, blob 을 받아 저장 트리거.
export async function downloadScheduleAttachment(id: number, filename: string): Promise<void> {
  const res = await client.get(`/schedule/${id}/attachment`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ===== 작업 항목(체크리스트) ===== */

// 목록 조회 — 공개(비로그인 허용)
export async function fetchScheduleTasks(eventId: number): Promise<ScheduleTask[]> {
  const { data } = await client.get<ScheduleTask[]>(`/schedule/${eventId}/tasks`);
  return data;
}

// 일괄 등록(로그인 필요). replace=true 면 기존 항목을 교체.
export async function bulkCreateScheduleTasks(
  eventId: number,
  tasks: { title: string; section?: string | null; status?: ScheduleTaskStatus; sortOrder?: number }[],
  replace = false,
): Promise<ScheduleTask[]> {
  const { data } = await client.post<ScheduleTask[]>(`/schedule/${eventId}/tasks/bulk`, { tasks, replace });
  return data;
}

// 수정(상태 변경 등, 로그인 필요). 보내지 않은 필드는 변경되지 않는다.
export async function updateScheduleTask(
  taskId: number,
  payload: { status?: ScheduleTaskStatus; title?: string; section?: string | null; sortOrder?: number },
): Promise<ScheduleTask> {
  const { data } = await client.put<ScheduleTask>(`/schedule/tasks/${taskId}`, payload);
  return data;
}

export async function deleteScheduleTask(taskId: number): Promise<void> {
  await client.delete(`/schedule/tasks/${taskId}`);
}
