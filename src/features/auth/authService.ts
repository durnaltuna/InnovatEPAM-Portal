import type { AuthUser, LoginInput, RegisterInput, Role } from '../../types/domain';

const USERS_KEY = 'innovatepam.users';
const SESSION_KEY = 'innovatepam.session';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  role: Role;
}

function seedUsersIfMissing(): void {
  const existing = localStorage.getItem(USERS_KEY);
  if (existing) {
    return;
  }

  const defaults: StoredUser[] = [
    {
      id: crypto.randomUUID(),
      email: 'admin@portal.local',
      password: 'admin123',
      role: 'admin'
    },
    {
      id: crypto.randomUUID(),
      email: 'submitter@portal.local',
      password: 'submit123',
      role: 'submitter'
    }
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
}

function getStoredUsers(): StoredUser[] {
  seedUsersIfMissing();
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as StoredUser[];
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const users = getStoredUsers();
  const exists = users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());

  if (exists) {
    throw new Error('User already exists.');
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    email: input.email.trim(),
    password: input.password,
    role: input.role
  };

  users.push(newUser);
  saveStoredUsers(users);

  const authUser = toAuthUser(newUser);
  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const users = getStoredUsers();
  const matched = users.find(
    (user) =>
      user.email.toLowerCase() === input.email.toLowerCase() &&
      user.password === input.password
  );

  if (!matched) {
    throw new Error('Invalid email or password.');
  }

  const authUser = toAuthUser(matched);
  localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  return authUser;
}

export async function logout(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
}

export function getSessionUser(): AuthUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as AuthUser;
}
