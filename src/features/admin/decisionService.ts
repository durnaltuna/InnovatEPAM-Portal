import type { IdeaStatus, DecisionHistoryEntry } from '../../types/domain';
import { updateIdeaStatus } from '../ideas/ideaService';

const DECISIONS_KEY = 'innovatepam.decisions';
const DECISION_HISTORY_KEY = 'innovatepam.decisionHistory';

interface StoredDecision {
  id: string;
  ideaId: string;
  adminId: string;
  outcome: IdeaStatus;
  comment: string;
  decidedAt: string;
}

interface StoredDecisionHistoryEntry extends Omit<DecisionHistoryEntry, 'createdAt'> {
  createdAt: string;
}

export interface Decision {
  id: string;
  ideaId: string;
  adminId: string;
  outcome: IdeaStatus;
  comment: string;
  decidedAt: Date;
}

function getStoredDecisions(): StoredDecision[] {
  const raw = localStorage.getItem(DECISIONS_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as StoredDecision[];
}

function saveStoredDecisions(decisions: StoredDecision[]): void {
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
}

function getStoredDecisionHistory(): StoredDecisionHistoryEntry[] {
  const raw = localStorage.getItem(DECISION_HISTORY_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw) as StoredDecisionHistoryEntry[];
}

function saveStoredDecisionHistory(history: StoredDecisionHistoryEntry[]): void {
  localStorage.setItem(DECISION_HISTORY_KEY, JSON.stringify(history));
}

function toDecision(stored: StoredDecision): Decision {
  return {
    ...stored,
    decidedAt: new Date(stored.decidedAt)
  };
}

function toDecisionHistoryEntry(stored: StoredDecisionHistoryEntry): DecisionHistoryEntry {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt)
  };
}

/**
 * Determines if a status transition is allowed.
 * Returns { allowed: boolean, reason?: string }
 */
export function canTransitionTo(
  fromStatus: IdeaStatus,
  toStatus: IdeaStatus
): { allowed: boolean; reason?: string } {
  // Same status not allowed
  if (fromStatus === toStatus) {
    return { allowed: false, reason: 'Cannot transition to the same status.' };
  }

  // Allowed transitions
  const allowed: Record<IdeaStatus, IdeaStatus[]> = {
    Submitted: ['Under Review'],
    'Under Review': ['Accepted', 'Rejected'],
    Accepted: [],
    Rejected: []
  };

  const validNextStatuses = allowed[fromStatus] || [];
  if (!validNextStatuses.includes(toStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition from ${fromStatus} to ${toStatus}. Must go through Under Review first.`
    };
  }

  return { allowed: true };
}

/**
 * Validates if a comment is appropriate for the given outcome.
 */
export function isValidDecisionComment(
  outcome: IdeaStatus,
  comment: string
): { valid: boolean; error?: string } {
  const trimmed = comment.trim();

  if (outcome === 'Accepted' || outcome === 'Rejected') {
    if (!trimmed) {
      return {
        valid: false,
        error: `Comment is required for ${outcome} outcome.`
      };
    }
  }

  // Under Review allows optional comment
  return { valid: true };
}

/**
 * Makes a decision on an idea (transitions its status and records the decision).
 */
export async function makeDecision(
  ideaId: string,
  adminId: string,
  outcome: IdeaStatus,
  comment: string
): Promise<Decision> {
  const decisions = getStoredDecisions();
  const currentDecision = decisions.find((d) => d.ideaId === ideaId);
  const currentStatus = currentDecision?.outcome ?? 'Submitted';

  // Validate transition
  const transition = canTransitionTo(currentStatus as IdeaStatus, outcome);
  if (!transition.allowed) {
    throw new Error(`Invalid transition: ${transition.reason}`);
  }

  // Validate comment
  const commentValidation = isValidDecisionComment(outcome, comment);
  if (!commentValidation.valid) {
    throw new Error(commentValidation.error);
  }

  // Update idea status
  await updateIdeaStatus(ideaId, outcome);

  // Create new decision
  const newDecision: StoredDecision = {
    id: crypto.randomUUID(),
    ideaId,
    adminId,
    outcome,
    comment: comment.trim(),
    decidedAt: new Date().toISOString()
  };

  decisions.push(newDecision);
  saveStoredDecisions(decisions);

  // Record in history
  const history = getStoredDecisionHistory();
  const historyEntry: StoredDecisionHistoryEntry = {
    id: crypto.randomUUID(),
    ideaId,
    fromStatus: currentStatus,
    toStatus: outcome,
    comment: comment.trim() || null,
    actorId: adminId,
    createdAt: new Date().toISOString()
  };

  history.push(historyEntry);
  saveStoredDecisionHistory(history);

  return toDecision(newDecision);
}

/**
 * Gets the latest decision for an idea.
 */
export async function getDecision(ideaId: string): Promise<Decision | null> {
  const decisions = getStoredDecisions();
  const forIdea = decisions.filter((d) => d.ideaId === ideaId);

  if (forIdea.length === 0) {
    return null;
  }

  // Sort by decidedAt timestamp descending, use array index as tiebreaker
  let latest: StoredDecision | undefined = forIdea[0];
  for (const decision of forIdea) {
    if (latest === undefined) {
      latest = decision;
      continue;
    }
    const latestTime = new Date(latest.decidedAt).getTime();
    const currentTime = new Date(decision.decidedAt).getTime();
    if (currentTime > latestTime) {
      latest = decision;
    }
  }

  return latest ? toDecision(latest) : null;
}

/**
 * Gets all decision history entries for an idea.
 */
export async function getDecisionHistory(ideaId: string): Promise<DecisionHistoryEntry[]> {
  const history = getStoredDecisionHistory();
  return history
    .filter((h) => h.ideaId === ideaId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(toDecisionHistoryEntry);
}

/**
 * Gets all decisions (for admin list views).
 */
export async function getAllDecisions(): Promise<Decision[]> {
  const decisions = getStoredDecisions();
  return decisions.map(toDecision);
}

export async function deleteDecisionsForIdea(ideaId: string): Promise<void> {
  const decisions = getStoredDecisions();
  const filteredDecisions = decisions.filter((decision) => decision.ideaId !== ideaId);
  saveStoredDecisions(filteredDecisions);

  const history = getStoredDecisionHistory();
  const filteredHistory = history.filter((entry) => entry.ideaId !== ideaId);
  saveStoredDecisionHistory(filteredHistory);
}
