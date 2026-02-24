# Feature Specification: Phase 1 PRD Baseline

**Feature Branch**: `001-phase1-prd`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Create a PRD for Phase 1: User login, idea submission form with one file attachment, and an admin view to accept/reject ideas."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - User Login Access (Priority: P1)

As a portal user, I can log in and log out so that only authorized people can access portal features.

**Why this priority**: Authentication is the entry gate for all other workflows and must be working before submission or review can happen.

**Independent Test**: Can be tested by logging in with valid credentials, failing with invalid credentials, and confirming logout ends authenticated access.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** valid credentials are submitted, **Then** the user is authenticated and enters the portal.
2. **Given** an unauthenticated session, **When** invalid credentials are submitted, **Then** authentication is denied with a clear error.
3. **Given** an authenticated user, **When** logout is requested, **Then** the session is ended and protected pages require login again.

---

### User Story 2 - Idea Submission with One Attachment (Priority: P2)

As a submitter, I can create an idea with title, description, category, and one file attachment so that I can send a complete proposal for review.

**Why this priority**: This is the primary value flow for contributors and the core input to the evaluation process.

**Independent Test**: Can be tested by submitting a valid idea with one attachment and confirming it appears in the submitter's idea list.

**Acceptance Scenarios**:

1. **Given** an authenticated submitter, **When** a valid idea form with one file is submitted, **Then** the idea is created successfully with status "Submitted".
2. **Given** an authenticated submitter, **When** more than one file is added, **Then** submission is blocked with a one-attachment limit message.

---

### User Story 3 - Admin Decision View (Priority: P3)

As an admin, I can view submitted ideas and accept or reject them with comments so that ideas move through a clear decision workflow.

**Why this priority**: The MVP needs a complete loop from submission to decision, not only idea intake.

**Independent Test**: Can be tested by reviewing submitted ideas and applying accept/reject decisions with comments, then verifying the updated state is visible.

**Acceptance Scenarios**:

1. **Given** an admin viewing submitted ideas, **When** the admin starts evaluation, **Then** the idea status is updated to "Under Review".
2. **Given** an idea in "Under Review", **When** the admin accepts it with a comment, **Then** the status is updated to "Accepted" and the comment is stored.
3. **Given** an idea in "Under Review", **When** the admin rejects it with a comment, **Then** the status is updated to "Rejected" and the comment is stored.

---

### User Story 4 - Status Visibility for Submitter (Priority: P4)

As a submitter, I can see decision outcomes for my ideas so that I understand whether an idea was accepted or rejected.

**Why this priority**: Visibility of outcomes is required for a usable MVP experience and reduces follow-up requests.

**Independent Test**: Can be tested by submitting ideas, making admin decisions, and confirming status/comment visibility to the submitter.

**Acceptance Scenarios**:

1. **Given** a submitter with evaluated ideas, **When** the submitter opens idea details, **Then** current status (including "Under Review") and latest admin comment are shown.

### Edge Cases

- Login is attempted with an unregistered or inactive account.
- A submitter tries to access admin decision controls.
- Required idea fields are empty.
- Attachment upload fails during submission.
- Admin submits Accepted/Rejected decision without comment.
- Admin attempts direct Submitted -> Accepted/Rejected transition without entering Under Review.
- Submitter has no ideas yet.
- Two admins update the same idea at nearly the same time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide login and logout capabilities for authenticated access.
- **FR-002**: System MUST deny access to protected features when authentication fails.
- **FR-003**: System MUST distinguish submitter and admin capabilities.
- **FR-004**: Submitters MUST be able to create ideas with title, description, and category.
- **FR-005**: System MUST allow exactly one file attachment per idea for Phase 1.
- **FR-006**: System MUST create new ideas with status "Submitted".
- **FR-007**: Admin users MUST be able to view all submitted ideas.
- **FR-008**: Admin users MUST be able to transition ideas from "Submitted" to "Under Review".
- **FR-009**: Admin users MUST be able to transition ideas from "Under Review" to "Accepted" or "Rejected".
- **FR-010**: Admin users MUST provide a decision comment for "Accepted" or "Rejected" actions.
- **FR-011**: System MUST persist and display idea status progression and latest decision comments to the submitter.
- **FR-012**: System MUST enforce required field validation and role checks for protected features.
- **FR-013**: System MUST preserve idea, attachment reference, and status/decision history for MVP operations.

### Constitution Alignment *(mandatory)*

- **CA-001 Product Intent**: Stories map to PRD MVP outcomes: login access, idea intake, and admin decision workflow.
- **CA-002 Stack Consistency**: Feature implementation must stay within approved stack constraints unless a new ADR approves a change.
- **CA-003 Test-First Scope**: Failing tests are required first for auth behavior, submission validation, attachment-limit rules, Under Review transitions, and admin decision persistence.
- **CA-004 Architecture Traceability**: Any changes to auth boundaries or decision workflow model require ADR traceability.
- **CA-005 Human Accountability**: AI-assisted outputs require human review confirming requirement alignment and constitution compliance.

### Dependencies & Assumptions

- Phase 1 MVP scope is limited to login, idea submission with one file attachment, and admin accept/reject view.
- User registration/provisioning is external to this feature scope; this feature consumes existing login-ready users.
- Role model includes at least two roles: submitter and admin.
- Features in later phases (dynamic forms, scoring, blind review, drafts) are out of scope.
- Identity-provider prerequisites for this feature are: active user account, valid assigned role, and successful authentication response from the managed auth provider.

### Security & Reliability Boundaries

- Session expiration and brute-force lockout policies are out of scope for Phase 1 and will be defined in a later security-hardening phase.
- Auditability is in scope for status workflow actions: each status change MUST be persisted with actor role, timestamp, previous status, and new status.
- Concurrent admin decision attempts on the same idea MUST not create divergent final states; stale updates MUST be rejected with a conflict error and require refresh before retry.

### Protected Features Definition

- Submitter-protected features: idea form submission, own idea list, own idea detail.
- Admin-protected features: all-ideas review view, Submitted -> Under Review transition,
  Under Review -> Accepted/Rejected transition, decision comment submission.

### Key Entities *(include if feature involves data)*

- **User**: Represents a portal participant with identity and role.
- **Idea**: Represents a submitted innovation proposal and its lifecycle state.
- **Attachment**: Represents a single supporting file linked to an idea.
- **Decision**: Represents an admin Under Review/Accepted/Rejected action with comment and timestamp.

### Decision History Definition

- Decision history entry fields are: actor role, action timestamp, fromStatus, toStatus, and decision comment (required for Accepted/Rejected).
- Ordering is newest-first for admin review views and submitter detail views.
- Visibility is role-bound: admin can view all ideas and their histories; submitter can view history for own ideas only.

### FR-to-Scenario Traceability (Security-Critical)

- FR-001 and FR-002 map to User Story 1 scenarios 1-3.
- FR-003 maps to User Story 3 scenarios 1-3 and User Story 4 scenario 1.
- FR-008, FR-009, and FR-010 map to User Story 3 scenarios 1-3.
- FR-011 maps to User Story 4 scenario 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of valid users complete login in under 2 minutes.
- **SC-002**: 95% of submitters complete idea submission with one file in under 5 minutes.
- **SC-003**: 100% of status changes (including Under Review, Accepted, Rejected) are visible to submitters within 10 seconds.
- **SC-004**: At least 90% of acceptance scenarios listed in User Stories 1-4 pass in CI on the release-candidate branch, measured by automated Vitest and Playwright runs.
