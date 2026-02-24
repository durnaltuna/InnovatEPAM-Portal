# Phase 0 Research: Phase 1 PRD Baseline

## Decision 1: Frontend-first architecture with managed backend services
- Decision: Implement as a React + Vite web app integrated directly with Supabase Auth, Database, and Storage.
- Rationale: Aligns with ADR 001, accelerates MVP delivery, and reduces custom backend complexity in sprint constraints.
- Alternatives considered:
  - Custom Node.js backend API: rejected due to extra delivery overhead and duplicate auth/data layers.
  - Pure mock/in-memory backend: rejected because it would not validate real auth/attachment/decision flows.

## Decision 2: Role model constrained to submitter and admin for Phase 1
- Decision: Use two explicit roles only: submitter and admin.
- Rationale: Matches spec assumptions and keeps authorization matrix minimal and testable.
- Alternatives considered:
  - Additional evaluator/reviewer sub-roles: rejected as out of current MVP scope.
  - Role-free access model: rejected because it violates security and workflow requirements.

## Decision 3: One-attachment enforcement at both UI and persistence boundary
- Decision: Enforce one-file limit in client validation and persist one attachment reference per idea record.
- Rationale: Reduces invalid submissions and ensures business rule integrity at data level.
- Alternatives considered:
  - UI-only enforcement: rejected due to risk of boundary bypass.
  - Multi-file structure with later restriction: rejected as unnecessary complexity for Phase 1.

## Decision 4: Test strategy split by business risk
- Decision: Use Vitest for auth/authorization/validation/state-transition logic and Playwright for login-submission-decision journeys.
- Rationale: Provides fast feedback for business rules while preserving realistic user-path verification.
- Alternatives considered:
  - E2E-only testing: rejected due to slower cycle and poor unit-level fault isolation.
  - Unit-only testing: rejected because cross-role and workflow integration behavior would remain under-validated.

## Decision 5: Status workflow baseline
 Decision: Use explicit lifecycle statuses: Submitted, Under Review, Accepted, Rejected, with admin decision comments required for final decisions.
 Rationale: Satisfies constitution workflow constraints while keeping final decision logic straightforward.
  - Skip Under Review state in Phase 1: rejected because it conflicts with constitution workflow requirements.
  - Free-text status values: rejected due to inconsistency and validation risk.

## Decision 6: Contract style for application-facing interface
- Decision: Define UI workflow contracts (actor/action/validation/outcome) instead of service OpenAPI contracts.
- Rationale: Current architecture does not introduce a custom HTTP backend; UI contracts are the relevant external interface.
- Alternatives considered:
  - OpenAPI endpoint contract: deferred until custom backend endpoints exist.
  - No contracts: rejected because constitution requires traceable interfaces and reviewability.
