import { useState } from 'react';
import { isValidDecisionComment } from './decisionService';
import type { Idea, IdeaStatus } from '../../types/domain';

interface DecisionModalProps {
  idea: Idea;
  onConfirm: (outcome: string, comment: string) => void;
  onClose: () => void;
}

export function DecisionModal({ idea, onConfirm, onClose }: DecisionModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const currentStatus = idea.status;

  // Get available transitions
  function getAvailableOutcomes(): IdeaStatus[] {
    const outcomes: IdeaStatus[] = [];

    if (currentStatus === 'Submitted') {
      outcomes.push('Under Review');
    } else if (currentStatus === 'Under Review') {
      outcomes.push('Accepted', 'Rejected');
    }

    return outcomes;
  }

  function handleConfirm(): void {
    setError('');

    if (!selectedOutcome) {
      setError('Please select a decision outcome.');
      return;
    }

    const validation = isValidDecisionComment(selectedOutcome as IdeaStatus, comment);
    if (!validation.valid) {
      setError(validation.error || 'Invalid decision');
      return;
    }

    onConfirm(selectedOutcome, comment);
  }

  const availableOutcomes = getAvailableOutcomes();
  const requiresComment = selectedOutcome === 'Accepted' || selectedOutcome === 'Rejected';
  const isCommentValid = !requiresComment || comment.trim().length > 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 24,
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{idea.title}</h3>
        <p style={{ color: '#666', marginBottom: 16 }}>{idea.description}</p>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="decision" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Decision Action:
          </label>
          <select
            id="decision"
            value={selectedOutcome}
            onChange={(e) => {
              setSelectedOutcome(e.target.value);
              setComment('');
              setError('');
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 14
            }}
          >
            <option value="">-- Select Action --</option>
            {availableOutcomes.map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome}
              </option>
            ))}
          </select>
        </div>

        {selectedOutcome && (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="comment" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Comment:
              {requiresComment && <span style={{ color: '#d32f2f' }}> *</span>}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
              }}
              placeholder={requiresComment ? 'Please provide a comment for this decision' : 'Optional comment'}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: 80,
                boxSizing: 'border-box'
              }}
            />
            {requiresComment && (
              <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Comment is required for {selectedOutcome} decision.
              </p>
            )}
          </div>
        )}

        {error && (
          <div style={{ color: '#d32f2f', marginBottom: 16, padding: 8, backgroundColor: '#ffebee', borderRadius: 4 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedOutcome || !isCommentValid}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedOutcome && isCommentValid ? '#4caf50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: selectedOutcome && isCommentValid ? 'pointer' : 'not-allowed'
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
