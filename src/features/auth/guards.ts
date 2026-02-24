import type { AuthUser, Role } from '../../types/domain';

export function isAuthenticated(user: AuthUser | null): user is AuthUser {
  return Boolean(user);
}

export function hasRole(user: AuthUser | null, role: Role): boolean {
  return user?.role === role;
}

export function canAccessSubmitterArea(user: AuthUser | null): boolean {
  return hasRole(user, 'submitter') || hasRole(user, 'admin');
}

export function canAccessAdminArea(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}
