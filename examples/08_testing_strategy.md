# Testing Strategy
> Tells the AI what tests to write and how to structure them

## Testing Approach
Three levels of testing, applied proportionally to risk:

Unit tests (Vitest): pure utility functions and custom hooks. Highest priority — these are fast, deterministic, and catch logic errors cheaply. Target: all functions in src/utils/ and src/features/*/hooks/.

Component tests (Vitest + React Testing Library): UI components in isolation. Focus on interaction logic (form submission, validation errors, modal open/close). Mock Supabase client with vi.mock().

E2E tests (Playwright): critical user journeys run against a real Supabase test project. Slower but highest confidence. Run in CI on every PR. Cover only the paths that, if broken, would stop users from using the app entirely.

## Critical Happy Paths
- User registers, receives verification email, clicks link, lands on onboarding
- User creates a project and is taken to the empty Kanban board
- User creates a task — it appears in the Backlog column immediately
- User drags a task from Backlog to In Progress — status updates in real time for all team members
- Project owner invites a teammate by email — teammate receives email, clicks link, joins project
- User edits a task title and description — changes persist after page refresh
- User deletes a task — it disappears from the board with no errors

## Edge Cases & Negatives
- Registration with an already-used email shows a clear error message
- Login with wrong password shows "Incorrect email or password" (not which field is wrong)
- Invite link with an expired token shows "This invite has expired" screen
- Invite link already accepted shows "You are already a member" screen
- Creating a task with an empty title is blocked — button disabled, inline error shown
- Task description over 10,000 characters shows character limit warning and blocks save
- Non-member accessing /project/:id directly is redirected to dashboard with an error toast
- Deleting a project that has 10+ tasks completes without timeout or partial deletion

## Testing Tools
Vitest + React Testing Library (unit and component tests), Playwright (E2E), MSW (Mock Service Worker) for mocking fetch calls in component tests where needed. pnpm test runs Vitest, pnpm e2e runs Playwright.

## Coverage Targets
Unit + component: 80% line coverage overall. 100% coverage required on: auth flows (register, login, logout), RLS-related utility functions, invite token validation logic.
E2E: all 7 critical happy paths must pass on every PR. No coverage % target for E2E — quality over quantity.
