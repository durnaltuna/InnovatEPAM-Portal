# InnovatEPAM Portal

An innovation idea management system that enables employees to submit proposals and empowers administrators to review, evaluate, and manage the decision workflow.

---

## 🚀 Overview

InnovatEPAM is a web-based portal designed for rapid innovation cycles. The Phase 1 MVP implements a complete end-to-end workflow:
* **Authentication**: Secure login with role-based access control (Submitter/Admin roles).
* **Idea Submission**: Form-based submission with a strict "exactly one" file attachment constraint.
* **Admin Workflow**: State-controlled decision management (Submitted → Under Review → Accepted/Rejected).
* **Transparency**: Dashboards for submitters to track own ideas, decision history, and admin feedback.

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19.2.4 + Vite 7.3.1 | Fast HMR, rapid production builds, and minimal boilerplate. |
| **Language** | TypeScript 5.9.3 | Strict type safety to reduce runtime bugs and enforce contracts. |
| **Styling** | Custom CSS + Inline Styles | Simple, localized styling for quick visual iteration. |
| **Persistence** | Browser `localStorage` | Reliable offline-friendly behavior for MVP/prototyping. |
| **Testing** | Vitest & Playwright | Comprehensive 3-layer testing strategy. |

---

## ✨ Features Completed (Phase 1 MVP)

### User Registration & Access
* Secure login and registration with role-based access control.
* Protected routes and session persistence across page reloads.

### Idea Management
* Submitter form with title, description, and category fields.
* Exactly one file attachment support enforced via service-level validation.

### Admin Decision Workflow
* **State Machine**: Ideas must transition from "Submitted" to "Under Review" before a final "Accepted" or "Rejected" status.
* **Feedback**: Comments are required for final decisions to ensure transparency.
* **Audit Trail**: Decision history tracking with timestamps and actor information.

### Submitter Visibility
* Access control ensures submitters can only see their own ideas.
* Admin comments and decision timestamps are visible in the submitter dashboard.

---

## 🏗 Architectural Patterns

* **Service Layer**: Business logic is isolated in `*Service.ts` files (Auth, Idea, Attachment, Decision) to keep UI concerns separate from persistence.
* **Access Control Layer**: Query filtering functions (e.g., `isIdeaVisibleToSubmitter`) gate data access at the service level.
* **Feature-Based Structure**: Organized by domain (e.g., `src/features/auth/`, `src/features/admin/`).
* **Backend Readiness**: Includes a Supabase client scaffold (`src/services/supabase/client.ts`) for future migration.

---

## 🧪 Quality & Testing

The project maintains a high-quality bar with **63 passing unit/integration tests** and a full E2E suite.

* **Unit Tests (29)**: Business logic, validation rules, and role enforcement.
* **Integration Tests (34)**: Complete workflows including mocked browser storage and service interactions.
* **E2E Tests (21)**: Real browser automation via Playwright covering full user journeys.

---

## 🚦 Getting Started

### Commands

```bash
# Installation
npm install

# Development & Quality Gates
npm run dev               # Start Vite dev server
npm run typecheck         # TypeScript compilation check
npm run lint              # ESLint code quality check
npm run test              # Run unit + integration tests
npm run test:e2e          # Run E2E tests (requires dev server)
npm run build             # Production build
