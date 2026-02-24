import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createIdea, getIdeasBySubmitter, getIdea } from '../../src/features/ideas/ideaService';
import { uploadAttachment, getAttachmentByIdeaId } from '../../src/features/ideas/attachmentService';
import { submitterFixture } from './fixtures';

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

describe('idea submission integration', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();
  });

  it('creates idea with Submitted status', async () => {
    const idea = await createIdea(submitterFixture.id, 'Test Idea', 'Test Description', 'Process');
    expect(idea.status).toBe('Submitted');
    expect(idea.title).toBe('Test Idea');
    expect(idea.submitterId).toBe(submitterFixture.id);
  });

  it('persists idea and can retrieve by id', async () => {
    const created = await createIdea(submitterFixture.id, 'Test Idea', 'Test Description', 'Process');
    const retrieved = await getIdea(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.title).toBe('Test Idea');
    expect(retrieved?.status).toBe('Submitted');
  });

  it('lists all ideas for submitter', async () => {
    const idea1 = await createIdea(submitterFixture.id, 'Idea 1', 'Desc 1', 'Process');
    const idea2 = await createIdea(submitterFixture.id, 'Idea 2', 'Desc 2', 'Technology');

    const ideas = await getIdeasBySubmitter(submitterFixture.id);

    expect(ideas).toHaveLength(2);
    expect(ideas.map((i) => i.id)).toContain(idea1.id);
    expect(ideas.map((i) => i.id)).toContain(idea2.id);
  });

  it('only lists ideas for specific submitter', async () => {
    const otherSubmitterId = 'other-submitter-id';

    const idea1 = await createIdea(submitterFixture.id, 'My Idea', 'My Desc', 'Process');
    const idea2 = await createIdea(otherSubmitterId, 'Other Idea', 'Other Desc', 'Process');

    const myIdeas = await getIdeasBySubmitter(submitterFixture.id);
    const otherIdeas = await getIdeasBySubmitter(otherSubmitterId);

    expect(myIdeas).toHaveLength(1);
    expect(myIdeas[0]!.id).toBe(idea1.id);
    expect(otherIdeas).toHaveLength(1);
    expect(otherIdeas[0]!.id).toBe(idea2.id);
  });

  it('uploads attachment for idea', async () => {
    const idea = await createIdea(submitterFixture.id, 'Test Idea', 'Test Description', 'Process');

    // Create a mock file
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    const attachment = await uploadAttachment(idea.id, mockFile);

    expect(attachment.ideaId).toBe(idea.id);
    expect(attachment.fileName).toBe('test.txt');
  });

  it('retrieves attachment by idea id', async () => {
    const idea = await createIdea(submitterFixture.id, 'Test Idea', 'Test Description', 'Process');
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const uploaded = await uploadAttachment(idea.id, mockFile);

    const retrieved = await getAttachmentByIdeaId(idea.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(uploaded.id);
    expect(retrieved?.fileName).toBe('test.txt');
  });

  it('prevents multiple attachments per idea', async () => {
    const idea = await createIdea(submitterFixture.id, 'Test Idea', 'Test Description', 'Process');
    const file1 = new File(['content 1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content 2'], 'file2.txt', { type: 'text/plain' });

    await uploadAttachment(idea.id, file1);

    await expect(uploadAttachment(idea.id, file2)).rejects.toThrow(
      'Idea already has an attachment'
    );
  });

  it('complete submission flow: create idea + upload attachment', async () => {
    // Create idea
    const idea = await createIdea(submitterFixture.id, 'Full Test Idea', 'Full Test Desc', 'Innovation');

    // Verify idea created with Submitted status
    expect(idea.status).toBe('Submitted');

    // Upload attachment
    const mockFile = new File(['pdf content'], 'proposal.pdf', { type: 'application/pdf' });
    await uploadAttachment(idea.id, mockFile);

    // Verify both can be retrieved
    const retrievedIdea = await getIdea(idea.id);
    const retrievedAttachment = await getAttachmentByIdeaId(idea.id);

    expect(retrievedIdea?.title).toBe('Full Test Idea');
    expect(retrievedIdea?.status).toBe('Submitted');
    expect(retrievedAttachment?.fileName).toBe('proposal.pdf');
  });
});
