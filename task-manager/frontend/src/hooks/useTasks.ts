import { useState, useEffect, useCallback } from 'react';
import * as api from '../api/client';
import type { AppTask, TaskInstance } from '../types';

export function useTasks(from: string, to: string) {
  const [tasks, setTasks] = useState<TaskInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(from, to);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);

  const createTask = useCallback(async (task: Omit<AppTask, 'id' | 'createdBy'>) => {
    await api.createTask(task);
    await fetch();
  }, [fetch]);

  const updateTask = useCallback(async (id: string, task: Omit<AppTask, 'id' | 'createdBy'>) => {
    await api.updateTask(id, task);
    await fetch();
  }, [fetch]);

  const deleteTask = useCallback(async (id: string) => {
    await api.deleteTask(id);
    await fetch();
  }, [fetch]);

  const patchStatus = useCallback(async (id: string, status: string, instanceDate?: string) => {
    await api.patchStatus(id, status, instanceDate);
    await fetch();
  }, [fetch]);

  return { tasks, loading, error, createTask, updateTask, deleteTask, patchStatus, refresh: fetch };
}

export function useUsers() {
  const [users, setUsers] = useState<import('../types').User[]>([]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  return users;
}
