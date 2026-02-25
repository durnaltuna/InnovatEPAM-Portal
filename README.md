# InnovatEPAM Portal

A web-based innovation idea management system that enables employees to submit innovative proposals and allows administrators to review, evaluate, and provide feedback on submitted ideas.

## Overview

InnovatEPAM Portal is a full-stack MVP (Minimum Viable Product) that implements a complete workflow:
- **User authentication** with role-based access control (Submitter/Admin roles)
- **Idea submission** with file attachments (exactly one per idea)
- **Admin decision management** with multi-stage workflow (Submitted → Under Review → Accepted/Rejected)
- **Real-time visibility** of admin decisions back to submitters
- **Comprehensive test coverage** with unit, integration, and E2E tests

## Tech Stack

### Frontend
- **React** 19.2.4 - UI framework
- **TypeScript** 5.9.3 - Type-safe JavaScript
- **Vite** 7.3.1 - Build tool with HMR
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** 7.13.1 - Client-side routing

### Backend & Data
- **Supabase** - Managed PostgreSQL, Auth, and File Storage
- **React Context** - State management

### Testing
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Testing Library** - React component testing

### Code Quality
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Prerequisites

- Node.js >= 20
- npm or yarn
- Supabase account with a project set up

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Running Tests

```bash
# Run all unit and integration tests
npm test

# Watch mode for development
npm test:watch

# End-to-end tests (requires running dev server)
npm run test:e2e
```

## Building for Production

```bash
npm run build
```

This runs type checking, then builds optimized production bundles in the `dist/` directory.

## Project Structure

```
src/
├── main.tsx                    # Application entry point
├── app/
│   ├── AppShell.tsx           # Main app layout
│   └── router.tsx             # Route definitions
├── features/
│   ├── admin/                 # Admin dashboard features
│   │   ├── AdminIdeasPage.tsx
│   │   ├── DecisionModal.tsx
│   │   └── decisionService.ts
│   ├── auth/                  # Authentication features
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── authService.ts
│   │   └── guards.ts
│   └── ideas/                 # Idea management features
│       ├── MyIdeasPage.tsx
│       ├── IdeaForm.tsx
│       ├── ideaService.ts
│       ├── attachmentService.ts
│       ├── ideaQueries.ts
│       └── DecisionSummary.tsx
├── services/
│   ├── errors.ts              # Error handling utilities
│   ├── validation.ts          # Form validation logic
│   └── supabase/
│       └── client.ts          # Supabase client configuration
├── types/
│   └── domain.ts              # TypeScript domain models
tests/
├── unit/                      # Unit tests for business logic
├── integration/               # Integration tests with mocked services
└── e2e/                       # End-to-end tests with Playwright
```

## Core Features

### 1. User Registration & Login
- Secure registration with email and password
- Role-based access control (Submitter/Admin roles)
- Session persistence across page reloads
- Protected routes enforcing authentication

### 2. Idea Submission
- Submitter form with title, description, and category fields
- File attachment support (exactly one file per idea)
- Form validation with user feedback
- Automatic status initialization as "Submitted"

### 3. Admin Decision Workflow
- Admin dashboard displaying all submitted ideas
- Multi-stage status transitions: Submitted → Under Review → Accepted/Rejected
- Conditional comment requirements (required for final decisions, optional for Under Review)
- Decision history tracking with timestamps

### 4. Submitter Decision Visibility
- Submitters view only their own submitted ideas
- Real-time visibility of admin decisions
- Comments displayed with decisions
- Decision timestamps shown for reference

## Documentation

- **Engineering Constitution**: [docs/standards/constitution.md](docs/standards/constitution.md)
- **Project Specification**: [specs/001-phase1-prd/spec.md](specs/001-phase1-prd/spec.md)
- **Data Model**: [specs/001-phase1-prd/data-model.md](specs/001-phase1-prd/data-model.md)
- **Architecture Decision Records**: [docs/adr/](docs/adr/)

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |

## Testing Coverage

- **Unit Tests**: 29 tests covering business logic, validation rules, and role enforcement
- **Integration Tests**: 33 tests covering complete workflows with mocked services
- **E2E Tests**: 8 tests covering complete user journeys in browser

## Contributing

Please refer to [docs/standards/constitution.md](docs/standards/constitution.md) for contribution guidelines and engineering governance standards.

## License

ISC
