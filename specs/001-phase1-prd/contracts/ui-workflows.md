# Contracts: UI Workflows (Phase 1 PRD Baseline)

## Contract 1: User Login
- Actors: submitter, admin
- Preconditions:
  - User account exists and is active.
- Input Contract:
  - email (required)
  - password (required)
- Validation Contract:
  - Missing or invalid credentials produce a non-authenticated outcome.
- Output Contract:
  - Success: authenticated session established, role context available.
  - Failure: error message shown, no protected access granted.
- Traceability: FR-001, FR-002, FR-003, SC-001

## Contract 2: Idea Submission
- Actors: submitter
- Preconditions:
  - Authenticated submitter session exists.
- Input Contract:
  - title (required)
  - description (required)
  - category (required)
  - attachment (optional, max 1 file)
- Validation Contract:
  - Required fields must be non-empty.
  - Only one file allowed.
- Output Contract:
  - Success: idea persisted with status Submitted.
  - Failure: validation errors shown, no partial invalid record committed.
- Traceability: FR-004, FR-005, FR-006, FR-011, SC-002

## Contract 3: Admin Decision Action
- Actors: admin
- Preconditions:
  - Authenticated admin session exists.
  - Target idea exists.
- Input Contract:
  - decision outcome (Under Review | Accepted | Rejected, required)
  - decision comment (required for Accepted/Rejected)
- Validation Contract:
  - Only admin may execute decision action.
  - Submitted ideas must enter Under Review before Accepted/Rejected.
  - Comment required for final decision outcomes.
- Output Contract:
  - Success: idea status updated; decision persisted with timestamp and actor.
  - Failure: unauthorized or invalid input rejected with explicit message.
- Traceability: FR-007, FR-008, FR-009, FR-010, FR-011, FR-013, SC-003

## Contract 4: Submitter Decision Visibility
- Actors: submitter
- Preconditions:
  - Submitter has at least one submitted/decided idea.
- Output Contract:
  - Idea details show current status and latest decision comment.
- Validation Contract:
  - Submitter can only view own ideas.
- Traceability: FR-003, FR-011, SC-003
