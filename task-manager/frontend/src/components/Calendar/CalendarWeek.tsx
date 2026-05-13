import type { TaskInstance, User } from '../../types';
import { TaskCard } from '../Tasks/TaskCard';

interface Props {
  currentDate: Date;
  tasks: TaskInstance[];
  users: User[];
  onTaskClick: (task: TaskInstance) => void;
  onDayClick: (date: string) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd;
  });
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function CalendarWeek({ currentDate, tasks, users, onTaskClick, onDayClick }: Props) {
  const days = getWeekDays(currentDate);
  const today = toIso(new Date());

  const tasksByDate: Record<string, TaskInstance[]> = {};
  for (const t of tasks) {
    const key = t.instanceDate.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  }

  return (
    <div style={s.wrapper}>
      {days.map((day, i) => {
        const iso = toIso(day);
        const isToday = iso === today;
        const dayTasks = tasksByDate[iso] ?? [];

        return (
          <div
            key={i}
            style={{ ...s.column, background: isToday ? '#fafafa' : '#fff' }}
          >
            <div
              style={{ ...s.columnHeader, borderBottom: isToday ? '2px solid #111' : '1px solid #e5e5e5' }}
              onClick={() => onDayClick(iso)}
            >
              <span style={s.dayName}>{DAY_NAMES[i]}</span>
              <span style={{ ...s.dayNum, fontWeight: isToday ? 700 : 400 }}>
                {day.getDate()}
              </span>
            </div>
            <div style={s.tasks} onClick={() => onDayClick(iso)}>
              {dayTasks.map(task => (
                <div key={`${task.id}-${task.instanceDate}`} onClick={e => { e.stopPropagation(); onTaskClick(task); }}>
                  <TaskCard task={task} users={users} onClick={() => onTaskClick(task)} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  column: {
    flex: '1 0 140px',
    borderRight: '1px solid #e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 140,
  },
  columnHeader: {
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  dayName: { fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' },
  dayNum: { fontSize: 18, color: '#111', marginTop: 2 },
  tasks: {
    flex: 1,
    padding: '8px',
    overflowY: 'auto',
    cursor: 'pointer',
  },
};
