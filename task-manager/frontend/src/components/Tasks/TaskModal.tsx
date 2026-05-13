import { useState, useEffect, useRef } from 'react';
import type { AppTask, Priority, TaskInstance, TaskStatus, User } from '../../types';

interface Props {
  task?: TaskInstance | null;
  defaultDate?: string;
  users: User[];
  onClose: () => void;
  onSave: (task: Omit<AppTask, 'id' | 'createdBy'>, instanceDate?: string) => void;
  onDelete?: (id: string) => void;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function TaskModal({ task, defaultDate, users, onClose, onSave, onDelete }: Props) {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [dueDate, setDueDate] = useState(
    task?.instanceDate?.slice(0, 10) ?? task?.dueDate?.slice(0, 10) ?? defaultDate ?? ''
  );
  const [assignedTo, setAssignedTo] = useState<string[]>(task?.assignedTo ?? []);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.overriddenStatus ?? task?.status ?? 'todo');
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(Boolean(task?.recurrence));
  const [intervalDays, setIntervalDays] = useState(task?.recurrence?.intervalDays ?? 7);
  const [recEndDate, setRecEndDate] = useState(task?.recurrence?.endDate?.slice(0, 10) ?? '');
  const [titleError, setTitleError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function toggleAssignee(id: string) {
    setAssignedTo(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSubmit() {
    if (!title.trim()) { setTitleError(true); return; }
    setTitleError(false);

    const payload: Omit<AppTask, 'id' | 'createdBy'> = {
      title: title.trim(),
      description,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      assignedTo,
      status,
      priority,
      recurrence: recurrenceEnabled
        ? { intervalDays, startDate: dueDate || new Date().toISOString().slice(0, 10), endDate: recEndDate || null }
        : null,
    };

    const instanceDate = task?.isRecurrenceInstance ? task.instanceDate : undefined;
    onSave(payload, instanceDate);
    close();
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) close();
  }

  return (
    <div ref={overlayRef} style={s.overlay} onClick={handleOverlayClick}>
      <div
        style={{
          ...s.modal,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.2s ease, opacity 0.2s ease',
        }}
      >
        <div style={s.header}>
          <h2 style={s.heading}>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button style={s.closeBtn} onClick={close}>✕</button>
        </div>

        <div style={s.body}>
          <label style={s.label}>
            Title <span style={{ color: '#ef4444' }}>*</span>
            <input
              style={{ ...s.input, borderColor: titleError ? '#ef4444' : '#e5e5e5' }}
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false); }}
              placeholder="Task title"
              autoFocus
            />
            {titleError && <span style={s.errorText}>Title is required</span>}
          </label>

          <label style={s.label}>
            Description
            <textarea
              style={s.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional notes…"
              rows={3}
            />
          </label>

          <label style={s.label}>
            Due Date
            <input
              style={s.input}
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </label>

          <div style={s.label}>
            Priority
            <div style={s.toggleRow}>
              {(['low', 'medium', 'high'] as Priority[]).map(p => (
                <button
                  key={p}
                  style={{
                    ...s.toggleChip,
                    ...(priority === p ? { background: PRIORITY_COLOR[p], color: '#fff', borderColor: PRIORITY_COLOR[p] } : {}),
                  }}
                  onClick={() => setPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={s.label}>
            Status
            <div style={s.toggleRow}>
              {(['todo', 'inprogress', 'done'] as TaskStatus[]).map(st => (
                <button
                  key={st}
                  style={{
                    ...s.toggleChip,
                    ...(status === st ? { background: '#111', color: '#fff', borderColor: '#111' } : {}),
                  }}
                  onClick={() => setStatus(st)}
                >
                  {STATUS_LABEL[st]}
                </button>
              ))}
            </div>
          </div>

          <div style={s.label}>
            Assignees
            <div style={s.assigneeList}>
              {users.map(u => {
                const selected = assignedTo.includes(u.id);
                return (
                  <button
                    key={u.id}
                    style={{
                      ...s.assigneeChip,
                      borderColor: selected ? u.color : '#e5e5e5',
                      background: selected ? u.color + '18' : '#fff',
                    }}
                    onClick={() => toggleAssignee(u.id)}
                  >
                    <span style={{ ...s.avatarSm, background: u.color }}>{initials(u.name)}</span>
                    {u.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={s.label}>
            <div style={s.recurrenceToggleRow}>
              <span>Recurrence</span>
              <button
                style={{ ...s.switchBtn, background: recurrenceEnabled ? '#111' : '#e5e5e5' }}
                onClick={() => setRecurrenceEnabled(v => !v)}
              >
                <span style={{ ...s.switchKnob, transform: recurrenceEnabled ? 'translateX(16px)' : 'translateX(2px)' }} />
              </button>
            </div>
            {recurrenceEnabled && (
              <div style={s.recurrenceFields}>
                <label style={s.inlineLabel}>
                  Repeat every
                  <input
                    style={{ ...s.input, width: 64 }}
                    type="number"
                    min={1}
                    value={intervalDays}
                    onChange={e => setIntervalDays(Number(e.target.value))}
                  />
                  days
                </label>
                <label style={s.label}>
                  End date (optional)
                  <input
                    style={s.input}
                    type="date"
                    value={recEndDate}
                    onChange={e => setRecEndDate(e.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div style={s.footer}>
          {isEdit && onDelete && (
            confirmDelete ? (
              <div style={s.confirmRow}>
                <span style={{ fontSize: 13, color: '#ef4444' }}>Delete this task?</span>
                <button style={s.deleteBtnConfirm} onClick={() => { onDelete(task!.id); close(); }}>Yes, delete</button>
                <button style={s.cancelSmall} onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            ) : (
              <button style={s.deleteBtn} onClick={() => setConfirmDelete(true)}>Delete</button>
            )
          )}
          <div style={s.footerRight}>
            <button style={s.cancelBtn} onClick={close}>Cancel</button>
            <button style={s.saveBtn} onClick={handleSubmit}>
              {isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    width: 480,
    maxWidth: '95vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px',
    borderBottom: '1px solid #e5e5e5',
  },
  heading: { margin: 0, fontSize: 17, fontWeight: 700, color: '#111' },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af', padding: 4,
  },
  body: { padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500, color: '#374151' },
  input: {
    padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e5e5',
    fontSize: 14, outline: 'none', color: '#111', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  },
  textarea: {
    padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e5e5',
    fontSize: 14, outline: 'none', color: '#111', fontFamily: 'inherit',
    resize: 'vertical', width: '100%', boxSizing: 'border-box',
  },
  errorText: { fontSize: 12, color: '#ef4444' },
  toggleRow: { display: 'flex', gap: 6 },
  toggleChip: {
    padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e5e5',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', background: '#fff',
    textTransform: 'capitalize', color: '#374151',
  },
  assigneeList: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  assigneeChip: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '4px 10px 4px 4px', borderRadius: 20,
    border: '1px solid', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#111',
    background: '#fff',
  },
  avatarSm: {
    width: 22, height: 22, borderRadius: '50%', color: '#fff',
    fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  recurrenceToggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  switchBtn: {
    width: 36, height: 20, borderRadius: 10, border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
    padding: 0, flexShrink: 0,
  },
  switchKnob: {
    position: 'absolute', top: 2, width: 16, height: 16,
    borderRadius: '50%', background: '#fff', transition: 'transform 0.2s',
    display: 'block',
  },
  recurrenceFields: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, paddingLeft: 12, borderLeft: '2px solid #e5e5e5' },
  inlineLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#374151' },
  footer: {
    padding: '14px 20px',
    borderTop: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  footerRight: { display: 'flex', gap: 8, marginLeft: 'auto' },
  deleteBtn: {
    background: 'none', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13,
  },
  deleteBtnConfirm: {
    background: '#ef4444', border: 'none', color: '#fff',
    borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13,
  },
  cancelSmall: {
    background: 'none', border: '1px solid #e5e5e5', color: '#374151',
    borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13,
  },
  confirmRow: { display: 'flex', alignItems: 'center', gap: 8 },
  cancelBtn: {
    background: 'none', border: '1px solid #e5e5e5', color: '#374151',
    borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13,
  },
  saveBtn: {
    background: '#111', border: 'none', color: '#fff',
    borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
};
