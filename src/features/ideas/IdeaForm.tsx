import { FormEvent, useState } from 'react';
import { mapError } from '../../services/errors';
import { validateIdeaForm, validateSingleAttachment } from '../../services/validation';

export function IdeaForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
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

      setMessage('Basic idea form is started and validates one-file submissions.');
    } catch (caught) {
      setError(mapError(caught));
    }
  }

  return (
    <section>
      <h2>Submit Idea (Basic Form Started)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
        <label htmlFor="idea-title">Title</label>
        <input id="idea-title" value={title} onChange={(event) => setTitle(event.target.value)} required />

        <label htmlFor="idea-description">Description</label>
        <textarea
          id="idea-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <label htmlFor="idea-category">Category</label>
        <input id="idea-category" value={category} onChange={(event) => setCategory(event.target.value)} required />

        <label htmlFor="idea-attachment">Attachment (exactly one file)</label>
        <input id="idea-attachment" name="attachment" type="file" required />

        <button type="submit">Validate Draft Submission</button>
      </form>
      {message ? <p style={{ color: 'green' }}>{message}</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
    </section>
  );
}
