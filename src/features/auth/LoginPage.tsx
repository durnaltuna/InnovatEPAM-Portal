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
    <main
      style={{
        fontFamily: 'system-ui',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 480,
          width: '100%',
          padding: 28,
          transform: 'translateY(-28px)',
        borderRadius: 18,
        border: '1px solid rgba(172, 186, 208, 0.42)',
        backgroundColor: 'rgba(255, 255, 255, 0.86)',
        boxShadow: '0 20px 50px -36px rgba(25, 47, 89, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <h1>Login</h1>
      <p>Use default accounts: submitter@portal.local / submit123 or admin@portal.local / admin123.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
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

        {error ? <p style={{ color: '#d0445f' }}>{error}</p> : null}
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 16 }}>
        New user? <Link to="/register">Register</Link>
      </p>
      </div>
    </main>
  );
}
