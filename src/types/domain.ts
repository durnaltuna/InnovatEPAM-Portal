export type Role = 'submitter' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface IdeaFormInput {
  title: string;
  description: string;
  category: string;
  attachmentName?: string;
}
