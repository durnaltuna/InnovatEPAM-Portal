# Implementation Plan: Smart Submission Forms (Dynamic Fields)

**Branch**: `002-dynamic-forms` | **Date**: February 25, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-dynamic-forms/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

**Primary Objective**: Enable submitters to fill idea submission forms with fields that dynamically adapt based on their selected idea category, reducing cognitive load and improving completion rates while maintaining full backward compatibility with Phase 1 submissions.

**Technical Approach**: Extend the existing IdeaForm component to query category-field mappings from Supabase, render fields conditionally based on selected category, and preserve form state across category changes. Add form_fields and form_configurations tables to Supabase schema; extend existing categories and ideas tables with new attributes. Validation rules engine will evaluate category-specific requirements before submission.

## Technical Context

**Language/Version**: TypeScript 5+, React 18+  
**Primary Dependencies**: React (UI), Tailwind CSS (styling), Supabase (backend/database), Vite (build), Zod/Valibot (validation)  
**Storage**: Supabase PostgreSQL (form_fields, form_configurations, extended categories and ideas tables)  
**Testing**: Vitest (unit/integration tests for field visibility and validation logic), Playwright (e2e tests for user journeys across category changes)  
**Target Platform**: Web (React SPA)  
**Project Type**: web-service (SPA frontend + Supabase backend)  
**Performance Goals**: Form re-render on category change < 100ms; field configuration fetch < 200ms (cacheable); submit endpoint < 500ms  
**Constraints**: Must maintain 100% backward compatibility with Phase 1 submissions; all form data persisted server-side in database; no breaking changes to existing data schema  
**Scale/Scope**: ~5-10 form field types across 3-5 categories initially; extensible for future scaling; estimated 5k-50k active submitters

## Constitution Re-evaluation (Post-Design)

*GATE: Must pass after Phase 1 design before proceeding to Phase 2 implementation tasks.*

### I. Product Intent Before Implementation
✅ **PASS** - All Phase 1 design artifacts (data-model.md, quickstart.md, contracts/) trace requirements to user stories:
- US-1 (category-dependent fields) → FR-001 + FormRenderer component + tests
- US-2 (validation adaptation) → FR-003 + ideaValidation.ts logic
- US-3 (admin configuration) → FR-007 + form_configurations table + seed script
- US-4 (state preservation) → FR-002 + useFormState hook + event handling
Design is traceable and complete.

### II. Stack Consistency Is Mandatory
✅ **PASS** - No deviations from approved stack:
- React 18+ (UI component framework) ✓
- TypeScript 5+ (type safety) ✓
- Tailwind CSS (styling) ✓
- Supabase PostgreSQL (backend/data) ✓
- Zod/Valibot (validation library) ✓
- Vite (build tool) ✓
No new libraries required. Design maintains stack consistency.

### III. Test-First Delivery Gate (NON-NEGOTIABLE)
✅ **PASS** - Quickstart.md includes test-first methodology for all three business logic areas:
1. **Field Visibility Rules** (idea-form-visibility.test.ts): Tests for category-based filtering and field preservation written before implementation
2. **Validation Rule Application** (idea-field-validation.test.ts): Tests for category-specific validation before buildValidationSchemaForCategory() implementation
3. **Form State Management** (form-state-preservation.test.ts): Tests for state reduction and category switching before useFormState hook implementation
Target: 80% line coverage in IdeaForm.tsx, ideaValidation.ts, useFormState.ts. E2E tests in Playwright validate full workflows.

### IV. Traceable Architectural Decisions
✅ **PASS** - All architectural changes documented:
- New tables (form_fields, form_configurations): Documented in data-model.md with full DDL
- Extended tables: Documented with migration strategy and backward compatibility notes
- IdeaForm component refactor: Scoped to feature-level changes (no global architecture impact)
- Validation strategy: Documented in research.md (RES-003) with rationale
No new ADR required (dynamic rendering doesn't breach architecture boundaries); if form builder library adopted in future, ADR created then.

### V. AI-Assisted Work Requires Human Accountability
✅ **PASS** - Explicit human review checkpoints defined in quickstart.md:
- ✅ Code Review checkpoint: Validation rules engine logic must be reviewed before merge (ideaValidation.ts)
- ✅ Code Review checkpoint: Database migration strategy must be reviewed before merge (data-model.md)
- ✅ Test Review checkpoint: All test-first tests must pass (unit, integration, e2e)
- ✅ Architecture Review checkpoint: No breaking changes to Phase 1 APIs; legacy ideas remain accessible
- ✅ Migration Review checkpoint: Supabase schema changes tested in dev environment

---

### Constitution Violations: 0 | Justifications: 0 | Gate Status: ✅ **READY FOR PHASE 2 IMPLEMENTATION**

**Summary**: Phase 1 design is complete and constitution-compliant. All entities, schemas, contracts, and implementation guidance are documented. No blockers to proceeding with Phase 2a (infrastructure) and Phase 2b-2f (implementation).

## Project Structure

### Documentation (this feature)

```text
specs/002-dynamic-forms/
├── plan.md                      # This file (implementation plan)
├── spec.md                      # Feature specification
├── research.md                  # Phase 0 output (detailed research into unknowns)
├── data-model.md                # Phase 1 output (entity definitions, schema changes)
├── quickstart.md                # Phase 1 output (developer quickstart guide)
├── contracts/                   # Phase 1 output (UI & data contracts)
│   └── form-contracts.md        # Form field schema, validation rules format
├── checklists/
│   ├── requirements.md          # Pre-planning requirements validation
│   └── specification-quality.md # Quality checklist (73-item validation)
└── tasks.md                     # Phase 2 output (detailed implementation tasks)
```

### Source Code (repository root)

**Selected Structure**: Option 1 - Single SPA project (existing InnovatEPAM-Portal structure)

```text
src/
├── features/ideas/
│   ├── IdeaForm.tsx             # MODIFIED: Add dynamic field rendering based on category
│   ├── ideaService.ts           # MODIFIED: Add category-field config fetch + submission
│   ├── ideaQueries.ts           # MODIFIED: Add queries for form metadata
│   ├── ideaValidation.ts        # NEW: Category-specific validation rules engine
│   ├── hooks/
│   │   └── useFormState.ts      # NEW: Hook for managing form state across category changes
│   └── types/
│       └── formSchema.ts        # NEW: Types for form field definitions, validation rules
│
├── services/
│   ├── supabase/
│   │   └── client.ts            # MODIFIED: Add queries for form_fields, form_configurations
│   └── validation.ts            # MODIFIED: Extend with category-aware validation logic
│
├── types/
│   ├── domain.ts                # MODIFIED: Add FormField, FormConfiguration interfaces
│   └── formTypes.ts             # NEW: Type definitions for form field types, validation rules
│
└── app/
    └── router.tsx               # UNCHANGED: Routes remain the same

tests/
├── unit/
│   ├── idea-form-visibility.test.ts      # NEW: Field visibility based on category
│   ├── idea-field-validation.test.ts     # NEW: Category-specific validation rules
│   ├── form-state-preservation.test.ts   # NEW: State preservation across category changes
│   └── form-compatibility.test.ts        # NEW: Backward compatibility with Phase 1 data
│
├── integration/
│   └── dynamic-form-submission.test.ts   # NEW: End-to-end form submission with categories
│
└── e2e/
    └── dynamic-form-workflows.spec.ts    # NEW: Playwright tests for dynamic forms,
                                           #      category switching, validation errors
```

**Structure Decision**: Using Single SPA structure (Option 1) because:
- Feature extends existing InnovatEPAM-Portal SPA (no separate backend needed—Supabase is backend-as-a-service)
- Frontend modifications are localized to features/ideas/ module and corresponding services
- Database schema changes in Supabase (migrations documented in research.md)
- All tests follow existing patterns: unit (Vitest), integration (Vitest), e2e (Playwright)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
