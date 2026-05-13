import type { TaskInstance, User } from '../../types';

interface Props {
  currentDate: Date;
  tasks: TaskInstance[];
  users: User[];
  onTaskClick: (task: TaskInstance) => void;
  onDayClick: (date: string) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#ef4444',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const firstDay = first.getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const start = new Date(first);
  start.setDate(1 - offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

function getEffectiveStatus(task: TaskInstance) {
  return task.overriddenStatus ?? task.status;
}

export function CalendarMonth({ currentDate, tasks, users, onTaskClick, onDayClick }: Props) {
  const cells = getMonthGrid(currentDate);
  const month = currentDate.getMonth();
  const today = toIso(new Date());

  const tasksByDate: Record<string, TaskInstance[]> = {};
  for (const t of tasks) {
    const key = t.instanceDate.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  }

  return (
    <div style={s.wrapper}>
      <div style={s.dayHeaders}>
        {DAY_NAMES.map(d => (
          <div key={d} style={s.dayName}>{d}</div>
        ))}
      </div>
      <div style={s.grid}>
        {cells.map((cell, i) => {
          const iso = toIso(cell);
          const isCurrentMonth = cell.getMonth() === month;
          const isToday = iso === today;
          const dayTasks = tasksByDate[iso] ?? [];
          const visible = dayTasks.slice(0, 3);
          const overflow = dayTasks.length - visible.length;

          return (
            <div
              key={i}
              style={{
                ...s.cell,
                background: isToday ? '#fafafa' : '#fff',
                cursor: 'pointer',
              }}
              onClick={() => onDayClick(iso)}
            >
              <span style={{
                ...s.dateNum,
                color: isCurrentMonth ? (isToday ? '#111' : '#374151') : '#d1d5db',
                fontWeight: isToday ? 700 : 400,
              }}>
                {cell.getDate()}
              </span>
              <div style={s.pills}>
                {visible.map(task => (
                  <TaskPill
                    key={`${task.id}-${task.instanceDate}`}
                    task={task}
                    users={users}
                    onClick={e => { e.stopPropagation(); onTaskClick(task); }}
                  />
                ))}
                {overflow > 0 && (
                  <span style={s.overflow}>+{overflow} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskPill({ task, users, onClick }: { task: TaskInstance; users: User[]; onClick: (e: React.MouseEvent) => void }) {
  const color = PRIORITY_COLOR[task.priority] ?? '#6b7280';
  const effectiveStatus = getEffectiveStatus(task);
  const assignees = users.filter(u => task.assignedTo.includes(u.id));

  return (
    <div
      style={{
        ...s.pill,
        borderLeft: `3px solid ${color}`,
        opacity: effectiveStatus === 'done' ? 0.5 : 1,
      }}
      onClick={onClick}
      title={task.title}
    >
      <span style={s.pillTitle}>{task.title}</span>
      <div style={s.dots}>
        {assignees.slice(0, 3).map(u => (
          <span key={u.id} style={{ ...s.dot, background: u.color }} title={u.name} />
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  dayHeaders: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    borderBottom: '1px solid #e5e5e5',
    background: '#fff',
  },
  dayName: {
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gridTemplateRows: 'repeat(6, 1fr)',
    flex: 1,
    overflow: 'hidden',
  },
  cell: {
    borderRight: '1px solid #e5e5e5',
    borderBottom: '1px solid #e5e5e5',
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minHeight: 100,
    overflow: 'hidden',
  },
  dateNum: { fontSize: 13, lineHeight: '20px', flexShrink: 0 },
  pills: { display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' },
  pill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    padding: '2px 5px',
    borderRadius: 4,
    background: '#f5f5f5',
    cursor: 'pointer',
    fontSize: 11,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  pillTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    color: '#111',
  },
  dots: { display: 'flex', gap: 2, flexShrink: 0 },
  dot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block' },
  overflow: { fontSize: 10, color: '#9ca3af', paddingLeft: 2 },
};
