import type { Idea, Decision } from '../../types/domain';
import { getDecision } from '../admin/decisionService';
import { getIdea } from './ideaService';

/**
 * Checks if a submitter is allowed to see a specific idea.
 * Submitters can only see their own ideas.
 */
export function isIdeaVisibleToSubmitter(idea: Idea, submitterId: string): boolean {
  return idea.submitterId === submitterId;
}

/**
 * Filters ideas to only those visible to a specific submitter.
 * Submitters can only see their own ideas.
 */
export function getSubmitterVisibleIdeas(ideas: Idea[], submitterId: string): Idea[] {
  return ideas.filter((idea) => isIdeaVisibleToSubmitter(idea, submitterId));
}

/**
 * Gets the latest decision for an idea, visible to the submitter if it's their idea.
 * Returns null if:
 * - No decision exists yet
 * - The submitter is not the idea's original submitter
 */
export async function getDecisionVisibleToSubmitter(
  ideaId: string,
  submitterId: string
): Promise<Decision | null> {
  // Load the idea to verify ownership
  const idea = await getIdea(ideaId);
  if (!idea) {
    return null;
  }

  // Check if the submitter owns this idea
  if (idea.submitterId !== submitterId) {
    return null;
  }

  // Get the decision (submitter can only see decisions for their own ideas)
  const decision = await getDecision(ideaId);
  return decision;
}

/**
 * Gets the latest decision for an idea with full context
 * (includes idea metadata along with decision)
 */
export async function getDecisionWithContext(ideaId: string) {
  const decision = await getDecision(ideaId);
  if (!decision) {
    return null;
  }

  return {
    decision,
    isAccepted: decision.outcome === 'Accepted',
    isRejected: decision.outcome === 'Rejected',
    isUnderReview: decision.outcome === 'Under Review',
    hasComment: Boolean(decision.comment)
  };
}
