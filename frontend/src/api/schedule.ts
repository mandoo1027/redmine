import client from './client';
import type { ScheduleEvent, ScheduleEventRequest } from '../types';

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
