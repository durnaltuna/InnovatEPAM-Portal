# Data Model: Smart Submission Forms

**Feature**: Phase 2 - Dynamic Form Fields  
**Date**: February 25, 2026  
**Status**: Phase 1 Design Complete

---

## Entity Definitions

### Entity 1: Category *(Extended)*

**Purpose**: Represents an idea category that groups related submission types (e.g., "Process Improvement", "Innovation")

**Status**: Extended from Phase 1 (adds field_mappings column)

**Attributes**:

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | UUID | Yes | PK | Unique identifier |
| name | TEXT | Yes | UNIQUE | Category display name (e.g., "Process Improvement") |
| description | TEXT | No | Max 500 chars | Category description for UI help text |
| field_mappings | JSONB | No | Default {} | Denormalized cache of field config; includes field_ids for this category |
| created_at | TIMESTAMP | Yes | Default NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | Yes | Default NOW() | Record last update timestamp |

**Relationships**:
- `1:N` with form_configurations (can have multiple field configuration sets, but only one per category)
- `1:N` with ideas (ideas belong to a category)

**Validation Rules**:
- name: non-empty, max 100 characters
- description: max 500 characters

**Example Record**:
```json
{
  "id": "cat-proc-001",
  "name": "Process Improvement",
  "description": "Improvements to existing processes or workflows",
  "field_mappings": {
    "field_ids": ["f-title", "f-desc", "f-current-proc", "f-impact", "f-timeline", "f-attach"],
    "cached_at": "2026-02-25T10:00:00Z"
  },
  "created_at": "2026-02-01T00:00:00Z",
  "updated_at": "2026-02-25T10:00:00Z"
}
```

---

### Entity 2: FormField *(New)*

**Purpose**: Defines a single form field that can be used in idea submissions; stores field type, validation rules, and category applicability

**Status**: New (created for Phase 2)

**Attributes**:

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | UUID | Yes | PK | Unique identifier |
| field_key | TEXT | Yes | UNIQUE | Programmatic name (e.g., "timeline", "expected_impact") |
| field_type | TEXT | Yes | ENUM | One of: text, textarea, select, checkbox, radio, file |
| label | TEXT | Yes | Max 100 chars | Display label in form (e.g., "Expected Timeline") |
| placeholder | TEXT | No | Max 200 chars | Placeholder text for user guidance |
| help_text | TEXT | No | Max 500 chars | Additional help/context text |
| required_by_default | BOOLEAN | No | Default FALSE | Whether this field is required in most categories |
| validation_rules | JSONB | No | See schema | Per-category validation rules and constraints |
| applicable_categories | TEXT[] | No | Default [] | Array of category IDs where this field is used |
| display_order | INTEGER | No | Default 0 | Sort order within category (lower = earlier) |
| created_at | TIMESTAMP | Yes | Default NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | Yes | Default NOW() | Record last update timestamp |

**Relationships**:
- `M:N` with categories (many form_fields, many categories; expressed through form_configurations)
- `1:N` with form_configurations (field can appear in multiple configurations)

**Validation Rules**:
- field_key: non-empty, alphanumeric + underscore, unique
- field_type: must be valid enum value
- label: non-empty, max 100 chars
- applicable_categories: array of valid category IDs

**Example Record**:
```json
{
  "id": "f-timeline",
  "field_key": "timeline",
  "field_type": "text",
  "label": "Expected Timeline",
  "placeholder": "e.g., 30 days",
  "help_text": "Estimated time to complete this improvement",
  "required_by_default": false,
  "validation_rules": {
    "cat-proc-001": {
      "required": true,
      "pattern": "^[0-9]{1,3} (days|weeks|months)$",
      "errorMessage": "Enter timeline as '30 days', '4 weeks', etc."
    },
    "cat-innov-001": {
      "required": false,
      "pattern": null,
      "errorMessage": null
    }
  },
  "applicable_categories": ["cat-proc-001", "cat-innov-001"],
  "display_order": 4,
  "created_at": "2026-02-01T00:00:00Z",
  "updated_at": "2026-02-25T10:00:00Z"
}
```

---

### Entity 3: FormConfiguration *(New)*

**Purpose**: Links a category to its set of form fields; enables querying "which fields should be shown for this category?"

**Status**: New (created for Phase 2)

**Attributes**:

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | UUID | Yes | PK | Unique identifier |
| category_id | UUID | Yes | FK to categories, UNIQUE | The category for which this configuration applies |
| field_ids | UUID[] | Yes | Array of form_fields.id | Ordered list of field IDs for this category |
| created_at | TIMESTAMP | Yes | Default NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | Yes | Default NOW() | Record last update timestamp |

**Relationships**:
- `N:1` with categories (each category has exactly one form configuration)
- `N:M` with form_fields (each configuration references multiple fields)

**Constraints**:
- Unique constraint on category_id (one config per category)
- Foreign key constraint: category_id must exist in categories table
- Foreign key constraint: all field_ids must exist in form_fields table

**Example Record**:
```json
{
  "id": "fc-proc-001",
  "category_id": "cat-proc-001",
  "field_ids": ["f-title", "f-desc", "f-current-proc", "f-expected-impact", "f-timeline", "f-attachment"],
  "created_at": "2026-02-01T00:00:00Z",
  "updated_at": "2026-02-25T10:00:00Z"
}
```

---

### Entity 4: Idea *(Extended)*

**Purpose**: Represents a submitted idea; extended to support dynamic form fields and category tracking

**Status**: Extended from Phase 1 (adds category_id and dynamic_form_data columns)

**New/Modified Attributes**:

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| category_id | UUID | Yes | FK to categories | The category selected by submitter; links to form_fields config |
| dynamic_form_data | JSONB | Yes | Default {} | Stores user-entered values for all dynamic fields; key = field_id, value = user input |

**Example Record (extended)**:
```json
{
  "id": "idea-abc123",
  "user_id": "usr-123",
  "category_id": "cat-proc-001",
  "title": "Automate Report Generation",
  "description": "Create automated process for monthly reports",
  "status": "submitted",
  "dynamic_form_data": {
    "f-timeline": "30 days",
    "f-expected-impact": "High",
    "f-current-process": "Manual compilation of 10 spreadsheets",
    "f-attachment_url": "s3://ideas/report-template.pdf"
  },
  "created_at": "2026-02-25T12:00:00Z",
  "updated_at": "2026-02-25T12:00:00Z",
  "submitted_at": "2026-02-25T12:00:00Z"
}
```

---

## Database Schema (SQL)

### Table: form_fields (NEW)

```sql
CREATE TABLE form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key TEXT NOT NULL UNIQUE,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'radio', 'file')),
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  required_by_default BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}',
  applicable_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_form_fields_applicable_categories ON form_fields USING GIN(applicable_categories);
```

### Table: form_configurations (NEW)

```sql
CREATE TABLE form_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL UNIQUE,
  field_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_form_configurations_category_id ON form_configurations(category_id);
```

### Table: categories (EXTENDED)

```sql
ALTER TABLE categories ADD COLUMN (
  field_mappings JSONB DEFAULT '{}'
);

-- Index for queries on denormalized field data
CREATE INDEX idx_categories_field_mappings ON categories USING GIN(field_mappings);
```

### Table: ideas (EXTENDED)

```sql
ALTER TABLE ideas ADD COLUMN (
  category_id UUID,
  dynamic_form_data JSONB DEFAULT '{}'
);

-- Migration: Backfill category_id for Phase 1 ideas
UPDATE ideas SET category_id = (
  SELECT id FROM categories WHERE name = 'General' OR id = (SELECT MIN(id) FROM categories)
) WHERE category_id IS NULL;

-- After backfill, make NOT NULL
ALTER TABLE ideas ALTER COLUMN category_id SET NOT NULL;

-- Create foreign key
ALTER TABLE ideas ADD CONSTRAINT fk_ideas_category_id 
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;

-- Indexes for common queries
CREATE INDEX idx_ideas_category_id ON ideas(category_id);
CREATE INDEX idx_ideas_user_id_category_id ON ideas(user_id, category_id);
```

---

## Type Definitions (TypeScript)

### FormField Interface

```typescript
export interface FormField {
  id: string;
  field_key: string;
  field_type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  label: string;
  placeholder?: string;
  help_text?: string;
  required_by_default: boolean;
  validation_rules: Record<string, ValidationRule>;
  applicable_categories: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  required?: boolean;
  pattern?: string; // Regex pattern
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  allowed_values?: string[];
  custom_message?: string;
  errorMessage?: string;
}
```

### FormConfiguration Interface

```typescript
export interface FormConfiguration {
  id: string;
  category_id: string;
  field_ids: string[];
  created_at: string;
  updated_at: string;
}
```

### Idea (Extended) Interface

```typescript
export interface Idea {
  // ... existing Phase 1 fields ...
  category_id: string; // NEW
  dynamic_form_data: Record<string, any>; // NEW
}

export type DynamicFormData = Record<string, any>;
```

### Category (Extended) Interface

```typescript
export interface Category {
  // ... existing Phase 1 fields ...
  field_mappings?: {
    field_ids: string[];
    cached_at: string;
  };
}
```

---

## Data Relationships

### ER Diagram (Text)

```
┌──────────────┐
│  categories  │
│   (EXTEND)   │
├──────────────┤
│ id (PK)      │
│ name         │
│ description  │
│ field_mappings│ ──────┐
│ created_at   │       │
│ updated_at   │       │
└──────────────┘       │
        │              │
        │ 1:N          │ 1:1
        │              ↓
        │       ┌──────────────────┐
        │       │form_configurations│
        │       │      (NEW)        │
        │       ├──────────────────┤
        │       │ id (PK)          │
        │       │ category_id (FK) │
        │       │ field_ids[] (FK) │
        │       │ created_at       │
        │       │ updated_at       │
        │       └──────────────────┘
        │                │
        │                │ M:N
        │                ↓
        │       ┌──────────────────┐
        │       │  form_fields     │
        │       │      (NEW)       │
        │       ├──────────────────┤
        │       │ id (PK)          │
        │       │ field_key        │
        │       │ field_type       │
        │       │ label            │
        │       │ validation_rules │
        │       │ applicable_cats[]│
        │       │ display_order    │
        │       └──────────────────┘
        │
        │ 1:N
        ↓
    ┌──────────────┐
    │    ideas     │
    │   (EXTEND)   │
    ├──────────────┤
    │ id (PK)      │
    │ user_id (FK) │
    │ category_id  │ ←──────┘ (NEW, NOT NULL)
    │ dynamic_form │ (NEW)
    │ created_at   │
    │ updated_at   │
    └──────────────┘
```

---

## Schema Evolution Strategy

**Phase 2 (Current)**:
1. Create form_fields, form_configurations tables
2. Extend categories with field_mappings
3. Extend ideas with category_id, dynamic_form_data
4. Backfill category_id for Phase 1 ideas (assign to default/legacy category)
5. Create indexes for common queries

**Phase 3+**:
- Add new field types (date, rich-text, etc.) → update CHECK constraint on form_fields.field_type
- Add support for field dependencies → extend form_configurations to store dependency rules
- Add admin UI configuration → add created_by, updated_by fields for audit trail

**Backward Compatibility**:
- All new columns are nullable or have defaults (except category_id, which is backfilled)
- Phase 1 ideas remain fully readable and accessible
- Phase 1 form UI continues to work (reads ideas table without category logic)

---

## Migration Checklist

- [ ] Create form_fields table
- [ ] Create form_configurations table
- [ ] Add field_mappings to categories table
- [ ] Add category_id, dynamic_form_data to ideas table
- [ ] Backfill category_id for all Phase 1 ideas (set to default category)
- [ ] Add foreign key constraints
- [ ] Create performance indexes
- [ ] Verify no migration errors on development environment
- [ ] Test Phase 1 idea queries still work correctly (backward compatibility)
- [ ] Seed initial form_fields + form_configurations for Phase 2 launch categories
