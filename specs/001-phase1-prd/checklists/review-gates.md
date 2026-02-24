# Review Gates Checklist

## Constitution Compliance Evidence

- [x] Spec and plan references are present in branch artifacts.
- [x] Lint command passes (`npm run lint`).
- [x] Type check passes (`npm run typecheck`).
- [x] Unit/integration tests pass (`npm run test`).
- [x] Build passes (`npm run build`).
- [x] E2E evidence captured (`npm run test:e2e`).

## Security & Role Evidence

- [x] Submitter and admin role boundaries are defined.
- [x] Login failure and unauthorized access behavior are test-covered.
- [x] Admin decision workflow evidence explicitly deferred to next scope increment and tracked in tasks T027-T033.
