# Quickstart: Phase 1 MVP Implementation Guide

## 1) Prerequisites
- Node.js 20+
- npm 10+
- Supabase project credentials (URL + anon key) for production; tests use localStorage mocks

## 2) Project Setup

### Install and Configure
```bash
# Install dependencies
npm install

# Set environment variables (in .env.local or shell)
export VITE_SUPABASE_URL=<your-supabase-url>
export VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Start development server
npm run dev
```

### Validate Installation
```bash
npm run typecheck    # TypeScript compilation
npm run lint         # ESLint quality checks
npm run build        # Production bundle
npm run test         # Unit & integration tests
npm run test:e2e     # E2E tests (requires dev server running)
```

## 3) Core Architecture

### Service Layer Organization
- **Authentication**: `src/features/auth/authService.ts` - Login, logout, session management
- **Ideas**: `src/features/ideas/ideaService.ts` - CRUD, attachment handling, status updates
- **Decisions**: `src/features/admin/decisionService.ts` - Workflow transitions, history tracking
- **Queries**: `src/features/ideas/ideaQueries.ts` - Access control filters for submitter/admin

### Data Types
All entities defined in `src/types/domain.ts`:
- `User` - submitter or admin role
- `Idea` - with submitterId, attachmentPath, status
- `IdeaStatus` - enum: Submitted, UnderReview, Accepted, Rejected
- `Decision` - outcome, comment, decidedAt timestamp
- `DecisionHistoryEntry` - transition audit trail

### State Persistence
- **Development**: localStorage (mocked in tests via `localStorageMock` fixture)
- **Production**: Supabase (connection in `src/services/supabase/client.ts`)

## 4) Test-First Validation Sequence

### Unit Tests (Layer 1: Business Logic Rules)
```bash
npm run test -- --run tests/unit/
```
Files:
- `auth-guards.test.ts` (3 tests) - Role filtering
- `idea-validation.test.ts` (3 tests) - Required fields, attachment constraints
- `admin-decision-rules.test.ts` (15 tests) - Transition rules, comment requirements
- `idea-visibility.test.ts` (8 tests) - Submitter ownership filters

### Integration Tests (Layer 2: Service Behavior)
```bash
npm run test -- --run tests/integration/
```
Files:
- `auth-login.test.ts` (4 tests) - Session persistence
- `idea-submit.test.ts` (8 tests) - Persistence, default statuses
- `admin-decisions.test.ts` (14 tests) - Transition sequences, history
- `submitter-decision-visibility.test.ts` (7 tests) - Access control enforcement

### E2E Tests (Layer 3: User Workflows)
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```
Files:
- `auth-login-logout.spec.ts` - User login → protected route navigation → logout
- `idea-submit.spec.ts` - Submit idea → verify Submitted status → check submitter list
- `admin-decisions.spec.ts` - Admin review workflow (Submitted → Under Review → Accept/Reject)
- `submitter-outcomes.spec.ts` - Submitter sees decision comment after admin action

## 5) User Story Workflows

### US1: User Login (Submitter/Admin)
**Path**: Unauthenticated → LoginPage → AppShell (protected)
- Test: `tests/integration/auth-login.test.ts`
- Services: `authService.ts` (login/logout)
- UI: `LoginPage.tsx`, `AppShell.tsx`
- Guard: `src/features/auth/guards.ts` (requireAuth, requireRole)

### US2: Idea Submission with Attachment
**Path**: Submitter → MyIdeasPage → IdeaForm → Submit
- Test: `tests/integration/idea-submit.test.ts`
- Services: `ideaService.ts`, `attachmentService.ts`
- UI: `IdeaForm.tsx`, `MyIdeasPage.tsx`
- Validation: One file required, categories, title/description lengths

### US3: Admin Decision Workflow
**Path**: Admin → AdminIdeasPage → DecisionModal → Make Decision
- Test: `tests/integration/admin-decisions.test.ts`
- Services: `decisionService.ts` (canTransitionTo, makeDecision, getDecision)
- UI: `AdminIdeasPage.tsx`, `DecisionModal.tsx`
- Transitions: Submitted → UnderReview (optional comment) → Accepted/Rejected (required comment)

### US4: Submitter Visibility of Decisions
**Path**: Submitter → MyIdeasPage → See Status Badge + Decision Comment
- Test: `tests/integration/submitter-decision-visibility.test.ts`
- Services: `ideaQueries.ts` (isIdeaVisibleToSubmitter, getDecisionVisibleToSubmitter)
- UI: `DecisionSummary.tsx` (integrated into MyIdeasPage)
- Access: Submitters can only see own ideas and their own decisions

## 6) Manual Testing Scenario

### Scenario: Complete MVP Workflow
1. **User A (Submitter)**
   - Visit app → Login → MyIdeasPage
   - Click "Submit Idea" → IdeaForm
   - Enter title, description, category, select one file
   - Submit → See idea in list with "Submitted" badge

2. **User B (Admin)**
   - Visit app → Login (as admin) → AdminIdeasPage
   - See User A's idea in "Submitted" status
   - Click "Review" → DecisionModal
   - Select "Under Review" (optional comment) → Save
   - See status update to "Under Review" in table

3. **User B (Admin) - Final Decision**
   - In AdminIdeasPage, see User A's idea in "Under Review" status
   - Click "Decide" → DecisionModal
   - Select "Accepted" → Enter decision comment → Save
   - See status update to "Accepted" in table

4. **User A (Submitter) - View Outcome**
   - Visit app → Login → MyIdeasPage
   - See own idea with "Accepted" badge
   - See DecisionSummary component: "✅ Accepted | Admin: '<decision comment>' | 2026-02-24 17:56"

### Validation Checklist
- [ ] Submitter receives correct Submitted status on creation
- [ ] Admin can transition Submitted → Under Review
- [ ] Admin can transition Under Review → Accepted/Rejected
- [ ] Comment is optional for Under Review, required for Accept/Reject
- [ ] Submitter sees decision outcome and comment (and timestamp)
- [ ] Role-based access: submitter cannot access AdminIdeasPage
- [ ] Submitter cannot see other submitter's ideas
- [ ] Submitter cannot see decision for ideas they don't own

## 7) Constitution Compliance - Implementation Evidence

### Test-First Development
- ✅ All business logic (auth, validation, decisions, visibility) has unit tests
- ✅ All state transitions (status changes, persistence) have integration tests
- ✅ All user workflows (login→submit→review→see-result) have e2e tests
- ✅ Tests written before implementation; all passing (62/62)

### Type Safety
- ✅ Full TypeScript strict mode: `npm run typecheck` passes (0 errors)
- ✅ Domain types centralized in `src/types/domain.ts`
- ✅ Service interfaces strongly typed (no `any`)

### Build Validation
- ✅ `npm run build` produces optimized artifact (95.37KB gzipped)
- ✅ `npm run lint` passes with 0 violations
- ✅ `npm run test` passes 62/62 tests

### Traceability
- Each user story (US1-US4) linked to tests and implementation files
- src/features/ organized by feature with services, components, and tests
- Release evidence in `specs/001-phase1-prd/checklists/release-evidence.md`

## 8) Common Commands Reference

```bash
# Development
npm run dev                    # Start dev server (localhost:5173)
npm run build                  # Production build
npm run preview               # Preview production build locally

# Testing
npm run test                  # Unit & integration tests (watch mode)
npm run test --run           # Single run
npm run test --run tests/e2e  # E2E tests only (requires dev server)

# Code Quality
npm run typecheck             # TypeScript compilation
npm run lint                  # ESLint checks
npm run lint --fix           # Auto-fix linting issues

# Full Release Pipeline
npm run typecheck && npm run lint && npm run build && npm run test
```

## 9) Next Steps (Phase 7 - Polish)

Optional enhancements for production readiness:
- **T040**: Add end-to-end smoke flow covering US1→US4 (full workflow)
- **T041**: Add edge-case integration tests (cancel decision, re-evaluate, etc.)
- **T045-T047**: Add performance measurements for SC-001, SC-002, SC-003
- **T043**: Traceability matrix for FR/SC coverage

Current status: **MVP Ready** ✅ All core workflows implemented and tested.
