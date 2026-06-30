import client from './client';
import type { CreateUserPayload, UpdateUserPayload, User } from '../types';

export async function listUsers(): Promise<User[]> {
  const { data } = await client.get<User[]>('/users');
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await client.post<User>('/users', payload);
  return data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
  const { data } = await client.put<User>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/users/${id}`);
}
