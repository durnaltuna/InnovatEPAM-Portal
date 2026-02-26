import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createIdea, deleteIdea, getIdea } from '../../src/features/ideas/ideaService';
import { deleteAttachment, getAttachmentByIdeaId, uploadAttachment } from '../../src/features/ideas/attachmentService';
import {
  deleteDecisionsForIdea,
  makeDecision,
  getDecision,
  getDecisionHistory
} from '../../src/features/admin/decisionService';
import { adminFixture, submitterFixture } from './fixtures';
import type { Idea } from '../../src/types/domain';

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

describe('Admin Decision Persistence', () => {
  let ideaId: string;
  let idea: Idea;

  beforeEach(async () => {
    // Mock localStorage
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();

    // Create a test idea
    idea = await createIdea(submitterFixture.id, 'Test Idea', 'A great innovation', 'Technology');
    ideaId = idea.id;
  });

  describe('makeDecision', () => {
    it('should persist decision when transitioning to Under Review with optional comment', async () => {
      const comment = 'Reviewing this carefully';
      const decision = await makeDecision(ideaId, adminFixture.id, 'Under Review', comment);

      expect(decision).toBeDefined();
      expect(decision.ideaId).toBe(ideaId);
      expect(decision.adminId).toBe(adminFixture.id);
      expect(decision.outcome).toBe('Under Review');
      expect(decision.comment).toBe(comment);
    });

    it('should persist decision when transitioning to Accepted with required comment', async () => {
      // First transition to Under Review
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');

      // Then to Accepted
      const comment = 'Excellent idea, approved for implementation';
      const decision = await makeDecision(ideaId, adminFixture.id, 'Accepted', comment);

      expect(decision.outcome).toBe('Accepted');
      expect(decision.comment).toBe(comment);
    });

    it('should persist decision when transitioning to Rejected with required comment', async () => {
      // First transition to Under Review
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');

      // Then to Rejected
      const comment = 'Does not align with current roadmap';
      const decision = await makeDecision(ideaId, adminFixture.id, 'Rejected', comment);

      expect(decision.outcome).toBe('Rejected');
      expect(decision.comment).toBe(comment);
    });

    it('should update idea status in parallel with decision persistence', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');

      const updatedIdea = await getIdea(ideaId);
      expect(updatedIdea?.status).toBe('Under Review');
    });

    it('should throw error if comment required but not provided for Accepted', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');

      const promise = makeDecision(ideaId, adminFixture.id, 'Accepted', '');
      await expect(promise).rejects.toThrow(/comment.*required/i);
    });

    it('should throw error if comment required but not provided for Rejected', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');

      const promise = makeDecision(ideaId, adminFixture.id, 'Rejected', '');
      await expect(promise).rejects.toThrow(/comment.*required/i);
    });

    it('should throw error if invalid state transition attempted', async () => {
      const promise = makeDecision(ideaId, adminFixture.id, 'Accepted', 'approval comment');
      await expect(promise).rejects.toThrow(/cannot.*transition/i);
    });
  });

  describe('getDecision', () => {
    it('should retrieve the latest decision for an idea', async () => {
      const expectedComment = 'Under review';
      await makeDecision(ideaId, adminFixture.id, 'Under Review', expectedComment);

      const decision = await getDecision(ideaId);
      expect(decision).toBeDefined();
      expect(decision?.outcome).toBe('Under Review');
      expect(decision?.comment).toBe(expectedComment);
    });

    it('should return null if no decision exists yet', async () => {
      const decision = await getDecision(ideaId);
      expect(decision).toBeNull();
    });

    it('should reflect most recent decision after multiple transitions', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'First review');
      await new Promise((resolve) => setTimeout(resolve, 5)); // Ensure timestamp differs
      await makeDecision(ideaId, adminFixture.id, 'Accepted', 'Approved!');

      const decision = await getDecision(ideaId);
      expect(decision?.outcome).toBe('Accepted');
      expect(decision?.comment).toBe('Approved!');
    });
  });

  describe('getDecisionHistory', () => {
    it('should return empty array if no decisions made', async () => {
      const history = await getDecisionHistory(ideaId);
      expect(history).toEqual([]);
    });

    it('should track all decision transitions', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'Reviewing');
      await makeDecision(ideaId, adminFixture.id, 'Accepted', 'Great idea!');

      const history = await getDecisionHistory(ideaId);
      expect(history.length).toBe(2);
      expect(history[0]!.toStatus).toBe('Under Review');
      expect(history[1]!.toStatus).toBe('Accepted');
    });

    it('should record decision metadata in history', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'Reviewing');

      const history = await getDecisionHistory(ideaId);
      expect(history[0]).toBeDefined();
      expect(history[0]!.ideaId).toBe(ideaId);
      expect(history[0]!.actorId).toBe(adminFixture.id);
      expect(history[0]!.toStatus).toBe('Under Review');
      expect(history[0]!.createdAt).toBeDefined();
    });

    it('should maintain chronological order', async () => {
      await makeDecision(ideaId, adminFixture.id, 'Under Review', '');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await makeDecision(ideaId, adminFixture.id, 'Accepted', 'OK');

      const history = await getDecisionHistory(ideaId);
      const times = history.map((h) => new Date(h.createdAt).getTime());
      expect(times.length).toBeGreaterThanOrEqual(2);
      expect(times[1]!).toBeGreaterThanOrEqual(times[0]!);
    });
  });

  describe('delete cleanup flow', () => {
    it('removes idea, attachment, decision, and history for a deleted idea', async () => {
      const file = new File(['sample'], 'evidence.txt', { type: 'text/plain' });
      await uploadAttachment(ideaId, file);
      await makeDecision(ideaId, adminFixture.id, 'Under Review', 'triage');
      await makeDecision(ideaId, adminFixture.id, 'Accepted', 'approved');

      await deleteAttachment(ideaId);
      await deleteDecisionsForIdea(ideaId);
      await deleteIdea(ideaId);

      const deletedIdea = await getIdea(ideaId);
      const deletedAttachment = await getAttachmentByIdeaId(ideaId);
      const deletedDecision = await getDecision(ideaId);
      const deletedHistory = await getDecisionHistory(ideaId);

      expect(deletedIdea).toBeNull();
      expect(deletedAttachment).toBeNull();
      expect(deletedDecision).toBeNull();
      expect(deletedHistory).toEqual([]);
    });
  });
});
