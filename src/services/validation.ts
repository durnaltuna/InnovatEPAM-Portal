import type { IdeaFormInput } from '../types/domain';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateIdeaForm(input: IdeaFormInput): ValidationResult {
  const errors: string[] = [];

  if (!input.title.trim()) {
    errors.push('Title is required.');
  }
  if (!input.description.trim()) {
    errors.push('Description is required.');
  }
  if (!input.category.trim()) {
    errors.push('Category is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateSingleAttachment(files: FileList | null): ValidationResult {
  if (!files || files.length === 0) {
    return { valid: false, errors: ['One file attachment is required.'] };
  }

  if (files.length > 1) {
    return { valid: false, errors: ['Exactly one file attachment is allowed.'] };
  }

  return { valid: true, errors: [] };
}
