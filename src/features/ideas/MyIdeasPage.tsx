import { useEffect, useState } from 'react';
import { getSessionUser } from '../auth/authService';
import { getIdeasBySubmitter } from './ideaService';
import { getAttachmentByIdeaId } from './attachmentService';
import { getDecisionVisibleToSubmitter } from './ideaQueries';
import type { Idea, Attachment, Decision } from '../../types/domain';
import { IdeaForm } from './IdeaForm';
import { DecisionSummary } from './DecisionSummary';

export function MyIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [attachments, setAttachments] = useState<Record<string, Attachment | null>>({});
  const [decisions, setDecisions] = useState<Record<string, Decision | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function loadIdeas(): Promise<void> {
    setIsLoading(true);
    try {
      const user = getSessionUser();
      if (!user) {
        setIdeas([]);
        return;
      }

      const userIdeas = await getIdeasBySubmitter(user.id);
      setIdeas(userIdeas);

      // Load attachments for each idea
      const atts: Record<string, Attachment | null> = {};
      for (const idea of userIdeas) {
        atts[idea.id] = await getAttachmentByIdeaId(idea.id);
      }
      setAttachments(atts);

      // Load decisions for each idea
      const decs: Record<string, Decision | null> = {};
      for (const idea of userIdeas) {
        decs[idea.id] = await getDecisionVisibleToSubmitter(idea.id, user.id);
      }
      setDecisions(decs);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  return (
    <main>
      <h1>My Ideas</h1>

      <section style={{ marginBottom: 32 }}>
        <IdeaForm />
      </section>

      <section>
        <h2>Your Submitted Ideas ({ideas.length})</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : ideas.length === 0 ? (
          <p style={{ color: '#666' }}>No ideas submitted yet. Create your first idea above!</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {ideas
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((idea) => (
                <div
                  key={idea.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <h3>{idea.title}</h3>
                  <p style={{ margin: '8px 0', color: '#666' }}>
                    <strong>Status:</strong>{' '}
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
                  </p>
                  <p style={{ margin: '8px 0' }}>{idea.description}</p>
                  <p style={{ margin: '8px 0', fontSize: '12px', color: '#999' }}>
                    <strong>Category:</strong> {idea.category}
                  </p>
                  {attachments[idea.id] && (
                    <p style={{ margin: '8px 0', fontSize: '12px', color: '#666' }}>
                      <strong>Attachment:</strong> {attachments[idea.id]!.fileName} ✓
                    </p>
                  )}
                  {decisions[idea.id] && <DecisionSummary decision={decisions[idea.id]!} />}
                  <p style={{ margin: '8px 0', fontSize: '10px', color: '#bbb' }}>
                    Created: {new Date(idea.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
