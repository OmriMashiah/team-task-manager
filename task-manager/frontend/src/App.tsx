import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useTasks, useUsers } from './hooks/useTasks';
import { LoginPage } from './components/Auth/LoginPage';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { CalendarMonth } from './components/Calendar/CalendarMonth';
import { CalendarWeek } from './components/Calendar/CalendarWeek';
import { TaskModal } from './components/Tasks/TaskModal';
import type { AppTask, CalendarView, TaskInstance } from './types';

function getRangeForView(view: CalendarView, date: Date): { from: string; to: string } {
  if (view === 'month') {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const firstDay = first.getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const start = new Date(first);
    start.setDate(1 - offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 41);
    return { from: toIso(start), to: toIso(end) };
  }
  // week
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  const end = new Date(d);
  end.setDate(d.getDate() + 6);
  return { from: toIso(d), to: toIso(end) };
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function CalendarApp() {
  const { user, token, logout } = useAuth();
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TaskInstance | null>(null);
  const [newTaskDate, setNewTaskDate] = useState<string | null>(null);

  const { from, to } = getRangeForView(view, currentDate);
  const { tasks, createTask, updateTask, deleteTask, patchStatus } = useTasks(from, to);
  const users = useUsers();

  const handlePrev = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() - 1);
      else d.setDate(d.getDate() - 7);
      return d;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + 1);
      else d.setDate(d.getDate() + 7);
      return d;
    });
  }, [view]);

  async function handleSave(payload: Omit<AppTask, 'id' | 'createdBy'>, instanceDate?: string) {
    if (selectedTask) {
      if (selectedTask.isRecurrenceInstance && instanceDate) {
        await patchStatus(selectedTask.id, payload.status, instanceDate);
        if (payload.title !== selectedTask.title ||
            payload.description !== selectedTask.description ||
            payload.priority !== selectedTask.priority) {
          await updateTask(selectedTask.id, payload);
        }
      } else {
        await updateTask(selectedTask.id, payload);
      }
    } else {
      await createTask(payload);
    }
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setSelectedTask(null);
  }

  if (!token) return <LoginPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        currentUser={user}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onLogout={logout}
      />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'month' ? (
          <CalendarMonth
            currentDate={currentDate}
            tasks={tasks}
            users={users}
            onTaskClick={setSelectedTask}
            onDayClick={date => { setSelectedTask(null); setNewTaskDate(date); }}
          />
        ) : (
          <CalendarWeek
            currentDate={currentDate}
            tasks={tasks}
            users={users}
            onTaskClick={setSelectedTask}
            onDayClick={date => { setSelectedTask(null); setNewTaskDate(date); }}
          />
        )}
      </div>

      {(selectedTask || newTaskDate) && (
        <TaskModal
          task={selectedTask}
          defaultDate={newTaskDate ?? undefined}
          users={users}
          onClose={() => { setSelectedTask(null); setNewTaskDate(null); }}
          onSave={handleSave}
          onDelete={selectedTask ? handleDelete : undefined}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CalendarApp />
    </AuthProvider>
  );
}
