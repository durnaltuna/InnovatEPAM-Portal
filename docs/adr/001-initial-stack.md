# ADR 001: Initial Tech Stack

## Status
Proposed

## Context
We need a robust, scalable stack to deliver the Phase 1 MVP in an 8.5-hour sprint.

## Decision
- **Frontend**: React + Vite (for speed and HMR).
- **Styling**: Tailwind CSS (for rapid UI development).
- **Backend/Auth**: Supabase (PostgreSQL + Built-in Auth) to minimize boilerplate.
- **State Management**: React Context or Zustand.

## Consequences
- Fast initial setup.
- Dependent on Supabase connectivity.
- Built-in RBAC through Supabase policies.
