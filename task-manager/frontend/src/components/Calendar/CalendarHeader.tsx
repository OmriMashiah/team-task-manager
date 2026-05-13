import type { CalendarView, User } from '../../types';

interface Props {
  view: CalendarView;
  currentDate: Date;
  currentUser: User | null;
  onViewChange: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onLogout: () => void;
}

function formatLabel(view: CalendarView, date: Date): string {
  if (view === 'month') {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  const mon = getWeekStart(date);
  const sun = new Date(mon);
  sun.setDate(sun.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} – ${fmt(sun)}, ${sun.getFullYear()}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function CalendarHeader({ view, currentDate, currentUser, onViewChange, onPrev, onNext, onLogout }: Props) {
  return (
    <header style={s.header}>
      <div style={s.left}>
        <button style={s.navBtn} onClick={onPrev}>‹</button>
        <span style={s.label}>{formatLabel(view, currentDate)}</span>
        <button style={s.navBtn} onClick={onNext}>›</button>
      </div>

      <div style={s.toggleGroup}>
        <button
          style={{ ...s.toggleBtn, ...(view === 'month' ? s.toggleActive : {}) }}
          onClick={() => onViewChange('month')}
        >
          Month
        </button>
        <button
          style={{ ...s.toggleBtn, ...(view === 'week' ? s.toggleActive : {}) }}
          onClick={() => onViewChange('week')}
        >
          Week
        </button>
      </div>

      {currentUser && (
        <button
          title={`${currentUser.name} — click to sign out`}
          onClick={onLogout}
          style={{ ...s.avatar, background: currentUser.color }}
        >
          {initials(currentUser.name)}
        </button>
      )}
    </header>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    borderBottom: '1px solid #e5e5e5',
    background: '#fff',
    gap: 16,
  },
  left: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: 600, color: '#111', minWidth: 200, textAlign: 'center' },
  navBtn: {
    background: 'none',
    border: '1px solid #e5e5e5',
    borderRadius: 6,
    width: 30,
    height: 30,
    cursor: 'pointer',
    fontSize: 16,
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleGroup: {
    display: 'flex',
    border: '1px solid #e5e5e5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    color: '#6b7280',
  },
  toggleActive: {
    background: '#111',
    color: '#fff',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
