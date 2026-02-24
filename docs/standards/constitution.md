# Project Constitution Reference: InnovatEPAM Portal

The canonical constitution is maintained in `.specify/memory/constitution.md`.
This file is a contributor-friendly reference and MUST remain consistent with the canonical
document.

## Non-Negotiable Standards Summary

- Product intent first: all implementation must trace to PRD/spec outcomes.
- Stack consistency: React + Vite, Tailwind CSS, and Supabase unless an ADR approves
	a deviation.
- Test-first gate: failing tests first for business logic, with minimum 80% line coverage
	in affected modules.
- Architecture traceability: material architecture changes require ADR updates.
- AI accountability: human review is mandatory before merge.

## Definition of Done

- Lint and type checks pass with zero unresolved errors.
- Required unit/integration tests pass; run Playwright for impacted user journeys.
- PR links to relevant spec and ADR artifacts.
- Documentation and constitution-impacting templates are updated when needed.
