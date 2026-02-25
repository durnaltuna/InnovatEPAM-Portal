# Implementation Tasks Overview: Phase 2 - Dynamic Form Fields

**Feature**: Smart Submission Forms (Dynamic Fields)  
**Date**: February 25, 2026  
**Status**: Phase 1 (Design) Complete → Ready for Phase 2 (Implementation)  
**Estimated Scope**: 15-20 implementation tasks (details in `/speckit.tasks`)

---

## Task Phases

### Phase 2a: Infrastructure Setup
- [ ] **Task 001**: Run database migrations (form_fields, form_configurations tables; extend categories, ideas)
- [ ] **Task 002**: Create seed data script for initial form_fields + form_configurations from formConfigs.ts
- [ ] **Task 003**: Backfill category_id for Phase 1 ideas (assign to LEGACY_SUBMISSION category)
- [ ] **Task 004**: Verify Phase 1 queries still work post-migration (backward compatibility check)

### Phase 2b: Type Definitions & Types
- [ ] **Task 005**: Create src/features/ideas/types/formSchema.ts (FormField, ValidationRulePerCategory, FormConfiguration interfaces)
- [ ] **Task 006**: Extend src/types/domain.ts with category_id and dynamic_form_data on Idea model
- [ ] **Task 007**: Create form field type constants and validators (field_type enum validation)

### Phase 2c: Backend Services (Supabase Queries)
- [ ] **Task 008**: Implement fetchFormConfig(categoryId) query in supabase/client.ts
- [ ] **Task 009**: Implement fetchCategoriesWithFields() query
- [ ] **Task 010**: Implement submitIdeaWithDynamicFields() mutation (create idea + store dynamic_form_data)
- [ ] **Task 011**: Write integration tests for Supabase queries (connection, data retrieval)

### Phase 2d: Validation Engine (Test-First)
- [ ] **Task 012**: Write failing unit tests for buildValidationSchemaForCategory() (test-first gate)
- [ ] **Task 013**: Implement ideaValidation.ts with validation schema builder (Zod-based)
- [ ] **Task 014**: Implement validateFormData() function with error formatting
- [ ] **Task 015**: Write category-specific validation unit tests (required field rules, patterns, etc.)

### Phase 2e: Form State Management (Test-First)
- [ ] **Task 016**: Write failing unit tests for useFormState hook (test-first gate)
- [ ] **Task 017**: Implement useFormState hook (reducer + callbacks)
- [ ] **Task 018**: Write tests for form state preservation on category change
- [ ] **Task 019**: Write tests for field value reset on category switch

### Phase 2f: IdeaForm Component & Field Rendering (Test-First)
- [ ] **Task 020**: Write failing tests for category selector dropdown (test-first gate)
- [ ] **Task 021**: Extend IdeaForm.tsx to add category dropdown
- [ ] **Task 022**: Write failing tests for dynamic field visibility
- [ ] **Task 023**: Implement FormRenderer component for rendering FormField objects
- [ ] **Task 024**: Implement dynamic field rendering based on visible fields
- [ ] **Task 025**: Write failing tests for field value preservation on category change
- [ ] **Task 026**: Implement field value preservation logic

### Phase 2g: Form Submission & Integration
- [ ] **Task 027**: Integrate submitIdeaWithDynamicFields() into form submit handler
- [ ] **Task 028**: Implement error handling and user feedback (validation errors, submission errors)
- [ ] **Task 029**: Write end-to-end tests (Playwright) for complete form submission workflow

### Phase 2h: Backward Compatibility & Admin Views
- [ ] **Task 030**: Ensure Phase 1 ideas display correctly with LEGACY_SUBMISSION category badge
- [ ] **Task 031**: Test admin idea list/detail views with both Phase 1 and Phase 2 ideas
- [ ] **Task 032**: Write backward compatibility integration tests

### Phase 2i: Accessibility & UI Polish
- [ ] **Task 033**: Add ARIA labels and error announcements to dynamic form fields
- [ ] **Task 034**: Test keyboard navigation (Tab, Enter, arrow keys)
- [ ] **Task 035**: Verify WCAG 2.1 Level AA compliance with axe DevTools

### Phase 2j: Testing & Quality Gates
- [ ] **Task 036**: Run full test suite (unit, integration, e2e), achieve 80%+ line coverage
- [ ] **Task 037**: Run linting (ESLint) and type checks (TypeScript), fix all errors
- [ ] **Task 038**: Performance testing: form re-render < 100ms, config fetch < 200ms
- [ ] **Task 039**: Verify Supabase schema indexes are created for performance

### Phase 2k: Documentation & Code Review
- [ ] **Task 040**: Code review of validation engine logic (CA-005 human accountability)
- [ ] **Task 041**: Code review of database migration strategy (CA-005 human accountability)
- [ ] **Task 042**: Update README.md or developer docs with Phase 2 form features
- [ ] **Task 043**: Update CHANGELOG.md with Phase 2 feature details

### Phase 2l: Deployment & Verification
- [ ] **Task 044**: Deploy schema changes to development environment
- [ ] **Task 045**: Deploy seed data to development environment
- [ ] **Task 046**: Smoke test: submit idea with dynamic fields, verify in database
- [ ] **Task 047**: Merge to staging branch, run full test suite in CI/CD
- [ ] **Task 048**: Merge to main branch after approval

---

## Implementation Priorities

**Critical (Must Complete)**:
- Phase 2a: Database infrastructure
- Phase 2d: Validation engine (test-first, business logic core)
- Phase 2e: Form state management (test-first)
- Phase 2f: Dynamic field rendering (core feature)
- Phase 2j: Testing & Quality Gates

**Important (Should Complete)**:
- Phase 2c: Supabase queries
- Phase 2h: Backward compatibility
- Phase 2j: Code review checkpoints

**Nice-to-Have (Can Defer)**:
- Phase 2i: Advanced accessibility features
- Phase 2k: Detailed documentation

---

## Test Coverage Requirements

| Module | Test Type | Coverage Target |
|--------|-----------|-----------------|
| ideaValidation.ts | Unit (Vitest) | 85%+ |
| useFormState.ts | Unit (Vitest) | 90%+ |
| IdeaForm.tsx | Integration (Vitest) + E2E (Playwright) | 80%+ |
| Category field visibility | Integration | 95%+ |
| Dynamic submission workflow | E2E (Playwright) | 100% (critical flows) |
| Backward compatibility | Integration | 100% |

---

## Known Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Phase 1 ideas break during backfill | Medium | Critical | Test migration script in dev first; validate Phase 1 queries post-migration |
| Form re-renders too slowly (>100ms) | Low | Medium | Profile with React DevTools; memoize FormRenderer; implement lazy loading if needed |
| Validation schema generation errors | Low | High | Comprehensive unit tests for buildValidationSchemaForCategory(); test all field types |
| Data loss on form state reset | Low | Critical | Explicit test for form value preservation on category change; manual QA |
| Admin mistakes with field config | Low | Low | Seed config only (no runtime admin UI yet); Phase 3 will add validation UI |

---

## Success Criteria for Phase 2 Completion

- ✅ All 48 tasks completed and merged to main branch
- ✅ Zero high-severity bugs in testing
- ✅ Line coverage 80%+ for modified modules (ideaValidation.ts, useFormState.ts, IdeaForm.tsx)
- ✅ All Playwright e2e tests passing (dynamic form submission, category switching, validation)
- ✅ SC-001: Form completion time decreases by 30% (measured post-launch)
- ✅ SC-002: Form submission success rate 95%+ (measured post-launch)
- ✅ SC-003: Zero data loss on category changes (100% field values preserved)
- ✅ SC-005: 100% of Phase 1 ideas remain accessible without errors
- ✅ Human review completed for validation engine and migrations (CA-005)

---

## Handoff to Phase 3 Planning

After Phase 2 is complete, Phase 3 (Multi-Media Support) will build on the dynamic form foundation:
- Phase 3 can leverage form_fields + form_configurations infrastructure
- Support for new field types (rich-text, date-picker, etc.) uses same FormField extension mechanism
- Admin configuration UI (US-3 P3) can be implemented using form_configurations table

---

## Next Steps

1. **Run `/speckit.tasks`** to generate detailed task assignments, story points, and sprint planning breakdown
2. **Assign tasks to developers** based on expertise (database migrations, React/TypeScript, testing)
3. **Begin Phase 2a (Infrastructure)** with database migrations
4. **Daily standup** to track progress and unblock challenges

---

**Plan Status**: ✅ **PHASE 1 DESIGN COMPLETE** → Ready for Phase 2 implementation task generation (`/speckit.tasks`)
