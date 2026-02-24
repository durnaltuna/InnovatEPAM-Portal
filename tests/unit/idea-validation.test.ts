import { describe, expect, it } from 'vitest';
import { validateIdeaForm, validateSingleAttachment } from '../../src/services/validation';

describe('idea validation', () => {
  it('requires title/description/category', () => {
    const result = validateIdeaForm({ title: '', description: '', category: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(3);
  });

  it('accepts complete required fields', () => {
    const result = validateIdeaForm({
      title: 'Idea A',
      description: 'Description A',
      category: 'Process'
    });
    expect(result.valid).toBe(true);
  });

  it('rejects missing attachment list', () => {
    const result = validateSingleAttachment(null);
    expect(result.valid).toBe(false);
  });
});
