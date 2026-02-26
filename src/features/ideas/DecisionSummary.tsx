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
        borderRadius: 10,
        backgroundColor:
          decision.outcome === 'Accepted'
            ? '#e7f7ef'
            : decision.outcome === 'Rejected'
              ? '#ffe9ed'
              : '#fff2df',
        borderLeft: `4px solid ${decision.outcome === 'Accepted' ? '#2f8f61' : decision.outcome === 'Rejected' ? '#d0445f' : '#be7b15'}`
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
        <strong>Decision:</strong> {decision.outcome}
      </p>
      {decision.comment && (
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontStyle: 'italic', color: '#3e4d64' }}>
          <strong>Comment:</strong> {decision.comment}
        </p>
      )}
      <p style={{ margin: 0, fontSize: '11px', color: '#8291a8' }}>
        Decided: {new Date(decision.decidedAt).toLocaleString()}
      </p>
    </div>
  );
}
