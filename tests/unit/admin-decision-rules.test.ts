import { describe, it, expect } from 'vitest';
import { canTransitionTo, isValidDecisionComment } from '../../src/features/admin/decisionService';

describe('Admin Decision Rules', () => {
  describe('canTransitionTo', () => {
    it('should allow transition from Submitted to Under Review', () => {
      const result = canTransitionTo('Submitted', 'Under Review');
      expect(result.allowed).toBe(true);
    });

    it('should allow transition from Under Review to Accepted', () => {
      const result = canTransitionTo('Under Review', 'Accepted');
      expect(result.allowed).toBe(true);
    });

    it('should allow transition from Under Review to Rejected', () => {
      const result = canTransitionTo('Under Review', 'Rejected');
      expect(result.allowed).toBe(true);
    });

    it('should NOT allow transition from Submitted directly to Accepted', () => {
      const result = canTransitionTo('Submitted', 'Accepted');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Under Review');
    });

    it('should NOT allow transition from Submitted directly to Rejected', () => {
      const result = canTransitionTo('Submitted', 'Rejected');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Under Review');
    });

    it('should NOT allow transition from Accepted to Rejected', () => {
      const result = canTransitionTo('Accepted', 'Rejected');
      expect(result.allowed).toBe(false);
    });

    it('should NOT allow transition from Rejected to Accepted', () => {
      const result = canTransitionTo('Rejected', 'Accepted');
      expect(result.allowed).toBe(false);
    });

    it('should NOT allow transition to same status', () => {
      const result = canTransitionTo('Under Review', 'Under Review');
      expect(result.allowed).toBe(false);
    });
  });

  describe('isValidDecisionComment', () => {
    it('should require non-empty comment for Accepted outcome', () => {
      const result = isValidDecisionComment('Accepted', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept non-empty comment for Accepted outcome', () => {
      const result = isValidDecisionComment('Accepted', 'Good idea, approved.');
      expect(result.valid).toBe(true);
    });

    it('should require non-empty comment for Rejected outcome', () => {
      const result = isValidDecisionComment('Rejected', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept non-empty comment for Rejected outcome', () => {
      const result = isValidDecisionComment('Rejected', 'Does not align with strategy.');
      expect(result.valid).toBe(true);
    });

    it('should allow empty comment for Under Review outcome', () => {
      const result = isValidDecisionComment('Under Review', '');
      expect(result.valid).toBe(true);
    });

    it('should allow non-empty comment for Under Review outcome', () => {
      const result = isValidDecisionComment('Under Review', 'Reviewing your submission earnestly.');
      expect(result.valid).toBe(true);
    });

    it('should trim whitespace-only comments for validation', () => {
      const result = isValidDecisionComment('Accepted', '   ');
      expect(result.valid).toBe(false);
    });
  });
});
