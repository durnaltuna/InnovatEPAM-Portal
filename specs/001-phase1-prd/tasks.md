# Tasks: Phase 1 PRD Baseline

**Input**: Design documents from `/specs/001-phase1-prd/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are REQUIRED for all changed business logic per constitution.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project skeleton and baseline tooling

- [X] T001 Create web app folder structure in src/app, src/components, src/features, src/services/supabase, src/types
- [X] T002 Initialize dependency manifests and scripts in package.json
- [X] T003 [P] Configure TypeScript project settings in tsconfig.json
- [X] T004 [P] Configure Vite and environment variable handling in vite.config.ts
- [X] T005 [P] Configure testing toolchain (Vitest + Playwright) in vitest.config.ts and playwright.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core prerequisites required before user story implementation

- [X] T006 Create Supabase client and session bootstrap in src/services/supabase/client.ts
- [X] T007 [P] Define domain types and enums in src/types/domain.ts
- [X] T008 [P] Implement route guard and role gate utilities in src/features/auth/guards.ts
- [X] T009 Implement shared form validation utilities in src/services/validation.ts
- [X] T010 Implement shared error/result mapping helpers in src/services/errors.ts
- [X] T011 [P] Create base test fixtures for roles and idea records in tests/integration/fixtures.ts
- [X] T012 Create constitution compliance evidence checklist in specs/001-phase1-prd/checklists/review-gates.md

**Checkpoint**: Foundational layer complete; user stories can be implemented.

---

## Phase 3: User Story 1 - User Login Access (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated login/logout with role-aware access entry.

**Independent Test**: Validate successful login, failed login, and logout protection behavior without requiring idea workflows.

### Tests for User Story 1

- [X] T013 [P] [US1] Add unit tests for auth state and role guards in tests/unit/auth-guards.test.ts
- [X] T014 [P] [US1] Add integration tests for login success/failure in tests/integration/auth-login.test.ts
- [X] T015 [P] [US1] Add e2e test for login then logout protected route flow in tests/e2e/auth-login-logout.spec.ts

### Implementation for User Story 1

- [X] T016 [US1] Implement auth service operations (login/logout/session) in src/features/auth/authService.ts
- [X] T017 [US1] Implement login page and form behavior in src/features/auth/LoginPage.tsx
- [X] T018 [US1] Implement logout control and protected app entry in src/app/AppShell.tsx
- [X] T019 [US1] Wire auth routes and role context provider in src/app/router.tsx

**Checkpoint**: User login access is fully functional and independently testable.

---

## Phase 4: User Story 2 - Idea Submission with One Attachment (Priority: P2)

**Goal**: Allow submitter to create ideas with exactly one file attachment.

**Independent Test**: Submit a valid idea with one file and confirm visibility; reject multi-file input.

### Tests for User Story 2

- [X] T020 [P] [US2] Add unit tests for one-attachment and required-field validation in tests/unit/idea-validation.test.ts
- [X] T021 [P] [US2] Add integration tests for submit idea persistence and default status in tests/integration/idea-submit.test.ts
- [X] T022 [P] [US2] Add e2e test for submitter idea submission with one file in tests/e2e/idea-submit.spec.ts

### Implementation for User Story 2

- [X] T023 [US2] Implement idea and attachment persistence service in src/features/ideas/ideaService.ts
- [X] T024 [US2] Implement submitter idea form with one-file constraint in src/features/ideas/IdeaForm.tsx
- [X] T025 [US2] Implement attachment upload helper bound to one-file rule in src/features/ideas/attachmentService.ts
- [X] T026 [US2] Implement submitter idea list page (own ideas only) in src/features/ideas/MyIdeasPage.tsx

**Checkpoint**: Idea submission with one attachment is fully functional and independently testable.

---

## Phase 5: User Story 3 - Admin Decision View (Priority: P3)

**Goal**: Allow admin to move ideas to Under Review and then accept/reject with required comments.

**Independent Test**: Admin can transition Submitted -> Under Review -> Accepted/Rejected with valid comment rules and persisted history.

### Tests for User Story 3

- [X] T027 [P] [US3] Add unit tests for decision validation and role restrictions in tests/unit/admin-decision-rules.test.ts
- [X] T028 [P] [US3] Add integration tests for Submitted -> Under Review transition and persistence in tests/integration/admin-decisions.test.ts
- [X] T029 [P] [US3] Add e2e test for Under Review -> Accepted/Rejected workflow in tests/e2e/admin-decisions.spec.ts

### Implementation for User Story 3

- [X] T030 [US3] Implement admin decision service with Submitted -> Under Review -> Accepted/Rejected transitions in src/features/admin/decisionService.ts
- [X] T031 [US3] Implement admin ideas review table in src/features/admin/AdminIdeasPage.tsx
- [X] T032 [US3] Implement decision action modal with conditional required comment for final decisions in src/features/admin/DecisionModal.tsx
- [X] T033 [US3] Persist decision history entries and latest decision projection in src/features/admin/decisionHistoryService.ts

**Checkpoint**: Admin decision workflow is fully functional and independently testable.

---

## Phase 6: User Story 4 - Status Visibility for Submitter (Priority: P4)

**Goal**: Show submitter decision status and comments for own ideas.

**Independent Test**: Submitter sees updated decision outcomes after admin action, including comments.

### Tests for User Story 4

- [X] T034 [P] [US4] Add unit tests for submitter visibility filters in tests/unit/idea-visibility.test.ts
- [X] T035 [P] [US4] Add integration tests for decision/comment visibility in tests/integration/submitter-decision-visibility.test.ts
- [X] T036 [P] [US4] Add e2e test for submitter outcome visibility after admin action in tests/e2e/submitter-outcomes.spec.ts

### Implementation for User Story 4

- [X] T037 [US4] Implement idea detail view with decision metadata in src/features/ideas/IdeaDetailPage.tsx
- [X] T038 [US4] Implement submitter-only data query filters in src/features/ideas/ideaQueries.ts
- [X] T039 [US4] Integrate decision status/comment rendering in src/features/ideas/DecisionSummary.tsx

**Checkpoint**: Submitter decision visibility is fully functional and independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and release-readiness across all stories

- [ ] T040 [P] Add end-to-end smoke flow covering US1→US4 in tests/e2e/mvp-smoke.spec.ts
- [ ] T041 [P] Add missing edge-case integration tests from spec edge cases in tests/integration/edge-cases.test.ts
- [X] T042 Update implementation notes and runbook in specs/001-phase1-prd/quickstart.md
- [X] T043 Add PR reviewer traceability matrix (FR/SC to tests) in specs/001-phase1-prd/checklists/traceability.md
- [X] T044 Run `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test`, and `npm run test:e2e`, and capture command outputs/references in specs/001-phase1-prd/checklists/release-evidence.md
- [ ] T045 [P] Add automated measurement for SC-001 login time threshold in tests/e2e/performance-login.spec.ts
- [ ] T046 [P] Add automated measurement for SC-002 submission completion threshold in tests/e2e/performance-submission.spec.ts
- [ ] T047 [P] Add automated measurement for SC-003 status-visibility latency threshold in tests/integration/performance-status-visibility.test.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on setup completion and blocks all user story phases.
- User Stories (Phases 3-6): depend on foundational completion; execute by priority (P1→P4).
- Polish (Phase 7): depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: no dependency on other stories after foundational.
- **US2 (P2)**: depends on US1 auth/session behavior.
- **US3 (P3)**: depends on US2 idea creation and submitted state.
- **US4 (P4)**: depends on US3 decision persistence.

### Within Each User Story

- Tests first and initially failing.
- Services before UI integration.
- UI integration before final e2e confirmation.

---

## Parallel Opportunities

- Setup tasks T003-T005 can run in parallel.
- Foundational tasks T007, T008, T011 can run in parallel.
- Per story, test tasks marked [P] can run in parallel.

### Parallel Example: US1

- T013, T014, T015 in parallel (different test files).

### Parallel Example: US2

- T020, T021, T022 in parallel (validation, integration, e2e).

### Parallel Example: US3

- T027, T028, T029 in parallel (rules, persistence, workflow).

### Parallel Example: US4

- T034, T035, T036 in parallel (filters, integration, outcome flow).

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) and validate auth workflow.
3. Complete Phase 4 (US2) and validate submission workflow.
4. Stop for MVP demo if needed.

### Incremental Delivery

1. Deliver US1 (access), then US2 (submission), then US3 (decision), then US4 (visibility).
2. Validate each story independently before moving forward.

### Parallel Team Strategy

1. Team aligns on Setup + Foundational.
2. Then split by story ownership with shared contracts and test conventions.
3. Merge in priority order with traceability checks.
