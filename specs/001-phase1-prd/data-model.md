# Data Model: Phase 1 PRD Baseline

## Entity: User
- Purpose: Represents authenticated portal participant.
- Fields:
  - id (string/uuid, required, unique)
  - email (string, required, unique)
  - role (enum: submitter | admin, required)
  - createdAt (datetime, required)
- Validation Rules:
  - email must be valid format and unique.
  - role must be one of allowed enum values.
- Relationships:
  - one-to-many with Idea (User.id -> Idea.submitterId)
  - one-to-many with Decision (User.id -> Decision.adminId for role=admin)

## Entity: Idea
- Purpose: Captures innovation proposal submitted by submitter.
- Fields:
  - id (string/uuid, required, unique)
  - submitterId (string/uuid, required, foreign key User.id)
  - title (string, required, non-empty)
  - description (string, required, non-empty)
  - category (string, required)
  - status (enum: Submitted | Under Review | Accepted | Rejected, required, default Submitted)
  - createdAt (datetime, required)
  - updatedAt (datetime, required)
- Validation Rules:
  - title/description/category required before persistence.
  - status transitions allowed only via authorized admin actions.
- Relationships:
  - one-to-one optional with Attachment (Idea.id -> Attachment.ideaId)
  - one-to-many with DecisionHistoryEntry (Idea.id -> DecisionHistoryEntry.ideaId)

## Entity: Attachment
- Purpose: Stores one supporting file reference for an idea.
- Fields:
  - id (string/uuid, required, unique)
  - ideaId (string/uuid, required, unique, foreign key Idea.id)
  - filePath (string, required)
  - fileName (string, required)
  - uploadedAt (datetime, required)
- Validation Rules:
  - exactly one attachment per idea (unique constraint on ideaId).
  - filePath must reference successfully uploaded object.
- Relationships:
  - belongs to Idea.

## Entity: Decision
- Purpose: Captures the latest admin decision outcome for an idea.
- Fields:
  - id (string/uuid, required, unique)
  - ideaId (string/uuid, required, foreign key Idea.id)
  - adminId (string/uuid, required, foreign key User.id)
  - outcome (enum: Under Review | Accepted | Rejected, required)
  - comment (string, required, non-empty)
  - decidedAt (datetime, required)
- Validation Rules:
  - adminId must reference a user with role=admin.
  - comment required for Accepted and Rejected.
  - comment optional for Under Review.
- Relationships:
  - belongs to Idea.
  - belongs to User (admin actor).

## Entity: DecisionHistoryEntry
- Purpose: Tracks decision updates for visibility and auditability.
- Fields:
  - id (string/uuid, required, unique)
  - ideaId (string/uuid, required, foreign key Idea.id)
  - fromStatus (enum: Submitted | Under Review | Accepted | Rejected, optional)
  - toStatus (enum: Submitted | Under Review | Accepted | Rejected, required)
  - comment (string, optional)
  - actorId (string/uuid, required, foreign key User.id)
  - createdAt (datetime, required)
- Validation Rules:
  - toStatus must be valid enum.
  - actorId must map to an authorized role for transition.

## State Transitions
- Initial state: Submitted (on idea creation).
- Allowed transitions:
  - Submitted -> Under Review (admin only)
  - Under Review -> Accepted (admin only, comment required)
  - Under Review -> Rejected (admin only, comment required)
- Disallowed in Phase 1 baseline:
  - Submitted -> Accepted
  - Submitted -> Rejected
  - Accepted -> Rejected
  - Rejected -> Accepted
  - any non-admin initiated status change
