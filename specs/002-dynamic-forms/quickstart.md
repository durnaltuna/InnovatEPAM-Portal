# Developer Quickstart: Phase 2 - Dynamic Form Fields

**Feature**: Smart Submission Forms (Dynamic Fields)  
**Date**: February 25, 2026  
**Audience**: Frontend developers implementing Phase 2

---

## Overview

Phase 2 extends the Phase 1 idea submission form to support **dynamic fields that change based on the selected idea category**. Instead of one static form, submitters see only the fields relevant to their category.

**Key Changes**:
- Extend IdeaForm component to fetch and render category-specific fields
- Add field visibility logic based on category selection
- Implement category-aware validation
- Preserve form state across category changes
- Extend database schema (4 new/extended tables)

---

## Architecture

```
User selects category
         ↓
IdeaForm fetches FormConfiguration + FormField data from Supabase
         ↓
useFormState Hook manages form data + validation per category
         ↓
FormRenderer component iterates FormFields and renders input components
         ↓
User fills fields and clicks Submit
         ↓
Validation engine (category-aware) validates formData
         ↓
POST /api/ideas with {category_id, dynamic_form_data}
         ↓
Idea created with metadata linking to category + dynamic field values
```

---

## File Structure

```
src/features/ideas/
├── IdeaForm.tsx                    # MODIFIED: Add category selector + field rendering
├── FormRenderer.tsx                # NEW: Component to render individual form fields
├── ideaService.ts                  # MODIFIED: Add submitIdeaWithFields()
├── ideaQueries.ts                  # MODIFIED: Add fetchFormConfig(categoryId)
├── ideaValidation.ts               # NEW: Category-aware validation logic
├── hooks/
│   └── useFormState.ts             # NEW: Hook managing form state + category changes
└── types/
    ├── formSchema.ts               # NEW: Types for FormField, FormConfiguration
    └── domain.ts                   # MODIFIED: Extend Idea type with category_id, dynamic_form_data

src/services/
├── supabase/
│   └── client.ts                   # MODIFIED: Add queries for form_fields, form_configurations
└── validation.ts                   # MODIFIED: Extend with buildSchemaForCategory()

tests/
├── unit/
│   ├── idea-form-visibility.test.ts
│   ├── idea-field-validation.test.ts
│   ├── form-state-preservation.test.ts
│   └── form-compatibility.test.ts
├── integration/
│   └── dynamic-form-submission.test.ts
└── e2e/
    └── dynamic-form-workflows.spec.ts
```

---

## Implementation Steps

### Step 1: Database Schema Migration

**Goal**: Create new tables and extend existing ones

**SQL File** (specs/002-dynamic-forms/data-model.md has full DDL):

1. Create form_fields table:
   ```sql
   CREATE TABLE form_fields (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     field_key TEXT NOT NULL UNIQUE,
     field_type TEXT NOT NULL CHECK (...),
     label TEXT NOT NULL,
     validation_rules JSONB DEFAULT '{}',
     applicable_categories TEXT[] NOT NULL,
     display_order INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Create form_configurations table:
   ```sql
   CREATE TABLE form_configurations (
     id UUID PRIMARY KEY,
     category_id UUID NOT NULL UNIQUE REFERENCES categories(id),
     field_ids UUID[] NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. Extend categories table:
   ```sql
   ALTER TABLE categories ADD COLUMN field_mappings JSONB DEFAULT '{}';
   ```

4. Extend ideas table:
   ```sql
   ALTER TABLE ideas ADD COLUMN (
     category_id UUID,
     dynamic_form_data JSONB DEFAULT '{}'
   );
   UPDATE ideas SET category_id = (SELECT id FROM categories LIMIT 1)
     WHERE category_id IS NULL;
   ALTER TABLE ideas ALTER COLUMN category_id SET NOT NULL;
   ```

5. Seed form_fields + form_configurations from config/formConfigs.ts

**Test**: Verify existing Phase 1 queries still work; verify new tables are queryable.

---

### Step 2: Type Definitions

**File**: src/features/ideas/types/formSchema.ts

```typescript
export interface FormField {
  id: string;
  field_key: string;
  field_type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  help_text?: string;
  required_by_default: boolean;
  validation_rules: Record<string, ValidationRulePerCategory>;
  applicable_categories: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationRulePerCategory {
  required?: boolean;
  pattern?: string;
  min_length?: number;
  max_length?: number;
  allowed_values?: string[];
  errorMessage?: string;
}

export interface FormConfiguration {
  id: string;
  category_id: string;
  field_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface FormState {
  selectedCategory: string | null;
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  isDirty: boolean;
  isTouched: Record<string, boolean>;
  isSubmitting: boolean;
}
```

**File**: src/types/domain.ts (extend existing)

```typescript
export interface Idea {
  // ... Phase 1 fields ...
  category_id: string;              // NEW
  dynamic_form_data: Record<string, any>;  // NEW
}

export interface Category {
  // ... existing fields ...
  field_mappings?: {
    field_ids: string[];
    cached_at: string;
  };
}
```

---

### Step 3: Supabase Queries

**File**: src/services/supabase/client.ts (add these functions)

```typescript
// Fetch form configuration for a category
export async function fetchFormConfig(categoryId: string) {
  const { data: config, error: configError } = await supabase
    .from('form_configurations')
    .select('*')
    .eq('category_id', categoryId)
    .single();

  if (configError) throw configError;

  const { data: fields, error: fieldsError } = await supabase
    .from('form_fields')
    .select('*')
    .in('id', config.field_ids);

  if (fieldsError) throw fieldsError;

  // Sort fields by display_order and category config order
  return {
    configuration: config,
    fields: config.field_ids.map(fId => 
      fields.find((f: FormField) => f.id === fId)
    ).filter(Boolean)
  };
}

// Fetch all categories for dropdown
export async function fetchCategoriesWithFields() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description')
    .order('id');

  if (error) throw error;
  return data;
}

// Submit idea with dynamic form fields
export async function submitIdeaWithDynamicFields(ideaData: {
  title: string;
  description: string;
  category_id: string;
  dynamic_form_data: Record<string, any>;
  attachment?: File;
}) {
  // Upload attachment if present
  let attachment_url = null;
  if (ideaData.attachment) {
    const filename = `${Date.now()}-${ideaData.attachment.name}`;
    const { data, error } = await supabase.storage
      .from('ideas-attachments')
      .upload(filename, ideaData.attachment);
    if (error) throw error;
    attachment_url = data.path;
  }

  // Create idea record
  const { data, error } = await supabase
    .from('ideas')
    .insert({
      title: ideaData.title,
      description: ideaData.description,
      category_id: ideaData.category_id,
      dynamic_form_data: ideaData.dynamic_form_data,
      attachment_url,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

### Step 4: Validation Engine

**File**: src/features/ideas/ideaValidation.ts

```typescript
import { z } from 'zod';
import type { FormField, ValidationRulePerCategory } from './types/formSchema';

export function buildValidationSchemaForCategory(
  categoryId: string,
  fields: FormField[]
): z.ZodSchema {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const rule: ValidationRulePerCategory = field.validation_rules[categoryId] || {};

    let fieldSchema: z.ZodTypeAny;

    switch (field.field_type) {
      case 'text':
      case 'email':
        fieldSchema = z.string();
        if (rule.min_length) fieldSchema = (fieldSchema as z.ZodString).min(rule.min_length);
        if (rule.max_length) fieldSchema = (fieldSchema as z.ZodString).max(rule.max_length);
        if (rule.pattern) {
          fieldSchema = (fieldSchema as z.ZodString).regex(new RegExp(rule.pattern), {
            message: rule.errorMessage || 'Invalid format'
          });
        }
        if (rule.required) {
          fieldSchema = fieldSchema.min(1, rule.errorMessage || 'This field is required');
        } else {
          fieldSchema = fieldSchema.optional();
        }
        break;

      case 'select':
      case 'radio':
        if (rule.allowed_values) {
          fieldSchema = z.enum(rule.allowed_values as [string, ...string[]]);
          if (!rule.required) fieldSchema = fieldSchema.optional();
        }
        break;

      case 'checkbox':
        fieldSchema = z.boolean();
        if (!rule.required) fieldSchema = fieldSchema.optional();
        break;

      case 'file':
        // File validation handled at upload time
        fieldSchema = z.string().optional(); // URL of uploaded file
        break;

      case 'textarea':
      default:
        fieldSchema = z.string();
        if (rule.min_length) fieldSchema = (fieldSchema as z.ZodString).min(rule.min_length);
        if (rule.max_length) fieldSchema = (fieldSchema as z.ZodString).max(rule.max_length);
        if (rule.required) {
          fieldSchema = fieldSchema.min(1, rule.errorMessage || 'This field is required');
        } else {
          fieldSchema = fieldSchema.optional();
        }
    }

    shape[field.field_key] = fieldSchema;
  }

  return z.object(shape);
}

// Validate form data against category-specific schema
export async function validateFormData(
  categoryId: string,
  formData: Record<string, any>,
  fields: FormField[]
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  const schema = buildValidationSchemaForCategory(categoryId, fields);

  try {
    await schema.parseAsync(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      for (const issue of error.issues) {
        const fieldName = issue.path[0] as string;
        errors[fieldName] = issue.message;
      }
      return { isValid: false, errors };
    }
    throw error;
  }
}
```

---

### Step 5: Form State Hook

**File**: src/features/ideas/hooks/useFormState.ts

```typescript
import { useReducer, useCallback } from 'react';
import type { FormState } from '../types/formSchema';

type FormAction =
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_FIELD_VALUE'; payload: { fieldId: string; value: any } }
  | { type: 'SET_FIELD_ERROR'; payload: { fieldId: string; error: string | null } }
  | { type: 'TOUCH_FIELD'; payload: string }
  | { type: 'RESET_FORM' }
  | { type: 'START_SUBMIT' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'SUBMIT_SUCCESS' };

const initialState: FormState = {
  selectedCategory: null,
  formData: {},
  errors: {},
  isDirty: false,
  isTouched: {},
  isSubmitting: false
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_CATEGORY': {
      // Preserve shared field values, reset category-specific fields
      return {
        ...state,
        selectedCategory: action.payload,
        isDirty: true
      };
    }
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        formData: { ...state.formData, [action.payload.fieldId]: action.payload.value },
        isDirty: true,
        errors: { ...state.errors, [action.payload.fieldId]: null }
      };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.fieldId]: action.payload.error }
      };
    case 'TOUCH_FIELD':
      return {
        ...state,
        isTouched: { ...state.isTouched, [action.payload]: true }
      };
    case 'RESET_FORM':
      return initialState;
    case 'START_SUBMIT':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, errors: { global: action.payload } };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, isDirty: false };
    default:
      return state;
  }
}

export function useFormState() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setSelectedCategory = useCallback((categoryId: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: categoryId });
  }, []);

  const setFieldValue = useCallback((fieldId: string, value: any) => {
    dispatch({ type: 'SET_FIELD_VALUE', payload: { fieldId, value } });
  }, []);

  const setFieldError = useCallback((fieldId: string, error: string | null) => {
    dispatch({ type: 'SET_FIELD_ERROR', payload: { fieldId, error } });
  }, []);

  const touchField = useCallback((fieldId: string) => {
    dispatch({ type: 'TOUCH_FIELD', payload: fieldId });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  return {
    state,
    setSelectedCategory,
    setFieldValue,
    setFieldError,
    touchField,
    resetForm,
    startSubmit: () => dispatch({ type: 'START_SUBMIT' }),
    submitError: (msg: string) => dispatch({ type: 'SUBMIT_ERROR', payload: msg }),
    submitSuccess: () => dispatch({ type: 'SUBMIT_SUCCESS' })
  };
}
```

---

### Step 6: IdeaForm Component

**File**: src/features/ideas/IdeaForm.tsx (add category selection + dynamic fields)

```typescript
import React, { useEffect, useState } from 'react';
import { fetchFormConfig, fetchCategoriesWithFields, submitIdeaWithDynamicFields } from './ideaService';
import { validateFormData } from './ideaValidation';
import { useFormState } from './hooks/useFormState';
import type { FormField } from './types/formSchema';

export function IdeaForm() {
  const formState = useFormState();
  const [categories, setCategories] = useState([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available categories
    fetchCategoriesWithFields().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    // Fetch form fields for selected category
    if (formState.state.selectedCategory) {
      setLoading(true);
      fetchFormConfig(formState.state.selectedCategory)
        .then(({ fields }) => setFormFields(fields))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [formState.state.selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formState.startSubmit();

    try {
      // Validate
      const { isValid, errors } = await validateFormData(
        formState.state.selectedCategory!,
        formState.state.formData,
        formFields
      );

      if (!isValid) {
        Object.entries(errors).forEach(([fieldId, error]) => {
          formState.setFieldError(fieldId, error);
        });
        formState.submitError('Please fix validation errors');
        return;
      }

      // Submit
      await submitIdeaWithDynamicFields({
        title: formState.state.formData.title,
        description: formState.state.formData.description,
        category_id: formState.state.selectedCategory!,
        dynamic_form_data: formState.state.formData
      });

      formState.submitSuccess();
      // Navigate to success page or show toast
    } catch (error) {
      formState.submitError((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      {/* Category Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Idea Category *</label>
        <select
          value={formState.state.selectedCategory || ''}
          onChange={(e) => formState.setSelectedCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Dynamic Fields */}
      {formState.state.selectedCategory && formFields.length > 0 && (
        <div className="space-y-4">
          {formFields.map((field) => (
            <FormFieldInput
              key={field.id}
              field={field}
              value={formState.state.formData[field.field_key] || ''}
              error={formState.state.errors[field.field_key]}
              onChange={(value) => formState.setFieldValue(field.field_key, value)}
              onBlur={() => formState.touchField(field.field_key)}
            />
          ))}
        </div>
      )}

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={formState.state.isSubmitting || !formState.state.selectedCategory}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {formState.state.isSubmitting ? 'Submitting...' : 'Submit Idea'}
        </button>
      </div>
    </form>
  );
}

function FormFieldInput({ field, value, error, onChange, onBlur }) {
  // Render based on field.field_type
  // text, textarea, select, checkbox, radio, file
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{field.label}</label>
      {field.field_type === 'text' && (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      )}
      {field.field_type === 'textarea' && (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      )}
      {field.field_type === 'select' && (
        <select value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}>
          <option value="">Select...</option>
          {/* Options from field.validation_rules */}
        </select>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
```

---

### Step 7: Write Tests (Test-First)

**Failing Tests** (write these first):

```typescript
// tests/unit/idea-form-visibility.test.ts
describe('Form visibility based on category', () => {
  it('should show only fields applicable to selected category', () => {
    // Assert: fields for category A are visible
    // Assert: fields not in category A are hidden
  });

  it('should preserve field values when switching categories', () => {
    // Arrange: fill form for category A
    // Act: switch to category B
    // Assert: category A-specific fields are hidden
    // Assert: shared fields still have their values
  });
});

// tests/unit/idea-field-validation.test.ts
describe('Category-specific validation', () => {
  it('should apply category-specific required rules', () => {
    // Arrange: validation schema for category A
    // Act: validate without required field
    // Assert: validation fails with specific error
  });

  it('should apply different validation per category', () => {
    // Assert: field X required in category A
    // Assert: field X optional in category B
  });
});

// tests/e2e/dynamic-form-workflows.spec.ts
describe('Dynamic form end-to-end', () => {
  it('should submit idea with category and dynamic fields', () => {
    // Arrange: navigate to form
    // Act: select category, fill fields, submit
    // Assert: idea created with category_id and dynamic_form_data
  });

  it('should display validation errors per category', () => {
    // Act: submit without required fields
    // Assert: field-specific errors shown
  });
});
```

---

## Testing Checklist

- [ ] Database migration completes without errors
- [ ] Phase 1 ideas still display correctly (backward compatibility)
- [ ] Category dropdown populates from database
- [ ] Form fields appear/disappear correctly when category changes
- [ ] Field values are preserved for shared fields on category change
- [ ] Validation errors show per category
- [ ] Form submission creates idea with category_id and dynamic_form_data
- [ ] Admin can view legacy (Phase 1) ideas without errors
- [ ] Playwright e2e tests pass for all user journeys
- [ ] Line coverage > 80% for modified modules (IdeaForm, validation, state hook)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| specs/002-dynamic-forms/spec.md | Feature spec (user stories, requirements) |
| specs/002-dynamic-forms/research.md | Technical research and decisions |
| specs/002-dynamic-forms/data-model.md | Database schema and entity definitions |
| specs/002-dynamic-forms/contracts/form-contracts.md | API contracts and data schemas |
| src/features/ideas/ideaValidation.ts | Category-aware validation logic |
| src/features/ideas/hooks/useFormState.ts | Form state management |
| src/features/ideas/IdeaForm.tsx | Main form component |

---

## Next Steps

1. **Phase 2a - Infrastructure**: Run database migrations
2. **Phase 2b - Seed**: Populate form_fields + form_configurations with initial categories
3. **Phase 2c - Frontend**: Implement IdeaForm component changes
4. **Phase 2d - Testing**: Write and pass all tests
5. **Phase 2e - Review**: Human review of validation engine and migrations
6. **Phase 2f - Merge**: Merge to main branch

---

## Support & Questions

- Spec questions? See [spec.md](spec.md)
- Database questions? See [data-model.md](data-model.md)
- API contract questions? See [contracts/form-contracts.md](contracts/form-contracts.md)
- Implementation questions? See this Quickstart or research.md

**Contact**: [Specification Owner to fill in]
