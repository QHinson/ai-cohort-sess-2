# E2E Tests with Playwright

## Overview

This directory contains end-to-end tests for the Todo Application using Playwright. Tests cover complete user workflows including creating, editing, completing, and deleting todos.

## Test Structure

- **`playwright.config.js`** - Playwright configuration with dev server setup
- **`tests/e2e/fixtures.ts`** - Page Object Model (POM) for Todo Application
- **`tests/e2e/todo-workflows.spec.js`** - Complete test suites covering user workflows
- **`tests/fixtures/`** - Shared test utilities and fixtures

## Page Object Model

The `TodoPage` class encapsulates all user interactions with the application:

### Navigation
- `goto()` - Navigate to the app home page

### Form Interactions
- `fillTitle(title)` - Enter todo title
- `fillDescription(description)` - Enter todo description
- `selectPriority(priority)` - Select priority level (low, medium, high)
- `setScheduledDate(date)` - Set scheduled date (YYYY-MM-DD format)
- `submitCreateForm()` - Submit the create task form

### Todo Management
- `getTodoCount()` - Get number of todos in the list
- `getTodoTitles()` - Get all todo titles
- `getTodoByTitle(title)` - Get specific todo element by title
- `toggleTodoCompletion(title)` - Toggle todo completion status
- `isTodoCompleted(title)` - Check if todo is completed
- `deleteTodo(title)` - Delete a specific todo

### Editing
- `openEditDialog(title)` - Open edit dialog for a todo
- `updateTodoInDialog(fields)` - Update todo fields in the dialog
- `saveEditDialog()` - Save changes and close dialog

### Utilities
- `getTaskCount()` - Get open/total task counts from header
- `getHeaderTitle()` - Get page header title
- `getEmptyStateText()` - Get empty state message
- `waitForTodo(title)` - Wait for a specific todo to appear
- `clearAllTodos()` - Delete all todos in the list

## Running Tests

### Prerequisites

1. Install Playwright browsers (one-time setup):
   ```bash
   npm run test:e2e:install
   ```

2. Ensure both frontend and backend are built and ready:
   ```bash
   npm install
   npm run install:all
   ```

### Run All Tests

```bash
npm run test:e2e
```

This will:
1. Start backend server (port 3030)
2. Start frontend app (port 3000)
3. Run all Playwright tests in headless mode
4. Generate HTML report in `playwright-report/`

### Run with UI Mode (Interactive)

```bash
npx playwright test --ui
```

This opens the Playwright Test UI where you can:
- See tests running in real-time
- Step through tests
- Inspect elements
- View traces

### Run Specific Test File

```bash
npx playwright test tests/e2e/todo-workflows.spec.js
```

### Run Specific Test

```bash
npx playwright test -g "should create a simple todo"
```

### Run in Debug Mode

```bash
npx playwright test --debug
```

The Inspector will open, allowing you to step through tests line-by-line.

### Run Tests in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

Tests will run with visible browser window.

### Run in All Browsers

By default, tests run in Chromium. To test across browsers:

```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

## Test Coverage

The test suite includes:

### Page Loading Tests
- ✓ Load application with correct title
- ✓ Display empty state when no todos
- ✓ Show correct initial task counts

### Creating Todos
- ✓ Create todo with title only
- ✓ Create todo with all fields (title, description, priority, date)
- ✓ Create multiple todos in sequence

### Completing Todos
- ✓ Toggle todo completion status
- ✓ Mark todo as incomplete again
- ✓ Verify count updates on completion

### Editing Todos
- ✓ Edit todo title
- ✓ Edit todo description
- ✓ Edit todo priority
- ✓ Edit scheduled date

### Deleting Todos
- ✓ Delete single todo
- ✓ Delete multiple todos
- ✓ Verify count updates after deletion

### Complete Workflows
- ✓ Full lifecycle: create → edit → complete → reopen → delete
- ✓ Create many todos (stress test)
- ✓ Persist todos across page refresh
- ✓ Persist completion state across refresh

### Accessibility
- ✓ Form has accessible labels
- ✓ Buttons are keyboard accessible

## Debugging Failed Tests

### View Test Report

After tests run, view the HTML report:

```bash
npx playwright show-report
```

### Inspect Traces

Failed tests automatically capture traces. View in the HTML report or:

```bash
npx playwright show-trace trace.zip
```

### Check Console Logs

Tests output detailed logs. Check for:
- Network errors (API failures)
- JavaScript errors in application
- Load state issues

### Common Issues

1. **Port 3000 or 3030 already in use**
   - Kill existing processes: `lsof -ti :3000,3030 | xargs kill -9`

2. **Playwright browsers not installed**
   - Run: `npm run test:e2e:install`

3. **Tests timeout waiting for elements**
   - Increase timeout in `playwright.config.js`
   - Check if selectors need adjustment for UI changes

4. **API calls fail**
   - Verify backend is running on port 3030
   - Check network tab in trace

## CI/CD Integration

In CI environments (GitHub Actions, etc.), tests automatically run with:
- 1 worker (sequential execution)
- 2 retry attempts on failure
- Only Chromium browser
- Artifacts uploaded to `playwright-report/`

## Best Practices

1. **Keep Page Objects Updated** - When UI changes, update POM selectors
2. **Use Descriptive Test Names** - Test names should indicate what is being tested
3. **Common Setup/Teardown** - Use `test.beforeEach` and `test.afterEach`
4. **Wait Strategically** - Avoid hard timeouts; use `waitForLoadState`, element visibility checks
5. **Test User Workflows** - Focus on how users interact, not implementation details
6. **Keep Tests Independent** - No test should depend on another test's data

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
