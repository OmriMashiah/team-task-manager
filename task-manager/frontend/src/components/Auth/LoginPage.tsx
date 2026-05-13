import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.heading}>Task Manager</h1>
        <p style={styles.sub}>Sign in to your team workspace</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@team.com"
            required
            autoFocus
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    padding: '40px 36px',
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  heading: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111' },
  sub: { margin: 0, fontSize: 14, color: '#6b7280' },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 14,
    color: '#dc2626',
  },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500, color: '#374151' },
  input: {
    padding: '9px 12px',
    borderRadius: 6,
    border: '1px solid #e5e5e5',
    fontSize: 14,
    outline: 'none',
    color: '#111',
    fontFamily: 'inherit',
  },
  btn: {
    marginTop: 8,
    padding: '10px 16px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
