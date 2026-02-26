import { useEffect, useState } from 'react';
import { deleteIdea, getAllIdeas } from '../ideas/ideaService';
import { deleteAttachment, getAttachmentByIdeaId } from '../ideas/attachmentService';
import { deleteDecisionsForIdea, makeDecision, getDecision } from './decisionService';
import { DecisionModal } from './DecisionModal';
import type { Idea, Decision, Attachment } from '../../types/domain';

export function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Decision | null>>({});
  const [attachments, setAttachments] = useState<Record<string, Attachment | null>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  async function loadIdeas(): Promise<void> {
    setIsLoading(true);
    setError('');
    try {
      const allIdeas = await getAllIdeas();
      setIdeas(allIdeas);

      // Load decisions for each idea
      const decs: Record<string, Decision | null> = {};
      const atts: Record<string, Attachment | null> = {};
      for (const idea of allIdeas) {
        decs[idea.id] = await getDecision(idea.id);
        atts[idea.id] = await getAttachmentByIdeaId(idea.id);
      }
      setDecisions(decs);
      setAttachments(atts);
    } catch (error) {
      console.error('Failed to load ideas:', error);
      setError('Failed to load ideas. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  async function handleDecision(ideaId: string, outcome: string, comment: string): Promise<void> {
    try {
      const adminId = 'test-admin-id'; // In real app, get from session
      await makeDecision(ideaId, adminId, outcome as any, comment);
      await loadIdeas(); // Refresh
      setShowModal(false);
      setSelectedIdea(null);
    } catch (error) {
      console.error('Failed to make decision:', error);
      setError('Failed to save decision. Please try again.');
    }
  }

  async function handleDeleteIdea(ideaId: string, ideaTitle: string): Promise<void> {
    const confirmed = window.confirm(`Delete idea "${ideaTitle}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteAttachment(ideaId);
      await deleteDecisionsForIdea(ideaId);
      await deleteIdea(ideaId);
      await loadIdeas();

      if (selectedIdea?.id === ideaId) {
        setShowModal(false);
        setSelectedIdea(null);
      }
    } catch (caught) {
      console.error('Failed to delete idea:', caught);
      setError('Failed to delete idea. Please try again.');
    }
  }

  function openDecisionModal(idea: Idea): void {
    setSelectedIdea(idea);
    setShowModal(true);
  }

  return (
    <main>
      <h2>Admin Ideas Review</h2>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {isLoading ? (
        <p>Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p style={{ color: '#666' }}>No ideas submitted yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 16
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Title</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Description</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Attachment</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Submitter</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Latest Decision</th>
                <th style={{ padding: 12, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ideas
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((idea) => {
                  const decision = decisions[idea.id];
                  const attachment = attachments[idea.id];
                  const canReview = idea.status === 'Submitted';
                  const canDecide = idea.status === 'Under Review';

                  return (
                    <tr key={idea.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: 12 }}>
                        <strong>{idea.title}</strong>
                      </td>
                      <td style={{ padding: 12, maxWidth: 320, whiteSpace: 'pre-wrap', fontSize: '14px' }}>{idea.description}</td>
                      <td style={{ padding: 12, fontSize: '12px', color: '#666' }}>
                        {attachment ? attachment.fileName : 'No attachment'}
                      </td>
                      <td style={{ padding: 12 }}>{idea.submitterId}</td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            backgroundColor:
                              idea.status === 'Submitted'
                                ? '#e3f2fd'
                                : idea.status === 'Under Review'
                                  ? '#fff3e0'
                                  : idea.status === 'Accepted'
                                    ? '#e8f5e9'
                                    : '#ffebee',
                            color:
                              idea.status === 'Submitted'
                                ? '#1976d2'
                                : idea.status === 'Under Review'
                                  ? '#f57c00'
                                  : idea.status === 'Accepted'
                                    ? '#388e3c'
                                    : '#d32f2f',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {idea.status}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontSize: '12px', color: '#666' }}>
                        {decision ? (
                          <>
                            <div>
                              <strong>{decision.outcome}</strong>
                            </div>
                            {decision.comment && (
                              <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                                "{decision.comment.substring(0, 40)}..."
                              </div>
                            )}
                          </>
                        ) : (
                          'None yet'
                        )}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                          {canReview && (
                            <button
                              type="button"
                              onClick={() => openDecisionModal(idea)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                              }}
                            >
                              Review
                            </button>
                          )}
                          {canDecide && (
                            <button
                              type="button"
                              onClick={() => openDecisionModal(idea)}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                              }}
                            >
                              Decide
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteIdea(idea.id, idea.title)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#d32f2f',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                          {!canReview && !canDecide && (
                            <span style={{ color: '#999', fontSize: '12px' }}>Decided</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      {showModal && selectedIdea && (
        <DecisionModal
          idea={selectedIdea}
          attachment={attachments[selectedIdea.id] ?? null}
          onConfirm={(outcome, comment) => handleDecision(selectedIdea.id, outcome, comment)}
          onClose={() => {
            setShowModal(false);
            setSelectedIdea(null);
          }}
        />
      )}
    </main>
  );
}
