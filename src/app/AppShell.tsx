import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getSessionUser, logout } from '../features/auth/authService';
import { canAccessAdminArea, isAuthenticated } from '../features/auth/guards';
import type { AuthUser } from '../types/domain';

export function AppShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(getSessionUser());

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  if (!isAuthenticated(user)) {
    return <Navigate to="/login" replace />;
  }

  async function handleLogout(): Promise<void> {
    await logout();
    setUser(null);
    navigate('/login', { replace: true });
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui',
        margin: '0 auto',
        maxWidth: 960,
        padding: 24,
        borderRadius: 20,
        border: '1px solid rgba(172, 186, 208, 0.42)',
        backgroundColor: 'rgba(255, 255, 255, 0.84)',
        boxShadow: '0 20px 48px -36px rgba(25, 47, 89, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h1>InnovatEPAM Portal</h1>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <p style={{ marginBottom: 18 }}>
        Signed in as <strong>{user.email}</strong> ({user.role})
      </p>
      <nav style={{ display: 'flex', gap: 16, marginBottom: 20, fontWeight: 600 }}>
        <Link to="/app">My Ideas</Link>
        {canAccessAdminArea(user) ? <Link to="/app/admin">Admin</Link> : null}
      </nav>
      <Outlet />
    </div>
  );
}
