import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSessionUser, login, logout } from '../../src/features/auth/authService';
import { adminFixture, submitterFixture } from './fixtures';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

describe('auth service login integration', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();
  });

  it('logs in with valid submitter credentials', async () => {
    const user = await login(submitterFixture);
    expect(user.email).toBe(submitterFixture.email);
    expect(user.role).toBe('submitter');
    expect(getSessionUser()?.email).toBe(submitterFixture.email);
  });

  it('logs in with valid admin credentials', async () => {
    const user = await login(adminFixture);
    expect(user.email).toBe(adminFixture.email);
    expect(user.role).toBe('admin');
  });

  it('fails for invalid credentials', async () => {
    await expect(login({ email: 'wrong@portal.local', password: 'bad' })).rejects.toThrow(
      'Invalid email or password.'
    );
  });

  it('clears session on logout', async () => {
    await login(submitterFixture);
    await logout();
    expect(getSessionUser()).toBeNull();
  });
});
