<!--
Sync Impact Report
- Version change: 0.0.0-template → 1.0.0
- Modified principles:
	- PRINCIPLE_1_NAME → I. Product Intent Before Implementation
	- PRINCIPLE_2_NAME → II. Stack Consistency Is Mandatory
	- PRINCIPLE_3_NAME → III. Test-First Delivery Gate (NON-NEGOTIABLE)
	- PRINCIPLE_4_NAME → IV. Traceable Architectural Decisions
	- PRINCIPLE_5_NAME → V. AI-Assisted Work Requires Human Accountability
- Added sections:
	- Technical & Quality Constraints
	- Delivery Workflow & Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md
	- ✅ .specify/templates/tasks-template.md
	- ⚠ pending .specify/templates/commands/*.md (directory not present in repository)
- Deferred follow-up items:
	- None
-->

# InnovatEPAM Portal Constitution

## Core Principles

### I. Product Intent Before Implementation
Every material implementation decision MUST trace to a documented product outcome in
docs/specs/PRD.md or an approved feature specification. Work that does not map to a
user journey, acceptance scenario, or measurable success criterion MUST NOT be merged.
Rationale: this protects sprint capacity and keeps delivery focused on stakeholder value.

### II. Stack Consistency Is Mandatory
Phase 1 delivery MUST use the approved stack from ADR 001: React + Vite frontend,
Tailwind CSS styling, and Supabase for backend/auth. A stack deviation requires a new
accepted ADR before implementation begins. TypeScript, linting, and build checks MUST
pass with zero unresolved errors before merge.
Rationale: consistent tooling reduces integration risk and onboarding time.

### III. Test-First Delivery Gate (NON-NEGOTIABLE)
All new or changed business logic MUST be introduced with failing automated tests before
implementation. New business logic MUST maintain at least 80% line coverage in affected
modules. Unit and integration tests run in Vitest; end-to-end scenarios run in Playwright
when user journeys are impacted.
Rationale: test-first changes reduce regression risk and make behavior explicit.

### IV. Traceable Architectural Decisions
Any change that affects architecture, data boundaries, authentication/authorization,
deployment model, or integration contracts MUST include an ADR update in docs/adr.
Pull requests MUST link the corresponding ADR and affected requirements.
Rationale: architectural traceability improves long-term maintainability and auditability.

### V. AI-Assisted Work Requires Human Accountability
AI-generated code, content, or plans MUST be reviewed by a human maintainer before
merge. Reviewers MUST verify requirement alignment, security implications, and test
adequacy, and MUST reject output with unverifiable assumptions.
Rationale: assisted delivery increases speed only when paired with accountable review.

## Technical & Quality Constraints

- Product scope for governance is InnovatEPAM Portal Phase 1 MVP.
- Role-based access control MUST distinguish submitter and admin workflows.
- Idea workflow states MUST support Submitted, Under Review, Accepted, and Rejected.
- One file attachment per submitted idea MUST remain supported in MVP scope.
- Definition of done for each merged change MUST include:
	- Lint/type checks passing.
	- Required tests passing.
	- Documentation updates for changed behavior and decisions.

## Delivery Workflow & Quality Gates

1. Start from an approved specification with prioritized user stories and measurable
	 outcomes.
2. Record technical or architectural deviations in an ADR before implementation.
3. Add or update failing tests first, then implement, then refactor.
4. Verify local quality gates: lint, type checks, unit/integration tests, and relevant
	 end-to-end tests.
5. Open PR with links to spec and ADR evidence, including constitution compliance notes.
6. Merge only after reviewer confirms all constitution gates are satisfied.

## Governance

This constitution is the highest-priority engineering policy for this repository. If a
workflow, template, or local habit conflicts with this document, the constitution takes
precedence.

Amendment procedure:
- Any contributor may propose an amendment through a PR that updates this document and
	related templates/docs in the same change set.
- At least one maintainer approval is required.
- Amendment PRs MUST include a Sync Impact Report describing downstream updates.

Versioning policy:
- Semantic versioning is mandatory for constitution releases.
- MAJOR: incompatible governance changes or principle removal/redefinition.
- MINOR: new principle or materially expanded mandatory guidance.
- PATCH: clarifications, wording improvements, typo or formatting-only changes.

Compliance review expectations:
- Every implementation plan MUST include a constitution check before design and before
	implementation.
- Every PR review MUST explicitly confirm compliance or document an approved exception.
- Exceptions MUST include rationale, scope, owner, and expiry review date.

**Version**: 1.0.0 | **Ratified**: 2026-02-24 | **Last Amended**: 2026-02-24
