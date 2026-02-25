import type { Decision } from '../../types/domain';

interface DecisionSummaryProps {
  decision: Decision;
}

export function DecisionSummary({ decision }: DecisionSummaryProps) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 4,
        backgroundColor:
          decision.outcome === 'Accepted'
            ? '#e8f5e9'
            : decision.outcome === 'Rejected'
              ? '#ffebee'
              : '#fff3e0',
        borderLeft: `4px solid ${decision.outcome === 'Accepted' ? '#4caf50' : decision.outcome === 'Rejected' ? '#f44336' : '#ff9800'}`
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
        <strong>Decision:</strong> {decision.outcome}
      </p>
      {decision.comment && (
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontStyle: 'italic', color: '#333' }}>
          <strong>Comment:</strong> {decision.comment}
        </p>
      )}
      <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
        Decided: {new Date(decision.decidedAt).toLocaleString()}
      </p>
    </div>
  );
}
