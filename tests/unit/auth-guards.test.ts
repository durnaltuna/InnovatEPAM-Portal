import { describe, expect, it } from 'vitest';
import { canAccessAdminArea, canAccessSubmitterArea, hasRole, isAuthenticated } from '../../src/features/auth/guards';
import type { AuthUser } from '../../src/types/domain';

const submitter: AuthUser = {
  id: '1',
  email: 'submitter@portal.local',
  role: 'submitter'
};

const admin: AuthUser = {
  id: '2',
  email: 'admin@portal.local',
  role: 'admin'
};

describe('auth guards', () => {
  it('detects authenticated user', () => {
    expect(isAuthenticated(submitter)).toBe(true);
    expect(isAuthenticated(null)).toBe(false);
  });

  it('checks roles correctly', () => {
    expect(hasRole(admin, 'admin')).toBe(true);
    expect(hasRole(submitter, 'admin')).toBe(false);
  });

  it('enforces submitter/admin route access', () => {
    expect(canAccessSubmitterArea(submitter)).toBe(true);
    expect(canAccessSubmitterArea(admin)).toBe(true);
    expect(canAccessAdminArea(submitter)).toBe(false);
    expect(canAccessAdminArea(admin)).toBe(true);
  });
});
