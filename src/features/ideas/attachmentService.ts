import type { Attachment } from '../../types/domain';

const ATTACHMENTS_KEY = 'innovatepam.attachments';

interface StoredAttachment extends Omit<Attachment, 'uploadedAt'> {
  uploadedAt: string;
  fileSize: number; // Store size instead of actual file data
  fileType: string;
}

function getStoredAttachments(): StoredAttachment[] {
  const raw = localStorage.getItem(ATTACHMENTS_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as StoredAttachment[];
}

function saveStoredAttachments(attachments: StoredAttachment[]): void {
  localStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(attachments));
}

function toAttachment(stored: StoredAttachment): Attachment {
  return {
    id: stored.id,
    ideaId: stored.ideaId,
    fileName: stored.fileName,
    filePath: stored.filePath,
    uploadedAt: new Date(stored.uploadedAt)
  };
}

export async function uploadAttachment(ideaId: string, file: File): Promise<Attachment> {
  const attachments = getStoredAttachments();

  // Check if idea already has attachment
  const existing = attachments.find((att) => att.ideaId === ideaId);
  if (existing) {
    throw new Error('Idea already has an attachment. Remove it first to upload a new one.');
  }

  // For MVP: store only metadata, not the actual file bytes
  // In production, this would upload to Supabase Storage or similar
  const newAttachment: StoredAttachment = {
    id: crypto.randomUUID(),
    ideaId,
    fileName: file.name,
    filePath: `attachments/${ideaId}/${file.name}`,
    uploadedAt: new Date().toISOString(),
    fileSize: file.size,
    fileType: file.type
  };

  attachments.push(newAttachment);
  saveStoredAttachments(attachments);

  return toAttachment(newAttachment);
}

export async function getAttachmentByIdeaId(ideaId: string): Promise<Attachment | null> {
  const attachments = getStoredAttachments();
  const stored = attachments.find((att) => att.ideaId === ideaId);
  return stored ? toAttachment(stored) : null;
}

export async function deleteAttachment(ideaId: string): Promise<void> {
  const attachments = getStoredAttachments();
  const filtered = attachments.filter((att) => att.ideaId !== ideaId);
  saveStoredAttachments(filtered);
}
