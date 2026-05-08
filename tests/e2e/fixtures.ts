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
    const text = await this.page.locator('text=Open').textContent();
    // Extract count from "Open: X / Y" format
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
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
    // Open priority select dropdown
    const selects = await this.page.locator('select').all();
    if (selects.length > 0) {
      await selects[0].selectOption(priority);
    } else {
      // Fallback for Material UI select
      await this.page.locator(`button:has-text("${priority || 'Select priority'}")`).click();
      await this.page.locator(`li[data-value="${priority}"]`).click();
    }
  }

  async setScheduledDate(date) {
    // date format: YYYY-MM-DD
    const dateInputs = await this.page.locator('input[type="date"]').all();
    if (dateInputs.length > 0) {
      await dateInputs[0].fill(date);
    }
  }

  async submitCreateForm() {
    await this.page.locator('button:has-text("Create Task")').click();
    // Wait for task to appear in the list
    await this.page.waitForTimeout(500);
  }

  // ==================== Task List ====================

  async getTodoCount() {
    const todos = await this.page
      .locator('div[role="listitem"]')
      .count();
    return todos;
  }

  async getTodoTitles() {
    const titles = await this.page
      .locator('div[role="listitem"]')
      .locator('h6')
      .allTextContents();
    return titles;
  }

  async getTodoByTitle(title) {
    return this.page.locator(`div[role="listitem"]:has-text("${title}")`).first();
  }

  async getEmptyStateText() {
    try {
      return await this.page.locator('text=No todos yet').textContent();
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
    const editButton = await todo.locator('button[aria-label="Edit"]').first();
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
      const selects = await dialog.locator('select').all();
      if (selects.length > 0) {
        await selects[0].selectOption(fields.priority);
      }
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
    const deleteButton = await todo.locator('button[aria-label="Delete"]').first();
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
        const element = document.evaluate(
          `//h6[contains(text(), '${titleText}')]`,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        return element !== null;
      },
      title,
      { timeout }
    );
  }

  async clearAllTodos() {
    const deleteButtons = await this.page.locator('button[aria-label="Delete"]').all();
    for (const btn of deleteButtons) {
      await btn.click();
      await this.page.waitForTimeout(300);
    }
  }
}
