/**
 * Page Object Model for TodoApp
 * Encapsulates all user interactions with the todo application
 */
export class TodoPage {
  constructor(page) {
    this.page = page;
  }

  // ==================== Navigation ====================

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== Header ====================

  async getHeaderTitle() {
    return this.page.locator('h1').textContent();
  }

  async getTaskCount() {
    const text = await this.page.locator('h1 + p').textContent();
    // Extract count from "X open task(s) out of Y" format
    const match = text?.match(/(\d+)\s+open\s+tasks?\s+out\s+of\s+(\d+)/i);
    if (match) {
      return {
        open: parseInt(match[1], 10),
        total: parseInt(match[2], 10),
      };
    }
    return { open: 0, total: 0 };
  }

  // ==================== Create Task Form ====================

  async fillTitle(title) {
    const textboxes = await this.page.locator('input[type="text"]').all();
    // First textbox is usually title
    await textboxes[0].fill(title);
  }

  async fillDescription(description) {
    const textareas = await this.page.locator('textarea').all();
    if (textareas.length > 0) {
      await textareas[0].fill(description);
    }
  }

  async selectPriority(priority) {
    const priorityCombo = this.page.getByRole('combobox', { name: 'Priority' }).first();
    await priorityCombo.click();
    await this.page.getByRole('option', { name: priority, exact: true }).click();
  }

  async setScheduledDate(date) {
    // date format: YYYY-MM-DD
    const dateInputs = await this.page.locator('input[type="date"]').all();
    if (dateInputs.length > 0) {
      await dateInputs[0].fill(date);
    }
  }

  async submitCreateForm() {
    await this.page.getByRole('button', { name: 'Add Task' }).click();
    // Wait for task to appear in the list
    await this.page.waitForTimeout(500);
  }

  // ==================== Task List ====================

  async getTodoCount() {
    return this.page.getByRole('listitem').count();
  }

  async getTodoTitles() {
    const titles = await this.page
      .locator('.MuiListItemText-primary')
      .allTextContents();
    return titles;
  }

  async getTodoByTitle(title) {
    return this.page.getByRole('listitem').filter({ hasText: title }).first();
  }

  async getEmptyStateText() {
    try {
      return await this.page.locator('text=No tasks yet').textContent();
    } catch {
      return null;
    }
  }

  // ==================== Todo Actions ====================

  async toggleTodoCompletion(title) {
    const todo = await this.getTodoByTitle(title);
    const checkbox = await todo.locator('input[type="checkbox"]').first();
    await checkbox.click();
    await this.page.waitForTimeout(300);
  }

  async isTodoCompleted(title) {
    const todo = await this.getTodoByTitle(title);
    const checkbox = await todo.locator('input[type="checkbox"]').first();
    return checkbox.isChecked();
  }

  async openEditDialog(title) {
    const todo = await this.getTodoByTitle(title);
    const editButton = await todo.getByRole('button', { name: 'Edit' }).first();
    await editButton.click();
    // Wait for dialog to open
    await this.page.locator('[role="dialog"]').waitFor({ state: 'visible' });
  }

  async updateTodoInDialog(fields) {
    // fields can have: title, description, priority, scheduledDate
    const dialog = this.page.locator('[role="dialog"]');

    if (fields.title) {
      const textboxes = await dialog.locator('input[type="text"]').all();
      if (textboxes.length > 0) await textboxes[0].fill(fields.title);
    }

    if (fields.description) {
      const textareas = await dialog.locator('textarea').all();
      if (textareas.length > 0) await textareas[0].fill(fields.description);
    }

    if (fields.priority) {
      const priorityCombo = dialog.getByRole('combobox', { name: 'Priority' });
      await priorityCombo.click();
      await this.page.getByRole('option', { name: fields.priority, exact: true }).click();
    }

    if (fields.scheduledDate) {
      const dateInputs = await dialog.locator('input[type="date"]').all();
      if (dateInputs.length > 0) {
        await dateInputs[0].fill(fields.scheduledDate);
      }
    }
  }

  async saveEditDialog() {
    const dialog = this.page.locator('[role="dialog"]');
    await dialog.locator('button:has-text("Save")').click();
    // Wait for dialog to close
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
    await this.page.waitForTimeout(300);
  }

  async deleteTodo(title) {
    const todo = await this.getTodoByTitle(title);
    const deleteButton = await todo.getByRole('button', { name: 'Delete' }).first();
    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }

  // ==================== Task Details ====================

  async getTodoDescription(title) {
    const todo = await this.getTodoByTitle(title);
    const description = await todo.locator('p').textContent();
    return description;
  }

  async getTodoPriority(title) {
    const todo = await this.getTodoByTitle(title);
    try {
      const priorityChip = await todo.locator('[class*="priority"]').textContent();
      return priorityChip;
    } catch {
      return null;
    }
  }

  async getTodoDate(title) {
    const todo = await this.getTodoByTitle(title);
    try {
      const dateChip = await todo.locator('[class*="date"]').textContent();
      return dateChip;
    } catch {
      return null;
    }
  }

  // ==================== Error Handling ====================

  async getErrorMessage() {
    try {
      return await this.page.locator('[role="alert"]:has-text("Error")').textContent();
    } catch {
      return null;
    }
  }

  async dismissError() {
    const closeButton = await this.page.locator('[role="alert"] button').first();
    await closeButton.click();
  }

  // ==================== Utilities ====================

  async waitForTodo(title, timeout = 5000) {
    await this.page.waitForFunction(
      (titleText) => {
        return Array.from(document.querySelectorAll('.MuiListItemText-primary'))
          .some((node) => node.textContent?.includes(titleText));
      },
      title,
      { timeout }
    );
  }

  async clearAllTodos() {
    const deleteButtons = this.page.getByRole('button', { name: 'Delete' });
    while (await deleteButtons.count()) {
      await deleteButtons.first().click();
      await this.page.waitForTimeout(150);
    }
  }
}
