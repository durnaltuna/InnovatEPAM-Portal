import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createIdea } from '../../src/features/ideas/ideaService';
import { makeDecision } from '../../src/features/admin/decisionService';
import { getDecisionVisibleToSubmitter } from '../../src/features/ideas/ideaQueries';
import { submitterFixture, adminFixture } from './fixtures';

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

describe('Decision and Comment Visibility', () => {
  let ideaId: string;

  beforeEach(async () => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();

    // Create a test idea
    const idea = await createIdea(submitterFixture.id, 'Test Idea', 'A great innovation', 'Technology');
    ideaId = idea.id;
  });

  describe('getDecisionVisibleToSubmitter', () => {
    it('should return null if no decision exists', async () => {
      const visible = await getDecisionVisibleToSubmitter(ideaId, submitterFixture.id);
      expect(visible).toBeNull();
    });

    it('should return decision comment for submitter own idea after Under Review transition', async () => {
      const comment = 'We are reviewing your idea';
      await makeDecision(ideaId, adminFixture.id, 'Under Review', comment);

      const visible = await getDecisionVisibleToSubmitter(ideaId, submitterFixture.id);
      expect(visible).toBeDefined();
      expect(visible?.outcome).toBe('Under Review');
      expect(visible?.comment).toBe(comment);
    });

    it('should return decision with comment when accepted', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');
      const acceptComment = 'Excellent innovation! Will be implemented';
      await new Promise((resolve) => setTimeout(resolve, 5));
      await makeDecision(ideaId, adminFixture.id, 'Accepted', acceptComment);

      const visible = await getDecisionVisibleToSubmitter(ideaId, submitterFixture.id);
      expect(visible?.outcome).toBe('Accepted');
      expect(visible?.comment).toBe(acceptComment);
    });

    it('should return decision with comment when rejected', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');
      const rejectComment = 'Does not fit current priorities';
      await new Promise((resolve) => setTimeout(resolve, 5));
      await makeDecision(ideaId, adminFixture.id, 'Rejected', rejectComment);

      const visible = await getDecisionVisibleToSubmitter(ideaId, submitterFixture.id);
      expect(visible?.outcome).toBe('Rejected');
      expect(visible?.comment).toBe(rejectComment);
    });

    it('should hide decision from other submitters', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'Private review comment');

      const otherSubmitterId = 'other-submitter-id';
      const visible = await getDecisionVisibleToSubmitter(ideaId, otherSubmitterId);
      expect(visible).toBeNull();
    });

    it('should reflect latest decision when multiple transitions occur', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'Initial review');
      await new Promise((resolve) => setTimeout(resolve, 5));
      const finalComment = 'Final decision: approved!';
      await makeDecision(ideaId, adminFixture.id, 'Accepted', finalComment);

      const visible = await getDecisionVisibleToSubmitter(ideaId, submitterFixture.id);
      expect(visible?.outcome).toBe('Accepted');
      expect(visible?.comment).toBe(finalComment);
    });

    it('should format decision metadata for display', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'Being reviewed');

      const visible = await getDecisionVisibleToSubmitter(ideaId, submitterFixture.id);
      expect(visible?.ideaId).toBe(ideaId);
      expect(visible?.decidedAt).toBeDefined();
      expect(visible?.decidedAt instanceof Date).toBe(true);
    });
  });
});
