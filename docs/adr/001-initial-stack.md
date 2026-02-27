# ADR 001: Initial Tech Stack

## Status
Accepted

## Context
Phase 1 MVP requires delivery of authenticated access, role-separated submitter/admin workflows,
idea submission with exactly one attachment, and admin decision progression
(Submitted -> Under Review -> Accepted/Rejected).

Project governance requires stack consistency and architectural traceability:
- Constitution mandates React + Vite, Tailwind CSS, and Supabase for Phase 1.
- PRD/spec and plan artifacts require test-first delivery and maintainable architecture under
	sprint constraints.

The implementation also needs:
- fast local development and short feedback cycles,
- minimal custom backend surface for MVP scope,
- strong support for TypeScript and automated testing (Vitest + Playwright).

## Decision Drivers
- Deliver MVP quickly with low operational overhead.
- Keep architecture simple enough for a small Phase 1 scope.
- Preserve role-based access control and workflow integrity.
- Align with constitution and existing project standards.

## Options Considered
1. React + Vite frontend with Supabase managed backend services.
2. React frontend with custom Node.js backend API.
3. Frontend with mock/in-memory backend only for Phase 1.

## Decision
Adopt the following baseline stack for Phase 1:
- **Frontend runtime/UI**: React (TypeScript) with Vite.
- **Routing**: React Router.
- **Backend services**: Supabase (Auth, PostgreSQL, Storage).
- **Styling standard**: Tailwind CSS (project standard for Phase 1).
- **Validation and quality gates**: TypeScript + ESLint + Vitest + Playwright.

This decision establishes the approved architecture baseline. Any material change to stack,
auth/data boundaries, or workflow model requires a new or updated ADR.

## Rationale
- React + Vite provides fast iteration (HMR) and fits current repository setup and scripts.
- Supabase reduces custom backend effort while covering MVP needs for authentication,
	persistence, and file storage.
- Keeping a managed backend supports faster delivery versus standing up and maintaining a
	custom API layer in Phase 1.
- Test/tooling choices are already integrated and support constitution quality gates.

## Consequences
### Positive
- Faster MVP delivery through reduced backend boilerplate.
- Consistent stack across contributors and feature work.
- Built-in auth/data/storage capabilities aligned to required workflows.
- Clear traceability for future architecture changes via ADR process.

### Negative / Trade-offs
- Increased dependency on Supabase availability and service behavior.
- Less backend implementation flexibility compared with a custom API.
- Future stack deviations require formal ADR updates before implementation.

### Risks and Mitigations
- **Risk**: Service/network dependency can impact authentication and submission flows.
	**Mitigation**: Keep robust tests for critical workflows and validate environment config.
- **Risk**: Architecture drift over time.
	**Mitigation**: Enforce constitution requirement to update ADRs on boundary changes.

## Alternatives Rejected
- **Custom Node.js backend API now**: rejected for Phase 1 due to additional delivery and
	maintenance overhead with no MVP-critical benefit.
- **Mock/in-memory backend**: rejected because it does not validate real auth, attachment,
	and decision workflow behavior required by MVP.

## Related Artifacts
- `docs/specs/PRD.md`
- `specs/001-phase1-prd/spec.md`
- `specs/001-phase1-prd/plan.md`
- `specs/001-phase1-prd/research.md`
- `.specify/memory/constitution.md`
