# Quickstart: Phase 1 PRD Baseline

## 1) Prerequisites
- Node.js 20+
- npm 10+
- Supabase project credentials (URL + anon key)

## 2) Install and Run
1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - `VITE_SUPABASE_URL=<your-supabase-url>`
   - `VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>`
3. Start app:
   - `npm run dev`

## 3) Test-First Validation Sequence
1. Write/update failing tests for:
   - login success/failure and role guard behavior
   - idea required fields and one-attachment limit
   - admin accept/reject with required comments
   - submitter visibility of decision outcomes
2. Run unit/integration tests:
   - `npm run test`
3. Implement until tests pass.
4. Run end-to-end validation:
   - `npm run test:e2e`

## 4) Manual Scenario Checks
- Login as submitter and confirm access.
- Submit idea with one attachment and confirm status Submitted.
- Attempt second attachment and confirm validation message.
- Login as admin, accept/reject with comment.
- Login back as submitter and verify decision visibility.

## 5) Constitution Compliance Checkpoints
- Confirm PR links to spec and ADR references.
- Confirm failing tests were written before implementation updates.
- Confirm reviewer checklist includes security/role traceability and AI-assisted output review.
