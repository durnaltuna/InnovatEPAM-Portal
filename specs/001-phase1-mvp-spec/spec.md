# Feature Specification: InnovatEPAM Portal Phase 1 MVP

**Feature Branch**: `001-phase1-mvp-spec`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Implement InnovatEPAM Portal Phase 1 MVP feature specification based on updated constitution and sprint guide"

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

### User Story 1 - Secure Access and Role Entry (Priority: P1)

As an employee or evaluator, I can register, sign in, and sign out so that I can securely access the portal with the correct role context.

**Why this priority**: No portal workflow can be trusted or meaningfully demonstrated without authenticated access and role distinction.

**Independent Test**: Can be fully tested by creating two users with different roles, signing in as each, and confirming role-appropriate landing behavior.

**Acceptance Scenarios**:

1. **Given** a new employee account, **When** the user registers with valid credentials, **Then** the account is created and the user is authenticated.
2. **Given** an authenticated submitter and an authenticated evaluator, **When** each accesses the portal, **Then** each sees role-appropriate capabilities.
3. **Given** an authenticated user, **When** the user logs out, **Then** the session is ended and protected pages require sign-in again.

---

### User Story 2 - Idea Submission with Attachment (Priority: P2)

As a submitter, I can create an idea with title, description, category, and one supporting file so that I can formally propose innovation initiatives.

**Why this priority**: Idea intake is the core product value for submitters and is required for any downstream review workflow.

**Independent Test**: Can be fully tested by submitting an idea with one attachment, then viewing it in "My Submissions" with all provided data.

**Acceptance Scenarios**:

1. **Given** an authenticated submitter, **When** the user submits a valid idea form with one file, **Then** the idea is saved with status "Submitted" and appears in the submitter list.
2. **Given** an authenticated submitter, **When** the user uploads more than one attachment, **Then** the system blocks submission and explains the one-file limit.

---

### User Story 3 - Evaluation and Status Decisions (Priority: P3)

As an evaluator/admin, I can review submitted ideas, leave evaluation comments, and set a final decision status so that submitted ideas move through a clear decision flow.

**Why this priority**: The MVP is incomplete without review outcomes; this story closes the loop between submitters and evaluators.

**Independent Test**: Can be fully tested by reviewing submitted ideas as evaluator, moving ideas through allowed statuses, and confirming submitter visibility of outcomes.

**Acceptance Scenarios**:

1. **Given** an idea in "Submitted", **When** an evaluator marks it "Under Review", **Then** the status is updated and visible to the submitter.
2. **Given** an idea under review, **When** an evaluator accepts or rejects it with a comment, **Then** the decision and comment are stored and visible in idea details.

---

### User Story 4 - Idea Visibility and Tracking (Priority: P4)

As a submitter, I can view my submitted ideas and their current statuses so that I can track progress without direct coordinator follow-up.

**Why this priority**: Status transparency reduces confusion and support overhead while completing the end-to-end submitter experience.

**Independent Test**: Can be fully tested by creating multiple ideas, changing statuses as evaluator, and confirming list/detail views reflect latest status per idea.

**Acceptance Scenarios**:

1. **Given** a submitter with multiple ideas, **When** the submitter opens "My Submissions", **Then** each idea appears with title, category, and current status.
2. **Given** a submitted idea with evaluator feedback, **When** the submitter opens idea details, **Then** the evaluation comment is shown.

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Registration attempt uses an already registered identity.
- User attempts to access an action outside their role permissions.
- Submitter omits required idea fields.
- Attachment upload fails during idea submission.
- Evaluator attempts status transition that skips required intermediate state.
- Submitter has no ideas yet.
- Concurrent evaluator updates are submitted for the same idea.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow user registration, sign-in, and sign-out.
- **FR-002**: System MUST enforce role distinction between submitter and evaluator/admin users.
- **FR-003**: System MUST prevent unauthorized actions and show a clear access-denied response.
- **FR-004**: Submitters MUST be able to create ideas with title, description, and category.
- **FR-005**: System MUST support exactly one attachment per idea in MVP scope.
- **FR-006**: System MUST store each new idea with initial status set to "Submitted".
- **FR-007**: Submitters MUST be able to view a list of only their own submitted ideas.
- **FR-008**: Users MUST be able to open idea details and view the current status.
- **FR-009**: Evaluators/admins MUST be able to view all submitted ideas.
- **FR-010**: Evaluators/admins MUST be able to set idea status to "Under Review", "Accepted", or "Rejected" according to workflow rules.
- **FR-011**: Evaluators/admins MUST be able to provide a decision comment when setting "Accepted" or "Rejected".
- **FR-012**: System MUST maintain a visible status history per idea including latest evaluator comment.
- **FR-013**: System MUST validate required fields and provide user-readable error messages.
- **FR-014**: System MUST preserve idea and evaluation data for the duration of the Phase 1 MVP.

### Constitution Alignment *(mandatory)*

- **CA-001 Product Intent**: User stories map directly to PRD MVP areas: user management, idea submission, and evaluation workflow.
- **CA-002 Stack Consistency**: Implementation assumes existing approved stack direction; any stack-level deviation requires ADR update before coding.
- **CA-003 Test-First Scope**: Failing tests are required first for authentication rules, role authorization, idea validation, status transitions, and comment persistence.
- **CA-004 Architecture Traceability**: Any change to auth boundaries, idea lifecycle model, or review contract must be reflected in ADR artifacts.
- **CA-005 Human Accountability**: AI-generated implementation and tests require human review confirming requirement traceability and constitution compliance before merge.

### Dependencies & Assumptions

- The MVP is developed as a new project during Module 08 sprint timeframe.
- Submitter and evaluator/admin are the only required roles for Phase 1.
- Phase 1 excludes dynamic forms, draft mode, blind review, and scoring workflow from later phases.
- The sprint prioritizes a working MVP over advanced enhancements.
- Core features must remain independently demonstrable by user story.

### Key Entities *(include if feature involves data)*

- **User**: Represents a portal participant with identity, authentication state, and role.
- **Idea**: Represents an innovation submission with title, description, category, owner, and lifecycle status.
- **Attachment**: Represents one optional file associated with an idea.
- **Evaluation**: Represents evaluator decision data including reviewer identity, decision status, and comment.
- **Status History Entry**: Represents a time-ordered record of idea status changes and decision notes.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of users can complete registration and first sign-in in under 3 minutes.
- **SC-002**: 95% of submitters can complete idea submission with one attachment in under 5 minutes.
- **SC-003**: 100% of newly submitted ideas are visible in "My Submissions" within 5 seconds of submission.
- **SC-004**: 95% of evaluator decisions (accept/reject with comment) are visible to submitters in under 10 seconds.
- **SC-005**: At least 90% of defined acceptance scenarios execute successfully in sprint demo validation.
