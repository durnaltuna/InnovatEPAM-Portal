import type { Idea, IdeaStatus } from '../../types/domain';

const IDEAS_KEY = 'innovatepam.ideas';

interface StoredIdea extends Omit<Idea, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

function getStoredIdeas(): StoredIdea[] {
  const raw = localStorage.getItem(IDEAS_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as StoredIdea[];
}

function saveStoredIdeas(ideas: StoredIdea[]): void {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
}

function toIdea(stored: StoredIdea): Idea {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt)
  };
}

export async function createIdea(
  submitterId: string,
  title: string,
  description: string,
  category: string
): Promise<Idea> {
  const ideas = getStoredIdeas();

  const newIdea: StoredIdea = {
    id: crypto.randomUUID(),
    submitterId,
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ideas.push(newIdea);
  saveStoredIdeas(ideas);

  return toIdea(newIdea);
}

export async function getIdea(ideaId: string): Promise<Idea | null> {
  const ideas = getStoredIdeas();
  const stored = ideas.find((idea) => idea.id === ideaId);
  return stored ? toIdea(stored) : null;
}

export async function getIdeasBySubmitter(submitterId: string): Promise<Idea[]> {
  const ideas = getStoredIdeas();
  return ideas.filter((idea) => idea.submitterId === submitterId).map(toIdea);
}

export async function getAllIdeas(): Promise<Idea[]> {
  const ideas = getStoredIdeas();
  return ideas.map(toIdea);
}

export async function updateIdeaStatus(ideaId: string, status: IdeaStatus): Promise<Idea> {
  const ideas = getStoredIdeas();
  const idea = ideas.find((i) => i.id === ideaId);

  if (!idea) {
    throw new Error(`Idea ${ideaId} not found.`);
  }

  idea.status = status;
  idea.updatedAt = new Date().toISOString();
  saveStoredIdeas(ideas);

  return toIdea(idea);
}

export async function deleteIdea(ideaId: string): Promise<void> {
  const ideas = getStoredIdeas();
  const exists = ideas.some((idea) => idea.id === ideaId);

  if (!exists) {
    throw new Error(`Idea ${ideaId} not found.`);
  }

  const filtered = ideas.filter((idea) => idea.id !== ideaId);
  saveStoredIdeas(filtered);
}
