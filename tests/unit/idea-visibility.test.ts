import { describe, it, expect } from 'vitest';
import { getSubmitterVisibleIdeas, isIdeaVisibleToSubmitter } from '../../src/features/ideas/ideaQueries';
import type { Idea } from '../../src/types/domain';

const SUBMITTER_ID = 'test-submitter-id';
const OTHER_ID = 'test-other-id';

describe('Submitter Idea Visibility Filters', () => {
  describe('isIdeaVisibleToSubmitter', () => {
    it('should allow submitter to see own submitted idea', () => {
      const idea: Idea = {
        id: 'idea-1',
        submitterId: SUBMITTER_ID,
        title: 'My Idea',
        description: 'My description',
        category: 'Technology',
        status: 'Submitted',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const visible = isIdeaVisibleToSubmitter(idea, SUBMITTER_ID);
      expect(visible).toBe(true);
    });

    it('should NOT allow submitter to see other submitter ideas', () => {
      const idea: Idea = {
        id: 'idea-1',
        submitterId: OTHER_ID,
        title: 'Someone else idea',
        description: 'Not mine',
        category: 'Technology',
        status: 'Submitted',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const visible = isIdeaVisibleToSubmitter(idea, SUBMITTER_ID);
      expect(visible).toBe(false);
    });

    it('should show idea with Under Review status', () => {
      const idea: Idea = {
        id: 'idea-1',
        submitterId: SUBMITTER_ID,
        title: 'My Idea',
        description: 'Under review',
        category: 'Technology',
        status: 'Under Review',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const visible = isIdeaVisibleToSubmitter(idea, SUBMITTER_ID);
      expect(visible).toBe(true);
    });

    it('should show idea with Accepted status', () => {
      const idea: Idea = {
        id: 'idea-1',
        submitterId: SUBMITTER_ID,
        title: 'My Idea',
        description: 'Accepted',
        category: 'Technology',
        status: 'Accepted',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const visible = isIdeaVisibleToSubmitter(idea, SUBMITTER_ID);
      expect(visible).toBe(true);
    });

    it('should show idea with Rejected status', () => {
      const idea: Idea = {
        id: 'idea-1',
        submitterId: SUBMITTER_ID,
        title: 'My Idea',
        description: 'Rejected',
        category: 'Technology',
        status: 'Rejected',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const visible = isIdeaVisibleToSubmitter(idea, SUBMITTER_ID);
      expect(visible).toBe(true);
    });
  });

  describe('getSubmitterVisibleIdeas', () => {
    it('should return empty list if no ideas match submitter', () => {
      const ideas: Idea[] = [
        {
          id: 'idea-1',
          submitterId: OTHER_ID,
          title: 'Admin idea',
          description: 'Not for this submitter',
          category: 'Technology',
          status: 'Submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const visible = getSubmitterVisibleIdeas(ideas, SUBMITTER_ID);
      expect(visible).toEqual([]);
    });

    it('should return only submitter own ideas', () => {
      const ideas: Idea[] = [
        {
          id: 'idea-1',
          submitterId: SUBMITTER_ID,
          title: 'My Idea 1',
          description: 'Description 1',
          category: 'Technology',
          status: 'Submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'idea-2',
          submitterId: OTHER_ID,
          title: 'Admin Idea',
          description: 'Not mine',
          category: 'Process',
          status: 'Submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'idea-3',
          submitterId: SUBMITTER_ID,
          title: 'My Idea 2',
          description: 'Description 2',
          category: 'Technology',
          status: 'Under Review',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const visible = getSubmitterVisibleIdeas(ideas, SUBMITTER_ID);
      expect(visible).toHaveLength(2);
      expect(visible[0]!.id).toBe('idea-1');
      expect(visible[1]!.id).toBe('idea-3');
    });

    it('should filter out ideas with all statuses', () => {
      const ideas: Idea[] = [
        {
          id: 'idea-1',
          submitterId: SUBMITTER_ID,
          title: 'Submitted',
          description: 'Desc',
          category: 'Tech',
          status: 'Submitted',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'idea-2',
          submitterId: SUBMITTER_ID,
          title: 'Under Review',
          description: 'Desc',
          category: 'Tech',
          status: 'Under Review',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'idea-3',
          submitterId: SUBMITTER_ID,
          title: 'Accepted',
          description: 'Desc',
          category: 'Tech',
          status: 'Accepted',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'idea-4',
          submitterId: SUBMITTER_ID,
          title: 'Rejected',
          description: 'Desc',
          category: 'Tech',
          status: 'Rejected',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const visible = getSubmitterVisibleIdeas(ideas, SUBMITTER_ID);
      expect(visible).toHaveLength(4);
      const statuses = visible.map((i) => i.status);
      expect(statuses[0]).toBe('Submitted');
      expect(statuses[1]).toBe('Under Review');
      expect(statuses[2]).toBe('Accepted');
      expect(statuses[3]).toBe('Rejected');
    });
  });
});
