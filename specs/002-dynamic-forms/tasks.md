# Tasks: Smart Submission Forms (Dynamic Fields)

**Input**: Design documents from `/specs/002-dynamic-forms/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅  
**Branch**: `002-dynamic-forms`  
**Status**: Phase 2 Implementation Tasks  

**Format**: `[ID] [PRIORITY] [USER_STORY] Description with file paths`

---

## Format Key
- **[P]**: Can run in parallel (different files/modules, no blocking dependencies)
- **[US1-4]**: Maps to User Story 1-4 from spec.md
- **File paths**: All relative to repository root src/ or tests/

---

---

## Phase 1: Setup & Infrastructure (Shared Foundation)

**Goal**: Initialize database schema, seed configuration, and verify backward compatibility

**Blocking**: All user stories depend on these tasks

### Infrastructure Tasks

- [ ] T001 [P] Initialize Supabase migrations directory at `supabase/migrations/` with migration naming convention
- [ ] T002 [P] Create migration SQL file for form_fields table per data-model.md in `supabase/migrations/[timestamp]_create_form_fields.sql`
- [ ] T003 [P] Create migration SQL file for form_configurations table per data-model.md in `supabase/migrations/[timestamp]_create_form_configurations.sql`
- [ ] T004 [P] Create migration SQL file to extend categories table with field_mappings JSONB column in `supabase/migrations/[timestamp]_extend_categories.sql`
- [ ] T005 [P] Create migration SQL file to extend ideas table with category_id FK and dynamic_form_data in `supabase/migrations/[timestamp]_extend_ideas.sql`
- [ ] T006 Create migration script to backfill category_id for all Phase 1 ideas (assign to LEGACY_SUBMISSION category) in `supabase/migrations/[timestamp]_backfill_legacy_categories.sql`
- [ ] T007 [P] Create index on form_fields.applicable_categories (GIN) for fast category lookups
- [ ] T008 [P] Create index on form_configurations.category_id for FK performance
- [ ] T009 [P] Create index on ideas.category_id for query filtering
- [ ] T010 Create seed script at `src/config/formConfigs.ts` with 3-5 hardcoded category-field definitions (Process Improvement, Innovation, Cost Reduction, etc.)
- [ ] T011 Create database seeding script at `scripts/seed-form-config.ts` that populates form_fields and form_configurations from formConfigs.ts
- [ ] T012 [P] Run migrations in development environment and verify successful execution
- [ ] T013 Execute seeding script to populate initial form_fields + form_configurations in dev database
- [ ] T014 Write integration test at `tests/integration/database-migration.test.ts` verifying all new tables exist with correct columns
- [ ] T015 Write integration test at `tests/integration/backward-compatibility.test.ts` verifying Phase 1 ideas still query correctly post-migration

---

## Phase 2: Foundational (Blocking Prerequisites for All User Stories)

**Goal**: Define types and implement core backend queries needed by all user stories

**Blocking**: US-1, US-2, US-3, US-4 all depend on these tasks

### Phase 2a: Type Definitions & Contracts

- [ ] T016 [P] Create file `src/features/ideas/types/formSchema.ts` with FormField interface (id, field_key, field_type, label, validation_rules, applicable_categories, display_order)
- [ ] T017 [P] Create ValidationRulePerCategory interface in formSchema.ts with fields: required, pattern, min_length, max_length, min_value, max_value, allowed_values, errorMessage
- [ ] T018 [P] Create FormConfiguration interface in formSchema.ts (id, category_id, field_ids, created_at, updated_at)
- [ ] T019 [P] Create FormState interface in formSchema.ts (selectedCategory, formData, errors, isDirty, isTouched, isSubmitting)
- [ ] T020 [P] Create type aliases for field_type enum: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
- [ ] T021 Extend `src/types/domain.ts` Idea interface to add category_id (UUID FK) and dynamic_form_data (Record<string, any>)
- [ ] T022 Extend `src/types/domain.ts` Category interface to add optional field_mappings (JSON with field_ids array and cached_at timestamp)
- [ ] T023 [P] Create form field type constants file at `src/features/ideas/constants/fieldTypes.ts` with FIELD_TYPES array and FIELD_TYPE_LABELS mapping

### Phase 2b: Supabase Query Layer (Test-First for Complex Queries)

**Goal**: Implement type-safe database queries via Supabase client

### Backend Service Tests (Failing Test-First)

- [ ] T024 Write failing integration test at `tests/integration/supabase-form-config.test.ts` → test fetchFormConfig(categoryId) returns correct fields in display_order
- [ ] T025 Write failing integration test for fetchCategoriesWithFields() returning all categories with ID, name, description
- [ ] T026 Write failing integration test for submitIdeaWithDynamicFields() creating idea with category_id + dynamic_form_data

### Backend Services Implementation

- [ ] T027 Implement `src/services/supabase/client.ts` function fetchFormConfig(categoryId: string): Promise<{configuration, fields}>
  - Query form_configurations for category_id
  - Join with form_fields to get field metadata
  - Return fields sorted by display_order
  - Ensure FormField type safety
- [ ] T028 Implement function fetchCategoriesWithFields() in supabase/client.ts returning Category[] with all necessary metadata
- [ ] T029 Implement function submitIdeaWithDynamicFields(ideaData) in supabase/client.ts
  - Handle file upload to ideas-attachments bucket (optional)
  - Insert idea record with category_id, dynamic_form_data, attachment_url
  - Return created idea with all fields
  - Include user_id from auth context
- [ ] T030 Implement function fetchFormFieldsForCategories(categoryIds: string[]) for multi-category queries (utility for admin views)
- [ ] T031 [P] Implement query caching strategy in a new hook `src/features/ideas/hooks/useFormConfigCache.ts` using SWR
  - Cache form config for 5 minutes
  - Invalidate on manual refresh
  - Allow real-time updates if needed
- [ ] T032 [P] Write integration tests for all Supabase queries in `tests/integration/supabase-queries.test.ts` verifying error handling (404, validation errors, etc.)
- [ ] T033 Run Playwright test against live Supabase instance to verify query correctness end-to-end

---

## Phase 3: User Story 1 (P1) - Submit idea with category-dependent fields

**Goal**: Enable users to submit ideas with dynamic form fields that change based on selected category

**Acceptance Criteria**:
- User can select a category from dropdown before filling form fields
- Form displays only fields applicable to selected category
- User can submit idea with title, description, category, and dynamic form values
- Submitted idea is stored with category_id and dynamic_form_data in database

**Dependencies**: Phase 1 (infrastructure) + Phase 2 (types & queries)

**Test Priority**: High (core feature)

### User Story 1: Tests (Failing Test-First Gate)

- [ ] T050 [US1] Write failing unit tests at `tests/unit/idea-form-visibility.test.ts` for field visibility logic
  - Test: For selected category A, only fields with applicable_categories including A are visible
  - Test: Changing categories updates visible fields
  - Test: Shared fields appear in all categories
  - Test: Category-specific fields do not appear outside their category

### User Story 1: Component Implementation

- [ ] T051 [P] [US1] Create FormFieldInput component at `src/features/ideas/components/FormFieldInput.tsx`
  - Props: {field: FormField, value: any, error?: string, onChange, onBlur, isTouched: boolean}
  - Render based on field.field_type:
    - text: <input type="text" />
    - textarea: <textarea></textarea>
    - select: <select><option></select> (populate options from field.validation_rules[categoryId].allowed_values)
    - checkbox: <input type="checkbox" />
    - radio: <input type="radio" />
    - file: <input type="file" /> with upload preview
  - Show placeholder, help_text, error message
  - Apply ARIA labels (aria-invalid, aria-describedby)
- [ ] T052 [P] [US1] Create FormFieldRenderer component at `src/features/ideas/components/FormFieldRenderer.tsx`
  - Props: {fields: FormField[], formState: FormState, dispatch}
  - Iterate over visible fields (filtered by selectedCategory)
  - Pass field metadata to FormFieldInput
  - Connect onChange→setFieldValue, onBlur→touchField
- [ ] T053 [US1] Create/Extend IdeaForm component at `src/features/ideas/IdeaForm.tsx`
  - Initialize basic form state (category selector only for this story)
  - Fetch categories on mount: useEffect(() => { fetchCategoriesWithFields() }, [])
  - Add category dropdown <select> at top of form
  - On category change: fetch FormConfig for new category
  - Render FormFieldRenderer below category selector with filtered fields
  - No changes to title/description fields (remain static, always visible)
- [ ] T054 [US1] Implement category dropdown with fallback for "no categories available" state
- [ ] T055 [P] [US1] Write integration test at `tests/integration/dynamic-form-rendering.test.ts` mounting IdeaForm and verifying field visibility per category
- [ ] T056 [P] [US1] Write E2E test at `tests/e2e/form-field-visibility.spec.ts` using Playwright
  - Navigate to idea form
  - Select category A → verify fields for A visible
  - Select category B → verify fields for B visible
  - Verify shared fields persist across category changes

### User Story 1: Submission Handler

- [ ] T057 [P] [US1] Write failing E2E test at `tests/e2e/dynamic-form-submission.spec.ts` for basic submission flow
  - Test: Select category, fill required fields, submit → idea created with category_id
  - Test: Skip optional field, submit → success with missing field
  - Test: Dynamic form data persisted to database
- [ ] T058 [US1] Implement form submit handler in IdeaForm.tsx (basic submission without validation for this story)
  - Prevent default
  - Collect dynamic_form_data from all visible fields
  - Call submitIdeaWithDynamicFields(title, description, category_id, dynamic_form_data)
  - Show success feedback (toast or redirect)
- [ ] T059 [P] [US1] Implement success feedback (toast notification or redirect to idea detail view)
- [ ] T060 [P] [US1] Handle submission errors (network errors, server validation errors)
  - Show general error message: "Failed to submit idea: [error message]"
  - Allow retry
- [ ] T061 [P] [US1] Add optimistic UI update: disable form during submission, show loading state
- [ ] T062 [US1] Write integration test at `tests/integration/form-submission-basic.test.ts` verifying basic submission flow without validation
- [ ] T063 [US1] Run complete E2E submission test (T057)

**User Story 1 Success Criteria**:
- ✅ Users can select category and see appropriate fields
- ✅ Form submits with category_id + dynamic_form_data
- ✅ All E2E tests for field visibility + basic submission pass
- ✅ Zero errors submitting ideas with dynamic fields

---

## Phase 4: User Story 2 (P2) - Form validation adapts to category rules

**Goal**: Implement category-aware validation that enforces different rules per category

**Acceptance Criteria**:
- Form validates based on validation_rules stored per field per category
- Validation errors display inline under each field
- User cannot submit until all required fields are valid
- Validation rules include: required, pattern (regex), min/max length, allowed values
- Error messages are user-friendly and category-specific

**Dependencies**: Phase 1 (infrastructure) + Phase 2 (types & queries) + Phase 3 (basic form submission)

**Test Priority**: Critical (business logic)

### User Story 2: Validation Engine Tests (Failing Test-First Gate)

- [ ] T064 [US2] Write failing unit tests at `tests/unit/idea-field-validation.test.ts` for buildValidationSchemaForCategory()
  - Test: For category A with "timeline" required, validation should fail if timeline is missing
  - Test: For category B with "timeline" optional, validation should succeed if timeline is missing
  - Test: Pattern validation (regex) is applied per category
  - Test: Required field error messages are category-specific
- [ ] T065 [US2] Write failing unit test for validateFormData(categoryId, formData, fields): Promise<{isValid, errors}>
  - Test: Valid form data passes validation
  - Test: Invalid form data returns detailed error map {fieldId: errorMessage}
  - Test: Zod error messages are user-friendly
- [ ] T066 [US2] Write failing unit test for handling all 6 field types (text, textarea, select, checkbox, radio, file) in validation
  - Test: Text field with regex pattern
  - Test: Select field with allowed_values constraint
  - Test: Checkbox/radio boolean validation
  - Test: File field (optional URL validation)

### User Story 2: Validation Engine Implementation

- [ ] T067 [US2] Create `src/features/ideas/ideaValidation.ts` with function buildValidationSchemaForCategory(categoryId: string, fields: FormField[]): z.ZodSchema
  - Iterate FormField array
  - For each field, extract validation_rules[categoryId]
  - Build Zod schema based on field_type + category-specific rules
  - Handle all 6 field types (text: minLength/maxLength/pattern, select: enum, checkbox: boolean, file: string (URL), etc.)
  - Return combined Zod object schema
- [ ] T068 [US2] Implement validateFormData(categoryId, formData, fields) function
  - Call buildValidationSchemaForCategory()
  - Use schema.parseAsync(formData) in try-catch
  - Return {isValid: true, errors: {}} on success
  - Return {isValid: false, errors: {fieldId: message}} on failure
  - Ensure Zod errors are converted to user-friendly messages
- [ ] T069 [P] [US2] Create utility function buildErrorMessage(zodIssue, field) to format Zod validation errors for UI display
- [ ] T070 [P] [US2] Write unit tests to verify each field type validation (text patterns, select enums, required fields, etc.) at `tests/unit/field-type-validation.test.ts`
- [ ] T071 [P] [US2] Add tests for edge case validations: field removed, validation rule changed mid-form (defensive validation)
- [ ] T072 [US2] Verify validation logic passes all tests (target 90%+ coverage for ideaValidation.ts)

### User Story 2: Form State & Validation Integration

- [ ] T073 [US2] Write failing unit tests at `tests/unit/form-state-with-validation.test.ts` for useFormState hook with validation
  - Test: setFieldValue triggers validation for that field
  - Test: Validation errors stored in formState.errors
  - Test: Touched fields trigger error display
  - Test: Form cannot be submitted if errors exist
- [ ] T074 [US2] Create custom hook `src/features/ideas/hooks/useFormState.ts` with reducer pattern
  - Reducer state: {selectedCategory, formData, errors, isDirty, isTouched, isSubmitting}
  - Actions: SET_CATEGORY, SET_FIELD_VALUE, SET_FIELD_ERROR, TOUCH_FIELD, RESET_FORM, START_SUBMIT, SUBMIT_ERROR, SUBMIT_SUCCESS
  - Integrate with validation engine (validate on field change)
- [ ] T075 [US2] Implement reducer switch cases for all 8 actions with validation
  - SET_FIELD_VALUE: validate field immediately, update errors
  - TOUCH_FIELD: allow error display on blur
  - Other actions as before
- [ ] T076 [P] [US2] Create useCallback hooks for dispatch actions: setSelectedCategory, setFieldValue, setFieldError, touchField, resetForm, startSubmit
- [ ] T077 [P] [US2] Write integration test at `tests/integration/form-state-with-validation.test.ts` testing validation during typing
- [ ] T078 [US2] Verify form state + validation tests pass with 90%+ coverage

### User Story 2: Error Display UI

- [ ] T079 [US2] Update FormFieldInput to display validation errors
  - Show error message from formState.errors[fieldId]
  - Show error color/border on input field (Tailwind: border-red-500)
  - Clear error onFocus of field
  - Display helper text below field with error
- [ ] T080 [US2] Update IdeaForm submit handler to validate before submission
  - Prevent default
  - Call validateFormData(selectedCategory, formData, formFields)
  - If validation fails: display errors via dispatch(SET_FIELD_ERROR), show summary message, don't submit
  - If validation succeeds: proceed with submitIdeaWithDynamicFields()
- [ ] T081 [P] [US2] Add form-level error message display at top of form
- [ ] T082 [US2] Write integration test at `tests/integration/form-submission-with-validation.test.ts` verifying validation → submission flow
- [ ] T083 [US2] Run E2E test verifying validation errors block submission (extend T057)

**User Story 2 Success Criteria**:
- ✅ Validation rules applied per category per field
- ✅ Validation errors display inline under fields
- ✅ Form cannot submit if validation fails
- ✅ All validation tests pass (90%+ coverage)
- ✅ Error messages are clear and actionable
- ✅ All 6 field types validated correctly

---

## Phase 5: User Story 4 (P2) - Form state persists during category changes

**Goal**: Ensure user data is never lost when switching categories, and form state is preserved

**Acceptance Criteria**:
- When user switches category, shared field values are preserved
- Category-specific field values are cached and restored if category selected again
- Form dirty state reflects all accumulated changes
- Validation errors cleared when field becomes invisible on category change

**Dependencies**: Phase 1 (infrastructure) + Phase 2 (types & queries) + Phase 3 (basic form) + Phase 4 (validation & state hook)

**Test Priority**: High (UX critical)

### User Story 4: State Preservation Tests (Failing Test-First Gate)

- [ ] T084 [US4] Write failing unit test at `tests/unit/form-state-category-switching.test.ts`
  - Test: Fill field A (exists in categories 1 & 2) → switch category → field A value preserved
  - Test: Fill field B (only in category 1) → switch to category 2 → field B disappears, value cached
  - Test: Switch back to category 1 → field B value restored
  - Test: Clear field B → switch back to category 1 → field B empty (not restored if manually cleared)
  - Test: Dirty flag updated when field cleared

### User Story 4: Smart Category Switching Implementation

- [ ] T085 [US4] Update useFormState reducer to implement smart category switching
  - On SET_CATEGORY action:
    - Identify visible fields in new category
    - Keep formData values for fields that remain visible (shared fields)
    - Store category-specific field values in separate cache for restoration if category selected again
    - Clear validation errors for fields that are no longer visible
- [ ] T086 [US4] Implement field value caching mechanism in useFormState
  - Cache per category: {categoryId: {fieldId: value}}
  - On category change: save current category's field values, restore new category's cached values
  - Shared fields never cached, always in main formData
- [ ] T087 [P] [US4] Add unit tests verifying state preservation matches acceptance scenario #2 in spec US-4
- [ ] T088 [P] [US4] Write E2E test at `tests/e2e/form-state-preservation.spec.ts` with Playwright
  - Fill form for category A
  - Switch to category B
  - Verify shared field values persist
  - Switch back to category A
  - Verify category A specific fields are restored (if implemented)
- [ ] T089 [US4] Test backward compatibility: ensure Phase 1 submissions (no dynamic_form_data) don't cause errors
- [ ] T090 [US4] Verify form state preservation tests pass

**User Story 4 Success Criteria**:
- ✅ Shared field values preserved on category switch
- ✅ Category-specific values cached and restored correctly
- ✅ No data loss when switching categories multiple times
- ✅ Dirty flag accurate after category switches
- ✅ All E2E tests for state preservation pass

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Ensure backward compatibility, accessibility, comprehensive testing, and deployment readiness

### Phase 6a: Backward Compatibility & Legacy Submissions

**Goal**: Ensure Phase 1 ideas remain fully accessible and displayable

### Backward Compat Tests (Failing Test-First Gate)

- [ ] T091 Write failing integration test at `tests/integration/phase1-backward-compat.test.ts`
  - Test: Query Phase 1 idea by ID → returns all fields (no category_id needed)
  - Test: List ideas view displays both Phase 1 (no category) and Phase 2 (with category) ideas
  - Test: Idea detail view handles missing dynamic_form_data gracefully
- [ ] T092 Write E2E test at `tests/e2e/phase1-ideas-display.spec.ts`
  - Navigate to my ideas
  - Verify Phase 1 ideas display without errors
  - Click Phase 1 idea detail → display without category badge or dynamic fields

### Implementation

- [ ] T093 Ensure Supabase backfill assigned all Phase 1 ideas to LEGACY_SUBMISSION category
- [ ] T094 Update idea detail / list views to handle missing dynamic_form_data (default to {})
- [ ] T095 [P] Add "VIEW" badge or prefix for Phase 1 ideas: "Legacy (Submitted before dynamic forms)"
- [ ] T096 [P] In admin idea list, include column to distinguish Phase 1 vs Phase 2 ideas
- [ ] T097 [P] Write test verifying Phase 1 ideas with null category_id are handled (defensive nullability check)
- [ ] T098 Ensure all tests pass (backward compatibility integration + e2e)

### Phase 6b: Accessibility & UI Polish

### Phase 6b: Accessibility & UI Polish

**Goal**: Ensure dynamic forms are accessible (WCAG 2.1 AA)

- [ ] T099 [P] Add <label> elements with htmlFor attributes to all FormFieldInput components
- [ ] T100 [P] Add aria-describedby pointing to help_text for each field
- [ ] T101 [P] Add aria-invalid="true" to inputs with errors
- [ ] T102 [P] Add aria-live="polite" to error message container for screen reader announcements
- [ ] T103 [P] Verify keyboard navigation: Tab through all fields, Enter to submit, Arrow keys for select/radio options
- [ ] T104 [P] Test with axe DevTools addon in Playwright to verify WCAG 2.1 AA compliance
- [ ] T105 [P] Ensure form is responsive on mobile (Tailwind responsive classes)
- [ ] T106 [P] Add visual feedback for loading/disabled states (button disabled appearance, spinner)
- [ ] T107 [P] Write accessibility test at `tests/e2e/form-accessibility.spec.ts` using axe Playwright plugin

### Phase 6c: Testing & Quality Gates

**Goal**: Achieve 80%+ test coverage, pass all quality checks

### Unit Test Coverage

- [ ] T108 Achieve 80%+ line coverage in:
  - `src/features/ideas/ideaValidation.ts` → validate all field types, error messages
  - `src/features/ideas/hooks/useFormState.ts` → all reducer actions, state transitions
  - `src/features/ideas/types/formSchema.ts` → type exports (no coverage target)
- [ ] T109 Run `npm test -- --coverage src/features/ideas/` and verify coverage meets target

### Integration Test Coverage

- [ ] T110 Test all database queries (fetchFormConfig, fetchCategoriesWithFields, submitIdeaWithDynamicFields)
- [ ] T111 Test Supabase RLS policies don't block form submissions
- [ ] T112 Test concurrent submissions from multiple users

### E2E Test Coverage (Playwright)

- [ ] T113 Test all 4 user story scenarios:
  - US-1: Category-dependent field display and submission
  - US-2: Category-specific validation rules
  - US-3: Configuration seed is correct (hardcoded configs appear)
  - US-4: Form state preservation on category switch
- [ ] T114 Test all edge cases:
  - No categories available (graceful fallback)
  - Empty form submission (validation error)
  - Network error during submission (error handling)
  - Phase 1 idea display (backward compatibility)

### Linting & Type Safety

- [ ] T115 Run ESLint on all new files: `npm run lint src/features/ideas/ tests/`
- [ ] T116 Run TypeScript check: `npm run type-check` → zero errors
- [ ] T117 Fix all linting/type violations before merge

### Performance Testing

- [ ] T118 Benchmark form re-render time on category change (target: <100ms)
- [ ] T119 Benchmark FormConfig fetch time (target: <200ms, cached after first fetch)
- [ ] T120 Profile memory usage with large forms (5-10 field types)

### Manual Testing Checklist

- [ ] T121 Smoke test on development environment:
  - Create new idea → select category → fill fields → submit
  - Verify idea appears in my ideas list with correct category
  - Verify admin can view idea with all captured dynamic_form_data
- [ ] T122 Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] T123 Test on mobile device/viewport

### Phase 6d: Documentation & Code Review

**Goal**: Document changes, prepare for human review, and merge to staging/main

### Documentation

- [ ] T124 Update `README.md` with Phase 2 form feature description and configuration guide
- [ ] T125 Update `CHANGELOG.md` with Phase 2 feature details (new tables, API changes, breaking changes: none)
- [ ] T126 [P] Add inline code comments explaining validation rules engine logic (ideaValidation.ts)
- [ ] T127 [P] Add JSDoc comments to exported functions (useFormState, fetchFormConfig, validateFormData)
- [ ] T128 Update `.github/agents/copilot-instructions.md` with Phase 2 patterns (form state management, validation)

### Code Review Preparation

- [ ] T129 Prepare PR description linking to:
  - Feature spec (specs/002-dynamic-forms/spec.md)
  - Implementation plan (specs/002-dynamic-forms/plan.md)
  - Test evidence (test results, coverage report)
  - Constitution compliance checklist:
    - ✅ Traces to user stories (US-1, US-2, US-3, US-4)
    - ✅ No stack deviations (React 18+, Tailwind, Supabase, Zod)
    - ✅ Test-first: all business logic has failing tests before implementation
    - ✅ Architecture: no breaking changes, backward compatible
    - ✅ AI accountability: validation engine + migrations reviewed by human
    
- [ ] T130 Request code review specifically for:
  1. **Validation Rules Engine** (src/features/ideas/ideaValidation.ts) → human must verify Zod schema builder correctness
  2. **Database Migrations** (all .sql files) → human must verify schema changes, backfill strategy, no data loss
  3. **Form State Preservation** (useFormState.ts) → human must verify state transitions on category switching
  4. **Type Safety** → human must verify TypeScript strict mode, no implicit any
  
- [ ] T131 Ensure reviewers confirm:
  - Zero functional regressions (Phase 1 ideas still work)
  - All tests passing (unit, integration, e2e)
  - Code coverage >80%
  - No security vulnerabilities (RLS policies, input validation)
  - No performance regressions (form re-render <100ms)

### Merge to Staging/Main

- [ ] T132 Deploy schema changes to staging environment (Supabase)
- [ ] T133 Run smoke tests on staging:
  - New idea submission with dynamic fields
  - Phase 1 idea display
  - Admin panel (ideas list, detail view)
- [ ] T134 Merge branch `002-dynamic-forms` to `staging` (ensure CI/CD passes all tests)
- [ ] T135 Run E2E tests against staging environment
- [ ] T136 After QA sign-off, merge `staging` to `main` (production deployment)


---

## Success Criteria (Phase 2 Complete)

**Overall Phase 2 Success**:
- ✅ All 136 tasks completed and merged to main branch
- ✅ Zero high-severity bugs in testing
- ✅ Line coverage 80%+ for modified modules (ideaValidation.ts, useFormState.ts, IdeaForm.tsx)
- ✅ All Playwright e2e tests passing

**User Story Success Criteria**:

| US | Priority | Acceptance | Tests | Status |
|----|---------:|------------|-------|--------|
| US-1 | P1 | Category selector + dynamic fields + basic submission | T050, T051-T063 | ✅ |
| US-2 | P2 | Validation rules applied per category, errors block submission | T064-T083 | ✅ |
| US-4 | P2 | Form state preserved during category switches, no data loss | T084-T090 | ✅ |
| US-3 | P3 | Configuration seed operational, hardcoded categories available | T010, T113 | ✅ |

**Measurable Outcomes (Post-Launch)**:
- ✅ **SC-001**: Form completion time decreases by 30%
- ✅ **SC-002**: Form submission success rate 95%+
- ✅ **SC-003**: Zero data loss on category changes (100% field value preservation)
- ✅ **SC-005**: 100% of Phase 1 ideas remain accessible without errors
- ✅ **Quality**: 80%+ test coverage, zero linting errors, TypeScript strict mode
- ✅ **Constitution**: All 5 principles verified, code review checkpoints completed

---

## Task Dependencies & Critical Path

```
Phase 1 (Infrastructure):
  T001-T015 (database setup, seeding, backward compat)
  ↓ Blocking all user stories
Phase 2 (Foundational):
  T016-T033 (types, queries)
  ↓ Blocking all user stories
Phase 3 (US-1 P1):
  T050-T063 (basic form + submission)
  ↓ Enables Phase 4 + Phase 5
Phase 4 (US-2 P2):
  T064-T083 (validation engine + state hook)
  ↓ Enables Phase 5
Phase 5 (US-4 P2):
  T084-T090 (state preservation)
  ↓ Enables Phase 6
Phase 6 (Polish):
  T091-T136 (backward compat, accessibility, testing, merge)
```

---

## Parallel Execution Opportunities

**Team Structure Recommendation** (for 3-4 developers):

| Developer Role | Tasks | Duration |
|---|---|---|
| **Database Specialist** | T001-T015, T024-T033 | Phases 1-2 (4-5 days) |
| **Frontend Lead** | T050-T062, T084-T090, T099-T106 | Phases 3, 5, 6 (8-10 days) |
| **QA/Test Engineer** | T024-T026, T064-T066, T084, T091-T092, T108-T123 | Phases 2-6 (6-8 days) |
| **Full-Stack** | T016-T023, T064-T083 | Phases 2, 4 (5-7 days) |

**Parallel Opportunities**:
- **Within Phase 2**: Type definitions (T016-T023) vs Supabase queries (T024-T033) can be split
- **Between Phases 3-4**: US-1 component work (T050-T062) vs US-2 validation (T064-T083) can run in parallel
- **Phase 6 Accessibility**: T099-T107 can run in parallel with Phase 5 state preservation
- **Testing**: T108-T123 can begin during Phase 5-6 once components are available

---

## Estimated Effort (Refined by User Story)

| Phase | Focus | Task Count | Est. Days | Team |
|-------|-------|-----------|-----------|------|
| 1 | Infrastructure | 15 | 2-3 | DB Specialist |
| 2 | Foundational | 18 | 2-3 | Full-Stack + DB Specialist |
| 3 | US-1: Basic Form | 14 | 3-4 | Frontend Lead |
| 4 | US-2: Validation | 20 | 3-4 | Full-Stack |
| 5 | US-4: State Preservation | 7 | 1-2 | Frontend Lead |
| 6a | Backward Compat | 8 | 1 | QA/Test Engineer |
| 6b | Accessibility | 9 | 1-2 | Frontend Lead |
| 6c | Testing & QA | 16 | 2-3 | QA/Test Engineer |
| 6d | Docs & Review | 12 | 1-2 | Full-Stack |
| **TOTAL** | **—** | **136** | **15-25 days** | **3-4 people** |

---

## Sprint Planning Recommendation (5 x 5-day sprints)

**Sprint 1** (Days 1-5): Infrastructure + Foundational
- T001-T015: Database setup (Database Specialist)
- T016-T033: Types + Queries + Failing tests (Full-Stack + QA)
- Goal: All tasks passing, database ready, types stable

**Sprint 2** (Days 6-10): User Story 1 Implementation
- T050-T063: Category selector, field rendering, basic submission (Frontend Lead)
- T024-T033: Backend queries finalized (Full-Stack)
- T055-T056: E2E tests for field visibility (QA)
- Goal: US-1 core functionality complete, all acceptance criteria met, tests passing

**Sprint 3** (Days 11-15): User Story 2 Implementation
- T064-T083: Validation engine, form state hook, error display (Full-Stack + Frontend Lead)
- T057, T063: Submission E2E tests (QA)
- T108-T109: Coverage checks (QA)
- Goal: US-2 validation complete, form cannot submit with errors, all validation tests pass

**Sprint 4** (Days 16-20): User Story 4 + Backward Compatibility
- T084-T090: State preservation (Frontend Lead)
- T091-T098: Backward compatibility (QA + Full-Stack)
- T110-T112: Database query tests (QA)
- Goal: State preserved on category switch, Phase 1 ideas work, all backward compat tests pass

**Sprint 5** (Days 21-25): Polish & Merge
- T099-T107: Accessibility (Frontend Lead)
- T113-T123: E2E coverage, manual testing (QA)
- T124-T136: Documentation, code review, merge (Full-Stack)
- Goal: All tasks complete, code reviewed, zero blockers, ready for production

---

## Known Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Database migration fails, data loss | Low | Critical | Test migrations on dev first; dry-run backfill script; human review (T130) |
| Phase 1 ideas break | Medium | Critical | Verify Phase 1 queries post-migration (T015); manual QA (T121-T123) |
| Form re-renders slowly (>100ms) | Low | Medium | Benchmark early (T118); memoize components if needed; profiling in T120 |
| Validation edge cases missed | Low | High | Comprehensive unit tests (T064-T071); test-first methodology |
| Form state lost on category switch | Low | Critical | Comprehensive tests (T084-T090); manual testing (T121) |
| Admin config mistakes (seed data) | Medium | Low | Verify seed matches spec categories; Phase 3 adds validation UI |

---

## Code Review Checkpoints (CA-005 Human Accountability)

**Before merging to main**, these components MUST be reviewed by a human:

1. **Validation Rules Engine** (`src/features/ideas/ideaValidation.ts`)
   - ✅ Zod schema builder logic
   - ✅ Handles all 6 field types correctly
   - ✅ Error messages are user-friendly
   - Reviewer: Backend/Full-Stack Lead

2. **Database Migrations** (all `.sql` files in `supabase/migrations/`)
   - ✅ Schema changes are correct
   - ✅ Backfill strategy handles all Phase 1 ideas
   - ✅ Zero data loss risk
   - ✅ Indexes created for performance
   - Reviewer: Database Specialist

3. **Form State Preservation** (`src/features/ideas/hooks/useFormState.ts`)
   - ✅ Category switching preserves shared field values
   - ✅ Category-specific values cached and restored
   - ✅ Dirty state accurate
   - Reviewer: Frontend Lead

4. **Type Safety**
   - ✅ TypeScript strict mode, zero implicit any
   - ✅ All FormField/FormConfiguration types exported correctly
   - ✅ Zod schemas match TypeScript interfaces
   - Reviewer: Full-Stack Lead

---

## Next Steps After Phase 2 Complete

1. **User Feedback Collection** (Day 26-30): Measure SC-001, SC-002 post-launch
   - Form completion time
   - Submission success rate
   - Error rates by category

2. **Phase 3 Planning** (Week 5): Multi-Media Support + Admin Configuration UI
   - New field types (date, file, rich-text)
   - Admin UI for managing category-field mappings
   - Batch idea exports

3. **Performance Optimization** (if needed):
   - Form re-render profiling
   - Query caching optimization
   - Component memoization

---

**Plan Status**: ✅ **User Story-Organized Task List Generated** → Ready for Team Assignment & Sprint Execution
