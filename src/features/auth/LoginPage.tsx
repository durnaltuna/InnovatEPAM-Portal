import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from './authService';
import { mapError } from '../../services/errors';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('submitter@portal.local');
  const [password, setPassword] = useState('submit123');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate('/app', { replace: true });
    } catch (caught) {
      setError(mapError(caught));
    }
  }

  return (
    <main style={{ fontFamily: 'system-ui', margin: '0 auto', maxWidth: 480, padding: 24 }}>
      <h1>Login</h1>
      <p>Use default accounts: submitter@portal.local / submit123 or admin@portal.local / admin123.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        <button type="submit">Login</button>
      </form>
      <p>
        New user? <Link to="/register">Register</Link>
      </p>
    </main>
  );
}
