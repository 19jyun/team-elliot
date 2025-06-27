# Test Suite Structure

This directory contains all unit and integration tests for the backend codebase.

## Structure

- `auth/` — Auth module tests (e.g., login, signup, token, etc.)
- `admin/` — Admin module tests
- ... (other modules as needed)

## Conventions

- Each feature or service should have its own test file, e.g.:
  - `auth.service.login.spec.ts` for login
  - `auth.service.signup.spec.ts` for signup
- Use descriptive `describe` and `it` blocks for clarity.
- Mock external dependencies (DB, bcrypt, etc.) for unit tests.

## Running Tests

```bash
npm test
```

or for a specific file:

```bash
npm test -- --testPathPattern=src/__tests__/auth/auth.service.login.spec.ts
```
