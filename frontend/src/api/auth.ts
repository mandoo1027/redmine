import client from './client';
import type { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/auth/login', { username, password });
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await client.get<User>('/auth/me');
  return data;
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await client.get<User[]>('/users');
  return data;
}
