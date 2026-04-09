# Testing Guidelines

This document defines the required testing approach, file placement, naming conventions, and maintenance expectations for this project.

## Core Principles

- All tests must be isolated and independent.
- Each test should set up its own data and must not rely on other tests.
- Setup and teardown hooks are required where applicable so tests succeed on repeated runs.
- All new features should include appropriate tests.
- Tests should be maintainable and follow best practices.

## Unit Tests

- Framework: Use Jest to test individual functions and React components in isolation.
- Naming convention: `*.test.js` or `*.test.ts`.
- Backend location: `packages/backend/__tests__/`.
- Frontend location: `packages/frontend/src/__tests__/`.
- File naming: Match the file or unit being tested.
	- Example: `app.test.js` for `app.js`.

## Integration Tests

- Frameworks: Use Jest + Supertest to test backend API endpoints with real HTTP requests.
- Location: `packages/backend/__tests__/integration/`.
- Naming convention: `*.test.js` or `*.test.ts`.
- File naming: Use clear, intent-based names tied to the endpoint/domain under test.
	- Example: `todos-api.test.js` for TODO API endpoints.

## End-to-End (E2E) Tests

- Framework: Use Playwright (required) to test complete UI workflows through browser automation.
- Location: `tests/e2e/`.
- Naming convention: `*.spec.js` or `*.spec.ts`.
- File naming: Name by user journey.
	- Example: `todo-workflow.spec.js`.
- Browser policy: Playwright tests must use one browser only.
- Architecture: Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- Scope guidance: Limit E2E tests to 5-8 critical user journeys, prioritizing happy paths and key edge cases over exhaustive coverage.

## Port Configuration

Always use environment variables with sensible defaults so local development and CI/CD can dynamically assign ports.

- Backend:

```js
const PORT = process.env.PORT || 3030;
```

- Frontend:
	- React default port is `3000`.
	- The port can be overridden with the `PORT` environment variable.

This approach allows CI/CD workflows to dynamically detect and configure ports.
