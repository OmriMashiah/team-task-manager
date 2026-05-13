import type { TaskInstance, User } from '../../types';

interface Props {
  task: TaskInstance;
  users: User[];
  onClick: () => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#ef4444',
};

const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function TaskCard({ task, users, onClick }: Props) {
  const color = PRIORITY_COLOR[task.priority] ?? '#6b7280';
  const effectiveStatus = task.overriddenStatus ?? task.status;
  const assignees = users.filter(u => task.assignedTo.includes(u.id));

  return (
    <div
      style={{ ...s.card, opacity: effectiveStatus === 'done' ? 0.55 : 1 }}
      onClick={onClick}
    >
      <div style={{ ...s.priorityStrip, background: color }} />
      <div style={s.body}>
        <span style={s.title}>{task.title}</span>
        <div style={s.meta}>
          <span style={{ ...s.badge, borderColor: color, color }}>
            {task.priority}
          </span>
          <span style={s.status}>{STATUS_LABEL[effectiveStatus] ?? effectiveStatus}</span>
        </div>
        {assignees.length > 0 && (
          <div style={s.avatars}>
            {assignees.map(u => (
              <span key={u.id} style={{ ...s.avatar, background: u.color }} title={u.name}>
                {initials(u.name)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    borderRadius: 6,
    border: '1px solid #e5e5e5',
    background: '#fff',
    cursor: 'pointer',
    overflow: 'hidden',
    marginBottom: 6,
  },
  priorityStrip: { width: 4, flexShrink: 0 },
  body: { padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 },
  title: { fontSize: 13, fontWeight: 600, color: '#111', lineHeight: 1.3 },
  meta: { display: 'flex', gap: 6, alignItems: 'center' },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    border: '1px solid',
    borderRadius: 4,
    padding: '1px 5px',
    textTransform: 'capitalize',
  },
  status: { fontSize: 11, color: '#9ca3af' },
  avatars: { display: 'flex', gap: 3 },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
