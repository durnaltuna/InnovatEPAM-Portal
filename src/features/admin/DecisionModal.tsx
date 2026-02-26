import { useState } from 'react';
import { isValidDecisionComment } from './decisionService';
import type { Attachment, Idea, IdeaStatus } from '../../types/domain';

interface DecisionModalProps {
  idea: Idea;
  attachment: Attachment | null;
  onConfirm: (outcome: string, comment: string) => void;
  onClose: () => void;
}

export function DecisionModal({ idea, attachment, onConfirm, onClose }: DecisionModalProps) {
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
        backgroundColor: 'rgba(20, 31, 53, 0.34)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid rgba(172, 186, 208, 0.42)',
          borderRadius: 14,
          padding: 24,
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 20px 46px -26px rgba(22, 40, 74, 0.8)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{idea.title}</h3>
        <p style={{ color: '#6f7f96', marginBottom: 16 }}>{idea.description}</p>
        <p style={{ color: '#6f7f96', marginBottom: 16, fontSize: 13 }}>
          <strong>Attachment:</strong> {attachment ? attachment.fileName : 'None'}
        </p>

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
              border: '1px solid rgba(172, 186, 208, 0.42)',
              borderRadius: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
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
              {requiresComment && <span style={{ color: '#d0445f' }}> *</span>}
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
                border: '1px solid rgba(172, 186, 208, 0.42)',
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: 80,
                boxSizing: 'border-box'
              }}
            />
            {requiresComment && (
              <p style={{ fontSize: 12, color: '#6f7f96', marginTop: 4 }}>
                Comment is required for {selectedOutcome} decision.
              </p>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              color: '#d0445f',
              marginBottom: 16,
              padding: 8,
              backgroundColor: '#ffe9ed',
              borderRadius: 8,
              border: '1px solid rgba(208, 68, 95, 0.2)'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'rgba(236, 241, 250, 0.95)',
              color: '#2f3b51',
              border: '1px solid rgba(172, 186, 208, 0.6)',
              borderRadius: 10,
              boxShadow: 'none',
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
              backgroundColor: selectedOutcome && isCommentValid ? '#2f8f61' : '#b3bdd3',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              boxShadow: selectedOutcome && isCommentValid ? '0 8px 20px -12px rgba(34, 115, 76, 0.9)' : 'none',
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
