# Implementation Plan: Phase 1 PRD Baseline

**Branch**: `001-phase1-prd` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase1-prd/spec.md`

## Summary

Deliver a Phase 1 MVP scope for InnovatEPAM Portal covering authenticated access,
idea submission with exactly one attachment, and admin status progression through
Under Review to Accepted/Rejected with comment visibility to submitters. Implementation will use React + Vite frontend,
Supabase auth/data/storage backend services, and a test-first approach with Vitest and
Playwright aligned to constitution gates.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18.x, Vite 5.x, Supabase JS client, Tailwind CSS  
**Storage**: Supabase PostgreSQL (idea and decision data), Supabase Storage (one attachment per idea)  
**Testing**: Vitest (unit/integration), Playwright (end-to-end)  
**Target Platform**: Web browsers on desktop/laptop (modern Chromium/Firefox/Safari)
**Project Type**: Web application (frontend + managed backend services)  
**Performance Goals**: Login under 2 minutes completion, submission under 5 minutes completion, decision visibility under 10 seconds  
**Constraints**: One-attachment rule, strict role separation (submitter/admin), constitution-required status flow (Submitted -> Under Review -> Accepted/Rejected), test-first for business logic, no out-of-scope phase features  
**Scale/Scope**: Phase 1 MVP for core internal users; 4 user stories and 13 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Product intent traceability: PASS. Each planned deliverable maps to user stories
  US1-US4 and measurable outcomes SC-001-SC-004.
- Stack consistency: PASS. Plan uses ADR 001 stack (React + Vite + Tailwind + Supabase).
- Test-first gate: PASS. Auth, role control, submission validation, attachment limits, and
  admin decision persistence are explicitly test-first targets.
- Architecture traceability: PASS. No stack/boundary change in this plan; ADR update is
  required if auth/data/contract boundaries change during implementation.
- AI accountability: PASS. Human reviewer sign-off required on requirement traceability,
  security implications, and test evidence before merge.

**Gate Result (Pre-Design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-prd/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
├── components/
├── features/
│   ├── auth/
│   ├── ideas/
│   └── admin/
├── services/
│   └── supabase/
└── types/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Single web frontend project with managed Supabase backend services.
No custom backend service is introduced for Phase 1 to minimize sprint complexity.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Constitution Check (Post-Design)

- Product intent traceability: PASS. `data-model.md`, `contracts/ui-workflows.md`, and
  `quickstart.md` each map to FR/SC and user stories.
- Stack consistency: PASS. Design remains on ADR 001 stack; no deviation introduced.
- Test-first gate: PASS. Quickstart and contracts define failing-test-first validation
  points for critical business logic.
- Architecture traceability: PASS. Current design does not require ADR amendment.
- AI accountability: PASS. Design artifacts include explicit reviewer verification points.

**Gate Result (Post-Design)**: PASS
