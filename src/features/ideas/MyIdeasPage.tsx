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
        <IdeaForm onSubmitted={loadIdeas} />
      </section>

      <section>
        <h2>Your Submitted Ideas ({ideas.length})</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : ideas.length === 0 ? (
          <p style={{ color: '#6f7f96' }}>No ideas submitted yet. Create your first idea above!</p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {ideas
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((idea) => (
                <div
                  key={idea.id}
                  style={{
                    border: '1px solid rgba(172, 186, 208, 0.42)',
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: 'rgba(255, 255, 255, 0.78)',
                    boxShadow: '0 14px 32px -28px rgba(22, 40, 74, 0.85)'
                  }}
                >
                  <h3>{idea.title}</h3>
                  <p style={{ margin: '8px 0', color: '#6f7f96' }}>
                    <strong>Status:</strong>{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 999,
                        backgroundColor:
                          idea.status === 'Submitted'
                            ? '#e8eeff'
                            : idea.status === 'Under Review'
                              ? '#fff2df'
                              : idea.status === 'Accepted'
                                ? '#e7f7ef'
                                : '#ffe9ed',
                        color:
                          idea.status === 'Submitted'
                            ? '#2b4efe'
                            : idea.status === 'Under Review'
                              ? '#be7b15'
                              : idea.status === 'Accepted'
                                ? '#2f8f61'
                                : '#d0445f',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {idea.status}
                    </span>
                  </p>
                  <p style={{ margin: '8px 0' }}>{idea.description}</p>
                  <p style={{ margin: '8px 0', fontSize: '12px', color: '#8291a8' }}>
                    <strong>Category:</strong> {idea.category}
                  </p>
                  {attachments[idea.id] && (
                    <p style={{ margin: '8px 0', fontSize: '12px', color: '#6f7f96' }}>
                      <strong>Attachment:</strong> {attachments[idea.id]!.fileName} ✓
                    </p>
                  )}
                  {decisions[idea.id] && <DecisionSummary decision={decisions[idea.id]!} />}
                  <p style={{ margin: '8px 0', fontSize: '10px', color: '#94a2b7' }}>
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
