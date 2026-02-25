# Form Field Schema & Contracts

**Feature**: Phase 2 - Dynamic Form Fields  
**Date**: February 25, 2026  
**Purpose**: Define contracts for form field data structures, validation rules, and client-server interactions

---

## Contract 1: FormField Definition Schema

**Purpose**: Structure for storing form field metadata in the database (form_fields table)

**JSON Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Form Field Definition",
  "description": "Defines a single form field with type, validation rules, and category applicability",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this field"
    },
    "field_key": {
      "type": "string",
      "pattern": "^[a-z0-9_]+$",
      "description": "Programmatic name (e.g., 'expected_impact', 'timeline')"
    },
    "field_type": {
      "type": "string",
      "enum": ["text", "textarea", "select", "checkbox", "radio", "file"],
      "description": "Input type for this field"
    },
    "label": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Display label shown to user"
    },
    "placeholder": {
      "type": ["string", "null"],
      "maxLength": 200,
      "description": "Placeholder text for text/textarea fields"
    },
    "help_text": {
      "type": ["string", "null"],
      "maxLength": 500,
      "description": "Additional help text or guidance"
    },
    "required_by_default": {
      "type": "boolean",
      "description": "Whether this field is required in most contexts"
    },
    "validation_rules": {
      "type": "object",
      "description": "Per-category validation rules",
      "additionalProperties": {
        "$ref": "#/definitions/ValidationRulePerCategory"
      }
    },
    "applicable_categories": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Categories where this field is used"
    },
    "display_order": {
      "type": "integer",
      "minimum": 0,
      "description": "Sort order within form (lower = earlier)"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["id", "field_key", "field_type", "label", "applicable_categories", "created_at", "updated_at"],
  "definitions": {
    "ValidationRulePerCategory": {
      "type": "object",
      "properties": {
        "required": {
          "type": "boolean",
          "description": "Whether field is required in this category"
        },
        "pattern": {
          "type": ["string", "null"],
          "description": "Regex pattern for validation"
        },
        "min_length": {
          "type": ["integer", "null"],
          "minimum": 0
        },
        "max_length": {
          "type": ["integer", "null"],
          "minimum": 0
        },
        "min_value": {
          "type": ["number", "null"]
        },
        "max_value": {
          "type": ["number", "null"]
        },
        "allowed_values": {
          "type": ["array", "null"],
          "items": { "type": "string" },
          "description": "For select/radio fields, list of allowed options"
        },
        "custom_message": {
          "type": ["string", "null"],
          "description": "Custom validation error message"
        },
        "errorMessage": {
          "type": ["string", "null"],
          "description": "User-friendly error message"
        }
      }
    }
  }
}
```

**Example Instance**:
```json
{
  "id": "f-expected-impact",
  "field_key": "expected_impact",
  "field_type": "select",
  "label": "Expected Impact",
  "placeholder": null,
  "help_text": "Choose the expected business impact of this improvement",
  "required_by_default": true,
  "validation_rules": {
    "cat-process-improvement": {
      "required": true,
      "allowed_values": ["Low", "Medium", "High"],
      "errorMessage": "Please select an impact level"
    },
    "cat-innovation": {
      "required": false,
      "allowed_values": ["Low", "Medium", "High"],
      "errorMessage": null
    }
  },
  "applicable_categories": ["cat-process-improvement", "cat-innovation"],
  "display_order": 3,
  "created_at": "2026-02-25T10:00:00Z",
  "updated_at": "2026-02-25T10:00:00Z"
}
```

---

## Contract 2: FormConfiguration (Category Field Mapping) Schema

**Purpose**: Links a category to its set of form fields in a specific order

**JSON Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Form Configuration",
  "description": "Specifies which fields are shown for a given category, in order",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "category_id": {
      "type": "string",
      "format": "uuid",
      "description": "The category this configuration applies to"
    },
    "field_ids": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "uuid"
      },
      "description": "Ordered list of field IDs for this category"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["id", "category_id", "field_ids", "created_at", "updated_at"]
}
```

**Example Instance**:
```json
{
  "id": "fc-innovation-001",
  "category_id": "cat-innovation",
  "field_ids": ["f-title", "f-description", "f-expected-impact", "f-attachment"],
  "created_at": "2026-02-25T10:00:00Z",
  "updated_at": "2026-02-25T10:00:00Z"
}
```

---

## Contract 3: Dynamic Form Data (Submission) Schema

**Purpose**: Format for storing user-entered values when submitting an idea with dynamic form fields

**JSON Schema**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Dynamic Form Data",
  "description": "User-entered values for dynamic form fields; stored in ideas.dynamic_form_data",
  "additionalProperties": true,
  "examples": [
    {
      "f-title": "Automate Report Generation",
      "f-description": "Create an automated daily report pipeline",
      "f-current-process": "Manual compilation of data from 5 systems",
      "f-expected-impact": "High",
      "f-timeline": "30 days",
      "f-attachment": "s3://ideas-attachments/report-template.pdf"
    }
  ]
}
```

**Validation Rules**:
- Keys must match field_ids from the category's FormConfiguration
- Values must match the field_type (validated before storage)
- All required fields (per category validation_rules) must be present
- Additional unknown keys are rejected at submission time

---

## Contract 4: Form Submission Request/Response

**Purpose**: API contract for submitting an idea with dynamic form fields

### Request (POST /api/ideas)

```typescript
{
  "title": string;                    // Required, from form
  "description": string;              // Required, from form
  "category_id": string;              // Required, UUID of selected category
  "dynamic_form_data": {              // Required, validated per category
    [field_key: string]: any;
  };
  "attachment"?: File;                // Optional, if file field configured
}
```

**Example**:
```json
{
  "title": "Automate Report Generation",
  "description": "Create an automated daily report pipeline",
  "category_id": "cat-process-improvement",
  "dynamic_form_data": {
    "f-current-process": "Manual data collection from 5 systems",
    "f-expected-impact": "High",
    "f-timeline": "30 days"
  }
}
```

### Response (201 Created)

```typescript
{
  "id": string;                       // UUID of created idea
  "user_id": string;                  // User who submitted
  "title": string;
  "description": string;
  "category_id": string;              // Echoed
  "dynamic_form_data": {...};         // Echoed
  "status": "submitted";
  "created_at": string;               // ISO timestamp
  "submitted_at": string;             // ISO timestamp
}
```

### Error Response (400 Bad Request)

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR";
    "message": "Form validation failed";
    "details": [
      {
        "field_key": "f-expected-impact",
        "error": "Field is required"
      },
      {
        "field_key": "f-timeline",
        "error": "Must match pattern: ^\\d{1,2} days$"
      }
    ]
  }
}
```

---

## Contract 5: Form Configuration Fetch Response

**Purpose**: API response when fetching form configuration for a category

### Request (GET /api/form-config/:category_id)

**Response (200 OK)**:
```typescript
{
  "category": {
    "id": string;
    "name": string;
    "description": string;
  };
  "fields": FormField[];              // Array of FormField objects
  "field_ids": string[];              // Ordered list of field IDs
}
```

**Example**:
```json
{
  "category": {
    "id": "cat-process-improvement",
    "name": "Process Improvement",
    "description": "Ideas for improving existing processes"
  },
  "fields": [
    {
      "id": "f-title",
      "field_key": "title",
      "field_type": "text",
      "label": "Idea Title",
      "required": true,
      "...": "..."
    },
    {
      "id": "f-expected-impact",
      "field_key": "expected_impact",
      "field_type": "select",
      "label": "Expected Impact",
      "required": true,
      "...": "..."
    }
  ],
  "field_ids": ["f-title", "f-description", "f-current-process", "f-expected-impact", "f-timeline", "f-attachment"]
}
```

---

## Contract 6: Form State (Client-Side) Schema

**Purpose**: Structure for React component state managing dynamic form data and category selection

```typescript
interface FormState {
  selectedCategory: string | null;              // Category ID selected by user
  formData: Record<string, any>;                // Field values: {field_id: value, ...}
  errors: Record<string, string | null>;        // Validation errors: {field_id: error_message, ...}
  isDirty: boolean;                             // Has user made changes?
  isTouched: Record<string, boolean>;           // Which fields have been interacted with?
  isSubmitting: boolean;                        // Is submission in progress?
  submissionError: string | null;               // Any submission-level error
}

interface FormContextValue {
  state: FormState;
  setSelectedCategory: (categoryId: string) => void;
  setFieldValue: (fieldId: string, value: any) => void;
  setFieldError: (fieldId: string, error: string | null) => void;
  touchField: (fieldId: string) => void;
  resetForm: () => void;
  submitForm: () => Promise<void>;
}
```

---

## Contract 7: Validation Rules Engine Input/Output

**Purpose**: Interface for category-aware field validation

### Input: Validation Request

```typescript
{
  categoryId: string;
  formData: Record<string, any>;
  formFields: FormField[];
}
```

### Output: Validation Result

```typescript
{
  isValid: boolean;
  errors: {
    [fieldId: string]: string;  // Error message if validation failed
  };
}
```

**Example**:
```typescript
// Input
{
  categoryId: "cat-process-improvement",
  formData: {
    "f-expected-impact": "Very High"  // Invalid: not in allowed list
  },
  formFields: [/* ... */]
}

// Output
{
  isValid: false,
  errors: {
    "f-expected-impact": "Expected Impact must be one of: Low, Medium, High"
  }
}
```

---

## Backward Compatibility Contracts

### Legacy Idea (Phase 1) Display

When displaying a Phase 1 idea (category_id = "LEGACY_SUBMISSION"), the UI should:
1. Show category badge: "Legacy (submitted before dynamic forms)"
2. Display only base fields (title, description, attachment)
3. Ignore dynamic_form_data (will be empty {})
4. Show read-only view in admin panel with "View original submission" link

---

## Versioning & Evolution

**Current Version**: 1.0.0  
**Effective Date**: February 25, 2026

**Breaking Changes Policy**:
- FormField.field_type enum: additions allowed; removals require migration
- FormConfiguration.field_ids: order changes allowed; field removals require data migration
- ValidationRule schema: new properties allowed (backward compatible); property removal requires deprecation notice

**Future Enhancements (Phase 3+)**:
- Add FormField.conditional_logic for complex field dependencies
- Add FormField.custom_validator for extensible validation plugins
- Add FormSubmissionAudit table for tracking changes
