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

export type IdeaStatus = 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';

export interface Idea {
  id: string;
  submitterId: string;
  title: string;
  description: string;
  category: string;
  status: IdeaStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  ideaId: string;
  fileName: string;
  filePath: string;
  uploadedAt: Date;
}

export interface Decision {
  id: string;
  ideaId: string;
  adminId: string;
  outcome: IdeaStatus;
  comment: string;
  decidedAt: Date;
}

export interface DecisionHistoryEntry {
  id: string;
  ideaId: string;
  fromStatus: IdeaStatus | null;
  toStatus: IdeaStatus;
  comment: string | null;
  actorId: string;
  createdAt: Date;
}
