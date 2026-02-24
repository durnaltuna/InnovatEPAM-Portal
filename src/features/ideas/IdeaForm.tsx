import { FormEvent, useState } from 'react';
import { mapError } from '../../services/errors';
import { validateIdeaForm, validateSingleAttachment } from '../../services/validation';
import { createIdea } from './ideaService';
import { uploadAttachment } from './attachmentService';
import { getSessionUser } from '../auth/authService';

export function IdeaForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const user = getSessionUser();
      if (!user) {
        throw new Error('Not authenticated.');
      }

      const form = event.currentTarget;
      const fileInput = form.elements.namedItem('attachment') as HTMLInputElement | null;
      const files = fileInput?.files ?? null;

      const fieldValidation = validateIdeaForm({ title, description, category });
      if (!fieldValidation.valid) {
        throw new Error(fieldValidation.errors.join(' '));
      }

      const attachmentValidation = validateSingleAttachment(files);
      if (!attachmentValidation.valid) {
        throw new Error(attachmentValidation.errors.join(' '));
      }

      // Create idea
      const idea = await createIdea(user.id, title, description, category);

      // Upload attachment
      const file = files?.[0];
      if (file) {
        await uploadAttachment(idea.id, file);
      }

      setMessage(`✅ Idea "${idea.title}" submitted successfully with status: ${idea.status}`);
      setTitle('');
      setDescription('');
      setCategory('');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (caught) {
      setError(mapError(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Submit Idea</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
        <label htmlFor="idea-title">Title</label>
        <input id="idea-title" value={title} onChange={(event) => setTitle(event.target.value)} required disabled={isSubmitting} />

        <label htmlFor="idea-description">Description</label>
        <textarea
          id="idea-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          disabled={isSubmitting}
        />

        <label htmlFor="idea-category">Category</label>
        <input id="idea-category" value={category} onChange={(event) => setCategory(event.target.value)} required disabled={isSubmitting} />

        <label htmlFor="idea-attachment">Attachment (exactly one file)</label>
        <input id="idea-attachment" name="attachment" type="file" required disabled={isSubmitting} />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Idea'}
        </button>
      </form>
      {message ? <p style={{ color: 'green' }}>{message}</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </section>
  );
}
