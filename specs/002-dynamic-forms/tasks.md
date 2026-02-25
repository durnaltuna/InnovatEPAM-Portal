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

## Phase 1: Setup & Infrastructure

**Goal**: Initialize database schema, seed configuration, and verify backward compatibility

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

## Phase 2: Type Definitions & Contracts

**Goal**: Define TypeScript interfaces and ensure type safety across the feature

- [ ] T016 [P] Create file `src/features/ideas/types/formSchema.ts` with FormField interface (id, field_key, field_type, label, validation_rules, applicable_categories, display_order)
- [ ] T017 [P] Create ValidationRulePerCategory interface in formSchema.ts with fields: required, pattern, min_length, max_length, min_value, max_value, allowed_values, errorMessage
- [ ] T018 [P] Create FormConfiguration interface in formSchema.ts (id, category_id, field_ids, created_at, updated_at)
- [ ] T019 [P] Create FormState interface in formSchema.ts (selectedCategory, formData, errors, isDirty, isTouched, isSubmitting)
- [ ] T020 [P] Create type aliases for field_type enum: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
- [ ] T021 Extend `src/types/domain.ts` Idea interface to add category_id (UUID FK) and dynamic_form_data (Record<string, any>)
- [ ] T022 Extend `src/types/domain.ts` Category interface to add optional field_mappings (JSON with field_ids array and cached_at timestamp)
- [ ] T023 [P] Create form field type constants file at `src/features/ideas/constants/fieldTypes.ts` with FIELD_TYPES array and FIELD_TYPE_LABELS mapping

---

## Phase 3: Supabase Query Layer (Test-First for Complex Queries)

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

## Phase 4: Validation Engine (Test-First Core Business Logic)

**Goal**: Implement category-aware form validation using Zod schema builder

### Failing Tests (Test-First Gate)

- [ ] T034 Write failing unit tests at `tests/unit/idea-field-validation.test.ts` for buildValidationSchemaForCategory()
  - Test: For category A with "timeline" required, validation should fail if timeline is missing
  - Test: For category B with "timeline" optional, validation should succeed if timeline is missing
  - Test: Pattern validation (regex) is applied per category
  - Test: Required field error messages are category-specific
- [ ] T035 Write failing unit test for validateFormData(categoryId, formData, fields): Promise<{isValid, errors}>
  - Test: Valid form data passes validation
  - Test: Invalid form data returns detailed error map {fieldId: errorMessage}
  - Test: Zod error messages are user-friendly
- [ ] T036 Write failing unit test for handling all 6 field types (text, textarea, select, checkbox, radio, file) in validation
  - Test: Text field with regex pattern
  - Test: Select field with allowed_values constraint
  - Test: Checkbox/radio boolean validation
  - Test: File field (optional URL validation)

### Validation Engine Implementation

- [ ] T037 Create `src/features/ideas/ideaValidation.ts` with function buildValidationSchemaForCategory(categoryId: string, fields: FormField[]): z.ZodSchema
  - Iterate FormField array
  - For each field, extract validation_rules[categoryId]
  - Build Zod schema based on field_type + category-specific rules
  - Handle all 6 field types (text: minLength/maxLength/pattern, select: enum, checkbox: boolean, file: string (URL), etc.)
  - Return combined Zod object schema
- [ ] T038 Implement validateFormData(categoryId, formData, fields) function
  - Call buildValidationSchemaForCategory()
  - Use schema.parseAsync(formData) in try-catch
  - Return {isValid: true, errors: {}} on success
  - Return {isValid: false, errors: {fieldId: message}} on failure
  - Ensure Zod errors are converted to user-friendly messages
- [ ] T039 [P] Create utility function buildErrorMessage(zodIssue, field) to format Zod validation errors for UI display
- [ ] T040 [P] Write unit tests to verify each field type validation (text patterns, select enums, required fields, etc.) at `tests/unit/field-type-validation.test.ts`
- [ ] T041 [P] Add tests for edge case validations: field removed, validation rule changed mid-form (defensive validation)
- [ ] T042 Verify validation logic passes all tests (target 90%+ coverage for ideaValidation.ts)

---

## Phase 5: Form State Management Hook (Test-First)

**Goal**: Implement React hook managing form state with category switching and value preservation

### Failing Tests (Test-First Gate)

- [ ] T043 Write failing unit tests at `tests/unit/form-state-preservation.test.ts` for useFormState hook
  - Test: setFieldValue updates state and marks isDirty
  - Test: Changing category preserves shared field values
  - Test: Changing category clears category-specific field values
  - Test: touchField marks field as touched for error display
  - Test: resetForm clears all state
  - Test: submitSuccess resets isDirty flag

### Form State Hook Implementation

- [ ] T044 Create custom hook `src/features/ideas/hooks/useFormState.ts` with reducer pattern
  - Reducer state: {selectedCategory, formData, errors, isDirty, isTouched, isSubmitting}
  - Actions: SET_CATEGORY, SET_FIELD_VALUE, SET_FIELD_ERROR, TOUCH_FIELD, RESET_FORM, START_SUBMIT, SUBMIT_ERROR, SUBMIT_SUCCESS
  - Implement category switching logic (preserve shared fields)
- [ ] T045 Implement reducer switch cases for all 8 actions
  - SET_CATEGORY: Mark isDirty, allow parent to pass new field configuration
  - SET_FIELD_VALUE: Update formData, clear error for that field
  - TOUCH_FIELD: Mark field as touched (for showing errors on blur)
  - RESET_FORM: Reset to initialState
  - START_SUBMIT→SUBMIT_ERROR→SUBMIT_SUCCESS: Handle submission flow
- [ ] T046 [P] Create useCallback hooks for dispatch actions: setSelectedCategory, setFieldValue, setFieldError, touchField, resetForm, startSubmit
- [ ] T047 [P] Implement form state persistence logic (optional: localStorage backup for session recovery)
- [ ] T048 Write integration test at `tests/integration/form-state-hook.test.ts` testing hook lifecycle with multiple category switches
- [ ] T049 Verify hook tests pass with 90%+ coverage

---

## Phase 6: Dynamic Field Rendering (Test-First Component Logic)

**Goal**: Implement React components for category selector and dynamic field rendering

### Failing Tests (Test-First Gate)

- [ ] T050 Write failing unit tests at `tests/unit/idea-form-visibility.test.ts` for field visibility logic
  - Test: For selected category A, only fields with applicable_categories including A are visible
  - Test: Changing categories updates visible fields
  - Test: Shared fields appear in all categories
  - Test: Category-specific fields do not appear outside their category

### Component Implementation

- [ ] T051 [P] Create FormFieldInput component at `src/features/ideas/components/FormFieldInput.tsx`
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
- [ ] T052 [P] Create FormFieldRenderer component at `src/features/ideas/components/FormFieldRenderer.tsx`
  - Props: {fields: FormField[], formState: FormState, dispatch}
  - Iterate over visible fields (filtered by selectedCategory)
  - Pass field metadata to FormFieldInput
  - Connect onChange→setFieldValue, onBlur→touchField
- [ ] T053 Create/Extend IdeaForm component at `src/features/ideas/IdeaForm.tsx`
  - Initialize useFormState hook
  - Fetch categories on mount: useEffect(() => { fetchCategoriesWithFields() }, [])
  - Add category dropdown <select> at top of form
  - On category change: fetch FormConfig for new category, update formState.selectedCategory
  - Render FormFieldRenderer below category selector with filtered fields
  - No changes to title/description fields (remain static, always visible)
- [ ] T054 Implement category dropdown with fallback for "no categories available" state
- [ ] T055 [P] Write integration test at `tests/integration/dynamic-form-rendering.test.ts` mounting IdeaForm and verifying field visibility per category
- [ ] T056 [P] Write E2E test at `tests/e2e/form-field-visibility.spec.ts` using Playwright
  - Navigate to idea form
  - Select category A → verify fields for A visible
  - Select category B → verify fields for B visible
  - Verify shared fields persist across category changes

---

## Phase 7: Form Submission & Validation Integration

**Goal**: Integrate validation + submission with dynamic form data

### Failing Tests (Test-First Gate)

- [ ] T057 Write failing E2E test at `tests/e2e/dynamic-form-submission.spec.ts` for complete submission flow
  - Test: Select category, fill all required fields, submit → idea created with category_id
  - Test: Skip optional field, submit → success with missing field
  - Test: Leave required field empty, submit → validation error shown

### Implementation

- [ ] T058 Implement form submit handler in IdeaForm.tsx
  - Prevent default
  - Call validateFormData(selectedCategory, formData, formFields)
  - If validation fails: display errors via dispatch(SET_FIELD_ERROR), show summary message
  - If validation succeeds: disable submit button, call submitIdeaWithDynamicFields()
- [ ] T059 Implement error display UI inline under each field with error state
  - Show error message from formState.errors[fieldId]
  - Show error color/border on input field (Tailwind: border-red-500)
  - Clear error onFocus of field
- [ ] T060 [P] Implement success feedback (toast notification or redirect to idea detail view)
- [ ] T061 [P] Handle submission errors (network errors, server validation errors)
  - Show general error message: "Failed to submit idea: [error message]"
  - Allow retry
- [ ] T062 [P] Add optimistic UI update: disable form during submission, show loading state
- [ ] T063 Write integration test at `tests/integration/form-submission.test.ts` verifying validation → submission flow without UI
- [ ] T064 Run complete E2E submission test in Playwright (T057)

---

## Phase 8: Form State Preservation During Category Changes

**Goal**: Ensure user data is never lost when switching categories

### Failing Tests (Test-First Gate)

- [ ] T065 Write failing unit test at `tests/unit/form-state-category-switching.test.ts`
  - Test: Fill field A (exists in both categories) → switch category → field A value preserved
  - Test: Fill field B (only in category 1) → switch to category 2 → field B disappears, value stored
  - Test: Switch back to category 1 → field B value restored
  - Test: Clear field B → switch back to category 1 → field B empty (not restored if manually cleared)

### Implementation

- [ ] T066 Update useFormState reducer to implement smart category switching
  - On SET_CATEGORY action:
    - Identify visible fields in new category
    - Keep formData values for fields that remain visible (shared fields)
    - *(Optionally)* Store category-specific field values in a separate cache for restoration if category selected again
- [ ] T067 [P] Add unit tests verifying state preservation matches acceptance scenario #2 in spec US-4
- [ ] T068 [P] Write E2E test at `tests/e2e/form-state-preservation.spec.ts` with Playwright
  - Fill form for category A
  - Switch to category B
  - Verify shared field values persist
  - Switch back to category A
  - Verify category A specific fields are restored (if implemented)
- [ ] T069 Test backward compatibility: ensure Phase 1 submissions (no dynamic_form_data) don't cause errors

---

## Phase 9: Backward Compatibility & Legacy Submissions (Integration)

**Goal**: Ensure Phase 1 ideas remain fully accessible and displayable

### Failing Tests (Test-First Gate)

- [ ] T070 Write failing integration test at `tests/integration/phase1-backward-compat.test.ts`
  - Test: Query Phase 1 idea by ID → returns all fields (no category_id needed)
  - Test: List ideas view displays both Phase 1 (no category) and Phase 2 (with category) ideas
  - Test: Idea detail view handles missing dynamic_form_data gracefully
- [ ] T071 Write E2E test at `tests/e2e/phase1-ideas-display.spec.ts`
  - Navigate to my ideas
  - Verify Phase 1 ideas display without errors
  - Click Phase 1 idea detail → display without category badge or dynamic fields

### Implementation

- [ ] T072 Ensure Supabase backfill assigned all Phase 1 ideas to LEGACY_SUBMISSION category
- [ ] T073 Update idea detail / list views to handle missing dynamic_form_data (default to {})
- [ ] T074 [P] Add "VIEW" badge or prefix for Phase 1 ideas: "Legacy (Submitted before dynamic forms)"
- [ ] T075 [P] In admin idea list, include column to distinguish Phase 1 vs Phase 2 ideas
- [ ] T076 [P] Write test verifying Phase 1 ideas with null category_id are handled (defensive nullability check)
- [ ] T077 Ensure all tests pass (backward compatibility integration + e2e)

---

## Phase 10: Accessibility & UI Polish

**Goal**: Ensure dynamic forms are accessible (WCAG 2.1 AA)

- [ ] T078 [P] Add <label> elements with htmlFor attributes to all FormFieldInput components
- [ ] T079 [P] Add aria-describedby pointing to help_text for each field
- [ ] T080 [P] Add aria-invalid="true" to inputs with errors
- [ ] T081 [P] Add aria-live="polite" to error message container for screen reader announcements
- [ ] T082 [P] Verify keyboard navigation: Tab through all fields, Enter to submit, Arrow keys for select/radio options
- [ ] T083 [P] Test with axe DevTools addon in Playwright to verify WCAG 2.1 AA compliance
- [ ] T084 [P] Ensure form is responsive on mobile (Tailwind responsive classes)
- [ ] T085 [P] Add visual feedback for loading/disabled states (button disabled appearance, spinner)
- [ ] T086 [P] Write accessibility test at `tests/e2e/form-accessibility.spec.ts` using axe Playwright plugin

---

## Phase 11: Testing & Quality Gates

**Goal**: Achieve 80%+ test coverage, pass all quality checks

### Unit Test Coverage

- [ ] T087 Achieve 80%+ line coverage in:
  - `src/features/ideas/ideaValidation.ts` → validate all field types, error messages
  - `src/features/ideas/hooks/useFormState.ts` → all reducer actions, state transitions
  - `src/features/ideas/types/formSchema.ts` → type exports (no coverage target)
- [ ] T088 Run `npm test -- --coverage src/features/ideas/` and verify coverage meets target

### Integration Test Coverage

- [ ] T089 Test all database queries (fetchFormConfig, fetchCategoriesWithFields, submitIdeaWithDynamicFields)
- [ ] T090 Test Supabase RLS policies don't block form submissions
- [ ] T091 Test concurrent submissions from multiple users

### E2E Test Coverage (Playwright)

- [ ] T092 Test all 4 user story scenarios:
  - US-1: Category-dependent field display and submission
  - US-2: Category-specific validation rules
  - US-3: Configuration seed is correct (hardcoded configs appear)
  - US-4: Form state preservation on category switch
- [ ] T093 Test all edge cases:
  - No categories available (graceful fallback)
  - Empty form submission (validation error)
  - Network error during submission (error handling)
  - Phase 1 idea display (backward compatibility)

### Linting & Type Safety

- [ ] T094 Run ESLint on all new files: `npm run lint src/features/ideas/ tests/`
- [ ] T095 Run TypeScript check: `npm run type-check` → zero errors
- [ ] T096 Fix all linting/type violations before merge

### Performance Testing

- [ ] T097 Benchmark form re-render time on category change (target: <100ms)
- [ ] T098 Benchmark FormConfig fetch time (target: <200ms, cached after first fetch)
- [ ] T099 Profile memory usage with large forms (5-10 field types)

### Manual Testing Checklist

- [ ] T100 Smoke test on development environment:
  - Create new idea → select category → fill fields → submit
  - Verify idea appears in my ideas list with correct category
  - Verify admin can view idea with all captured dynamic_form_data
- [ ] T101 Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] T102 Test on mobile device/viewport

---

## Phase 12: Documentation & Code Review

**Goal**: Document changes, prepare for human review, and merge to staging/main

### Documentation

- [ ] T103 Update `README.md` with Phase 2 form feature description and configuration guide
- [ ] T104 Update `CHANGELOG.md` with Phase 2 feature details (new tables, API changes, breaking changes: none)
- [ ] T105 [P] Add inline code comments explaining validation rules engine logic (ideaValidation.ts)
- [ ] T106 [P] Add JSDoc comments to exported functions (useFormState, fetchFormConfig, validateFormData)
- [ ] T107 Update `.github/agents/copilot-instructions.md` with Phase 2 patterns (form state management, validation)

### Code Review Preparation

- [ ] T108 Prepare PR description linking to:
  - Feature spec (specs/002-dynamic-forms/spec.md)
  - Implementation plan (specs/002-dynamic-forms/plan.md)
  - Test evidence (test results, coverage report)
  - Constitution compliance checklist:
    - ✅ Traces to user stories (US-1, US-2, US-3, US-4)
    - ✅ No stack deviations (React 18+, Tailwind, Supabase, Zod)
    - ✅ Test-first: all business logic has failing tests before implementation
    - ✅ Architecture: no breaking changes, backward compatible
    - ✅ AI accountability: validation engine + migrations reviewed by human
    
- [ ] T109 Request code review specifically for:
  1. **Validation Rules Engine** (src/features/ideas/ideaValidation.ts) → human must verify Zod schema builder correctness
  2. **Database Migrations** (all .sql files) → human must verify schema changes, backfill strategy, no data loss
  3. **Form State Preservation** (useFormState.ts) → human must verify state transitions on category switching
  4. **Type Safety** → human must verify TypeScript strict mode, no implicit any
  
- [ ] T110 Ensure reviewers confirm:
  - Zero functional regressions (Phase 1 ideas still work)
  - All tests passing (unit, integration, e2e)
  - Code coverage >80%
  - No security vulnerabilities (RLS policies, input validation)
  - No performance regressions (form re-render <100ms)

### Merge to Staging/Main

- [ ] T111 Deploy schema changes to staging environment (Supabase)
- [ ] T112 Run smoke tests on staging:
  - New idea submission with dynamic fields
  - Phase 1 idea display
  - Admin panel (ideas list, detail view)
- [ ] T113 Merge branch `002-dynamic-forms` to `staging` (ensure CI/CD passes all tests)
- [ ] T114 Run E2E tests against staging environment
- [ ] T115 After QA sign-off, merge `staging` to `main` (production deployment)

---

## Success Criteria (Phase 2 Complete)

- [ ] **SC-001**: Form completion time decreases by 30% (measure post-launch)
- [ ] **SC-002**: Form submission success rate 95%+ (measure post-launch)
- [ ] **SC-003**: Zero data loss on category changes (100% field value preservation, verified in tests)
- [ ] **SC-004**: Configuration changes effective within 1 minute (seed is static; config UI deferred to Phase 3)
- [ ] **SC-005**: 100% of Phase 1 ideas remain accessible without errors (verified in backward compat tests)
- [ ] **SC-006**: Admin configuration interface usable by 90% of users (seeded config is hardcoded; admin UI Phase 3)
- [ ] **Quality**: 80%+ test coverage, zero linting errors, TypeScript strict mode
- [ ] **Constitution**: All 5 principles verified, code review checkpoints completed, no deviations

---

## Task Dependencies & Critical Path

```
Phase 1 (Infrastructure):
  T001-T015 (database setup, seeding, validation)
  ↓
Phase 2-4 (Type definitions, queries, validation logic):
  T016-T049 (can run in parallel once Phase 1 complete)
  ↓
Phase 5-7 (UI components, form state, submission):
  T050-T064 (depends on validation + state hook)
  ↓
Phase 8-10 (State preservation, backward compat, accessibility):
  T065-T086 (depends on component implementation)
  ↓
Phase 11-12 (Testing, code review, merge):
  T087-T115 (final quality gate + deployment)
```

## Parallel Execution Opportunities

- **Phase 1**: T001-T015 can be split: Database schema (T001-T009) vs Seeding (T010-T011)
- **Phase 2-3**: Type definitions and Supabase queries are independent; assign to different developers
- **Phase 4-5**: Validation engine and Form State hook can be implemented in parallel once types are defined
- **Phase 6-7**: Form component and submission handler depend on states/validation being complete
- **Phase 8-10**: Backward compat and accessibility are independent; can happen in parallel with QA

---

## Estimated Effort

| Phase | Task Count | Est. Effort | Dependencies |
|-------|-----------|-------------|--------------|
| Phase 1 (Infrastructure) | 15 | 2-3 days | DB credentials, migrations |
| Phase 2 (Types) | 8 | 0.5 days | None |
| Phase 3 (Queries) | 10 | 2 days | Phase 1 complete |
| Phase 4 (Validation) | 9 | 2-3 days | Phase 2 complete |
| Phase 5 (State Hook) | 7 | 1-2 days | Phase 2 complete |
| Phase 6 (Components) | 7 | 2-3 days | Phase 4-5 complete |
| Phase 7 (Submission) | 8 | 1-2 days | Phase 6 complete |
| Phase 8 (State Preservation) | 5 | 1 day | Phase 5-6 complete |
| Phase 9 (Backward Compat) | 6 | 1 day | Phase 1 migrations |
| Phase 10 (Accessibility) | 9 | 1-2 days | Phase 6 complete |
| Phase 11 (Testing) | 16 | 2-3 days | All phases |
| Phase 12 (Docs + Merge) | 8 | 1 day | Phase 11 complete |
| **TOTAL** | **115** | **15-25 days** | — |

---

## Sprint Planning Recommendation

**Sprint 1** (5 days):
- Phase 1 (Infrastructure)
- Phase 2 (Types)
- Phase 3 (Queries - tests + queries only, not all implementation)

**Sprint 2** (5 days):
- Phase 4 (Validation) - test-first implementation
- Phase 5 (Form State Hook) - test-first implementation
- Phase 6a (Components setup)

**Sprint 3** (5 days):
- Phase 6b (Form components) - complete
- Phase 7 (Submission integration)
- Phase 8 (State preservation)

**Sprint 4** (5 days):
- Phase 9 (Backward compatibility)
- Phase 10 (Accessibility)
- Phase 11a (Testing)

**Sprint 5** (5 days):
- Phase 11b (Testing - completion + coverage)
- Phase 12 (Documentation, review, merge)

---

## Known Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Database migration fails, data loss | Low | Critical | Test migrations on dev first; dry-run backfill script |
| Phase 1 ideas break | Medium | Critical | Verify Phase 1 queries post-migration (T015); manual QA |
| Form re-renders slowly (>100ms) | Low | Medium | Benchmark with React DevTools; memoize if needed |
| Validation error messages unclear | Low | Medium | User testing post-launch; Phase 3 UI refinement |
| Admin config mistakes (seed data wrong) | Medium | Low | Verify seed matches spec categories; phase 3 adds validation UI |
| Wide field values lost on category switch | Low | Critical | Comprehensive tests (T065-T069); manual testing |

---

## Next Steps After Task Completion

1. **Register test results** in release notes and traceability matrix
2. **Plan Phase 3** (Multi-Media Support) using Phase 2 form infrastructure
3. **Gather user feedback** on form completion time/success rate (measure SC-001, SC-002)
4. **Schedule Phase 3 Admin Configuration UI** based on user satisfaction

---

**Plan Status**: ✅ **Detailed Task List Generated** → Ready for Sprint Planning & Assignment
