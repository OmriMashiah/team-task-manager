export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type CalendarView = 'month' | 'week';

export interface RecurrenceRule {
  intervalDays: number;
  startDate: string;
  endDate?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
}

export interface AppTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: Priority;
  createdBy: string;
  recurrence: RecurrenceRule | null;
}

export interface TaskInstance extends AppTask {
  isRecurrenceInstance: boolean;
  instanceDate: string;
  overriddenStatus?: TaskStatus;
}
