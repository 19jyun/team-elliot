# Test Suite Structure

This directory contains all unit and integration tests for the backend codebase.

## Structure

- `integration/` — Integration tests that test multiple modules together
- Individual module tests are located in each module's `__tests__/` directory:
  - `auth/__tests__/` — Auth module tests (e.g., login, signup, token, etc.)
  - `class/__tests__/` — Class module tests
  - `student/__tests__/` — Student module tests
  - `teacher/__tests__/` — Teacher module tests
  - `academy/__tests__/` — Academy module tests
  - And more...

## Conventions

- Each feature or service should have its own test file, e.g.:
  - `auth.service.spec.ts` for auth service
  - `auth.controller.spec.ts` for auth controller
- Use descriptive `describe` and `it` blocks for clarity.
- Mock external dependencies (DB, bcrypt, etc.) for unit tests.
- Integration tests should use the `*.integration.spec.ts` naming convention.

## Running Tests

### Unit Tests

Run all unit tests:

```bash
npm run test:unit
```

Run unit tests in watch mode (for development):

```bash
npm run test:unit:watch
```

Run unit tests with coverage:

```bash
npm run test:unit:coverage
```

Run unit tests for specific modules:

```bash
npm run test:unit:auth      # Auth module only
npm run test:unit:class     # Class module only
npm run test:unit:student   # Student module only
npm run test:unit:teacher   # Teacher module only
npm run test:unit:academy   # Academy module only
```

Run a specific test file:

```bash
npm run test:unit -- --testPathPattern=auth.service.spec.ts
```

### Integration Tests

Run all integration tests:

```bash
npm run test:integration
```

### E2E Tests

Run all e2e tests:

```bash
npm run test:e2e
```

### All Tests

Run all tests (unit + integration + e2e):

```bash
npm test
```

## Test Configuration

- Unit tests: `test/jest-unit.json`
- Integration tests: `test/jest-integration.json`
- E2E tests: `test/jest-e2e.json`

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- Unit tests: `coverage/unit/`
- Integration tests: `coverage/integration/`
