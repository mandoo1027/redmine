import client from './client';
import type { AppNotification } from '../types';

export async function listNotifications(): Promise<AppNotification[]> {
  const { data } = await client.get<AppNotification[]>('/notifications');
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await client.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markNotificationRead(id: number): Promise<void> {
  await client.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await client.post('/notifications/read-all');
}
