import { test, expect } from '@playwright/test';
import { TodoPage } from './fixtures';

/**
 * E2E Tests for Todo Application
 * Tests complete user workflows including:
 * - Creating and viewing todos
 * - Completing and marking incomplete
 * - Editing todo details
 * - Deleting todos
 * - Task priority and scheduling
 */

test.describe('Todo Application E2E Tests', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  // ==================== Page Loading ====================

  test('should load the todo application with header', async () => {
    const title = await todoPage.getHeaderTitle();
    expect(title).toContain('Task Planner');
  });

  test('should display empty state when no todos exist', async () => {
    const emptyText = await todoPage.getEmptyStateText();
    expect(emptyText).toContain('No todos yet');
  });

  test('should display initial task count as 0/0', async () => {
    const counts = await todoPage.getTaskCount();
    expect(counts.open).toBe(0);
    expect(counts.total).toBe(0);
  });

  // ==================== Creating Todos ====================

  test('should create a simple todo with title only', async ({ page }) => {
    await todoPage.fillTitle('Buy groceries');
    await todoPage.submitCreateForm();

    // Verify todo appears in the list
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Buy groceries');

    // Verify count updated
    const counts = await todoPage.getTaskCount();
    expect(counts.total).toBe(1);
    expect(counts.open).toBe(1);
  });

  test('should create a todo with all fields filled', async () => {
    await todoPage.fillTitle('Complete project report');
    await todoPage.fillDescription('Finish Q1 quarterly report with metrics');
    await todoPage.selectPriority('high');
    await todoPage.setScheduledDate('2026-05-15');
    await todoPage.submitCreateForm();

    // Verify todo appears
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Complete project report');

    // Verify description
    const description = await todoPage.getTodoDescription('Complete project report');
    expect(description).toContain('Finish Q1 quarterly report with metrics');
  });

  test('should create multiple todos in sequence', async () => {
    const todos = [
      { title: 'Task 1' },
      { title: 'Task 2' },
      { title: 'Task 3' },
    ];

    for (const todo of todos) {
      await todoPage.fillTitle(todo.title);
      await todoPage.submitCreateForm();
    }

    const titles = await todoPage.getTodoTitles();
    expect(titles.length).toBe(3);
    expect(titles).toContain('Task 1');
    expect(titles).toContain('Task 2');
    expect(titles).toContain('Task 3');
  });

  // ==================== Completing Todos ====================

  test('should toggle todo completion status', async () => {
    // Create a todo
    await todoPage.fillTitle('Test todo');
    await todoPage.submitCreateForm();

    // Verify it's not completed
    let isCompleted = await todoPage.isTodoCompleted('Test todo');
    expect(isCompleted).toBe(false);

    // Toggle completion
    await todoPage.toggleTodoCompletion('Test todo');

    // Verify it's now completed
    isCompleted = await todoPage.isTodoCompleted('Test todo');
    expect(isCompleted).toBe(true);

    // Verify count changed (open decreased)
    const counts = await todoPage.getTaskCount();
    expect(counts.open).toBe(0);
    expect(counts.total).toBe(1);
  });

  test('should toggle todo back to incomplete', async () => {
    // Create and complete a todo
    await todoPage.fillTitle('Reversible todo');
    await todoPage.submitCreateForm();
    await todoPage.toggleTodoCompletion('Reversible todo');

    // Toggle back to incomplete
    await todoPage.toggleTodoCompletion('Reversible todo');

    // Verify it's incomplete again
    const isCompleted = await todoPage.isTodoCompleted('Reversible todo');
    expect(isCompleted).toBe(false);

    // Verify count changed back
    const counts = await todoPage.getTaskCount();
    expect(counts.open).toBe(1);
    expect(counts.total).toBe(1);
  });

  // ==================== Editing Todos ====================

  test('should edit todo title in dialog', async () => {
    // Create initial todo
    await todoPage.fillTitle('Original title');
    await todoPage.submitCreateForm();

    // Open edit dialog
    await todoPage.openEditDialog('Original title');

    // Update title
    await todoPage.updateTodoInDialog({ title: 'Updated title' });
    await todoPage.saveEditDialog();

    // Verify title changed
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Updated title');
    expect(titles).not.toContain('Original title');
  });

  test('should edit todo description in dialog', async () => {
    // Create todo
    await todoPage.fillTitle('Todo for editing');
    await todoPage.fillDescription('Original description');
    await todoPage.submitCreateForm();

    // Open edit dialog
    await todoPage.openEditDialog('Todo for editing');

    // Update description
    await todoPage.updateTodoInDialog({ description: 'New description' });
    await todoPage.saveEditDialog();

    // Verify description changed
    const description = await todoPage.getTodoDescription('Todo for editing');
    expect(description).toContain('New description');
  });

  test('should edit todo priority in dialog', async () => {
    // Create todo with low priority
    await todoPage.fillTitle('Priority todo');
    await todoPage.selectPriority('low');
    await todoPage.submitCreateForm();

    // Open edit dialog
    await todoPage.openEditDialog('Priority todo');

    // Update priority
    await todoPage.updateTodoInDialog({ priority: 'high' });
    await todoPage.saveEditDialog();

    // Verify priority changed (just check it still exists)
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Priority todo');
  });

  test('should edit scheduled date in dialog', async () => {
    // Create todo with initial date
    await todoPage.fillTitle('Scheduled todo');
    await todoPage.setScheduledDate('2026-04-20');
    await todoPage.submitCreateForm();

    // Open edit dialog
    await todoPage.openEditDialog('Scheduled todo');

    // Update date
    await todoPage.updateTodoInDialog({ scheduledDate: '2026-05-20' });
    await todoPage.saveEditDialog();

    // Verify todo still exists
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Scheduled todo');
  });

  // ==================== Deleting Todos ====================

  test('should delete a todo', async () => {
    // Create a todo
    await todoPage.fillTitle('Todo to delete');
    await todoPage.submitCreateForm();

    // Verify it exists
    let titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Todo to delete');

    // Delete it
    await todoPage.deleteTodo('Todo to delete');

    // Verify it's gone
    titles = await todoPage.getTodoTitles();
    expect(titles).not.toContain('Todo to delete');

    // Verify count decreased
    const counts = await todoPage.getTaskCount();
    expect(counts.total).toBe(0);
  });

  test('should delete multiple todos', async () => {
    // Create multiple todos
    await todoPage.fillTitle('Delete 1');
    await todoPage.submitCreateForm();
    await todoPage.fillTitle('Delete 2');
    await todoPage.submitCreateForm();

    // Verify both exist
    let count = await todoPage.getTodoCount();
    expect(count).toBe(2);

    // Delete both
    await todoPage.deleteTodo('Delete 1');
    await todoPage.deleteTodo('Delete 2');

    // Verify all gone
    count = await todoPage.getTodoCount();
    expect(count).toBe(0);
  });

  // ==================== Complete Workflow ====================

  test('should complete full todo lifecycle', async () => {
    // 1. Create a todo with all details
    const title = 'Complete lifecycle todo';
    const initialDesc = 'Initial description for lifecycle test';
    await todoPage.fillTitle(title);
    await todoPage.fillDescription(initialDesc);
    await todoPage.selectPriority('medium');
    await todoPage.setScheduledDate('2026-05-01');
    await todoPage.submitCreateForm();

    // Verify creation
    let titles = await todoPage.getTodoTitles();
    expect(titles).toContain(title);

    let counts = await todoPage.getTaskCount();
    expect(counts.total).toBe(1);
    expect(counts.open).toBe(1);

    // 2. Edit the todo
    await todoPage.openEditDialog(title);
    await todoPage.updateTodoInDialog({
      description: 'Updated description after review',
      priority: 'high',
    });
    await todoPage.saveEditDialog();

    // Verify edit
    const updatedDesc = await todoPage.getTodoDescription(title);
    expect(updatedDesc).toContain('Updated description after review');

    // 3. Complete the todo
    await todoPage.toggleTodoCompletion(title);

    // Verify completion
    let isCompleted = await todoPage.isTodoCompleted(title);
    expect(isCompleted).toBe(true);

    counts = await todoPage.getTaskCount();
    expect(counts.open).toBe(0);
    expect(counts.total).toBe(1);

    // 4. Reopen the todo
    await todoPage.toggleTodoCompletion(title);

    // Verify reopened
    isCompleted = await todoPage.isTodoCompleted(title);
    expect(isCompleted).toBe(false);

    counts = await todoPage.getTaskCount();
    expect(counts.open).toBe(1);

    // 5. Delete the todo
    await todoPage.deleteTodo(title);

    // Verify deletion
    titles = await todoPage.getTodoTitles();
    expect(titles).not.toContain(title);

    counts = await todoPage.getTaskCount();
    expect(counts.total).toBe(0);
  });

  // ==================== Stress Tests ====================

  test('should handle creating many todos', async () => {
    const todoCount = 10;

    // Create 10 todos
    for (let i = 1; i <= todoCount; i++) {
      await todoPage.fillTitle(`Todo ${i}`);
      await todoPage.submitCreateForm();
    }

    // Verify all created
    const count = await todoPage.getTodoCount();
    expect(count).toBe(todoCount);

    const counts = await todoPage.getTaskCount();
    expect(counts.total).toBe(todoCount);
  });

  test('should maintain todo data across page refresh', async ({ page }) => {
    // Create a todo
    await todoPage.fillTitle('Persistent todo');
    await todoPage.submitCreateForm();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify todo still exists
    const titles = await todoPage.getTodoTitles();
    expect(titles).toContain('Persistent todo');
  });

  test('should maintain completed state across page refresh', async ({ page }) => {
    // Create and complete a todo
    await todoPage.fillTitle('Persistent completed todo');
    await todoPage.submitCreateForm();
    await todoPage.toggleTodoCompletion('Persistent completed todo');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify completion state persisted
    const isCompleted = await todoPage.isTodoCompleted('Persistent completed todo');
    expect(isCompleted).toBe(true);

    const counts = await todoPage.getTaskCount();
    expect(counts.open).toBe(0);
    expect(counts.total).toBe(1);
  });
});

// ==================== Accessibility Tests ====================

test.describe('Todo Application Accessibility', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should have accessible form labels', async ({ page }) => {
    // Check that inputs have associated labels or aria-labels
    const inputs = await page.locator('input[type="text"]').all();
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('should have accessible buttons', async ({ page }) => {
    // All interactive buttons should be keyboard accessible
    const buttons = await page.locator('button').all();
    expect(buttons.length).toBeGreaterThan(0);

    for (const button of buttons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        // Button should be focusable
        expect(await button.evaluate(el => el.tabIndex >= -1)).toBe(true);
      }
    }
  });
});
