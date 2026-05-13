import type { AppTask, TaskInstance, User } from '../types';

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' });
}

export async function getUsers(): Promise<User[]> {
  return apiFetch('/users');
}

export async function getTasks(from: string, to: string): Promise<TaskInstance[]> {
  return apiFetch(`/tasks?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}

export async function createTask(task: Omit<AppTask, 'id' | 'createdBy'>): Promise<AppTask> {
  return apiFetch('/tasks', { method: 'POST', body: JSON.stringify(task) });
}

export async function updateTask(id: string, task: Omit<AppTask, 'id' | 'createdBy'>): Promise<AppTask> {
  return apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) });
}

export async function deleteTask(id: string): Promise<void> {
  await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
}

export async function patchStatus(id: string, status: string, instanceDate?: string): Promise<void> {
  await apiFetch(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, instanceDate: instanceDate ?? null }),
  });
}
