# Cypress E2E Testing

This directory contains end-to-end tests for the DMS Frontend application using Cypress.

## Setup

Cypress is already installed as a dev dependency. No additional setup is required.

## Running Tests

### Interactive Mode (Cypress UI)
```bash
npm run test:e2e:ui
# or
npm run cypress:open
```

This opens the Cypress Test Runner where you can:
- Select which tests to run
- Watch tests execute in a real browser
- Debug tests with DevTools
- See visual feedback and screenshots

### Headless Mode (CI/CD)
```bash
npm run test:e2e
# or
npm run cypress:run
```

This runs all tests in headless mode, suitable for CI/CD pipelines.

## Test Structure

```
cypress/
├── e2e/              # End-to-end test specs
│   └── projects.cy.ts
├── fixtures/         # Mock data for tests
│   └── projects.json
├── support/          # Shared test utilities
│   ├── commands.ts   # Custom Cypress commands
│   ├── e2e.ts        # E2E setup
│   └── component.ts  # Component test setup
└── README.md         # This file
```

## Writing Tests

### Custom Commands

**Login Command**
```typescript
cy.login('username', 'password');
// or use environment defaults
cy.login();
```

**API Mocking**
```typescript
cy.mockApi('GET', '/api/projects', { data: [] });
```

### Using Fixtures

```typescript
cy.intercept('GET', '/api/projects', {
  fixture: 'projects.json'
}).as('getProjects');

cy.wait('@getProjects');
```

## Configuration

Configuration is in `cypress.config.ts`:
- **Base URL**: `https://dms.internal:5173`
- **API URL**: `http://api.dms.internal:8080` (env.apiUrl)
- **Auth URL**: `http://auth.dms.internal:8083` (env.authUrl)

## Test Coverage

Current test suites:

### Projects (`projects.cy.ts`)
- Project list display
- Loading and error states
- Search and filtering
- Project creation workflow
- User and email invites
- Project actions (edit, delete)
- Pagination

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Mock API calls** to avoid dependency on backend
3. **Use fixtures** for consistent test data
4. **Wait for async operations** with `cy.wait()` and aliases
5. **Test user flows**, not implementation details

## Debugging

- Use `cy.debug()` to pause test execution
- Use `cy.log()` to output debug information
- Check screenshots in `cypress/screenshots/` on failure
- Use `.only` to run a single test: `it.only('test name', ...)`
