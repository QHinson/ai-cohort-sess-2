const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_DB_PATH = process.env.TODO_DB_PATH
  || path.join(__dirname, '..', 'data', 'todos.db');

function initializeDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK (trim(title) <> ''),
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      scheduled_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS todos_updated_at_trigger
    AFTER UPDATE ON todos
    FOR EACH ROW
    BEGIN
      UPDATE todos SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `);
}

function mapTodoRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    completed: Boolean(row.completed),
    scheduledDate: row.scheduled_date,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map((part) => Number(part));
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
  );
}

function parseTodoInput(input, { partial }) {
  const errors = [];
  const payload = {};

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'title')) {
    if (typeof input.title !== 'string' || input.title.trim() === '') {
      errors.push('Title is required.');
    } else {
      payload.title = input.title.trim();
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'description')) {
    if (input.description == null) {
      payload.description = '';
    } else if (typeof input.description !== 'string') {
      errors.push('Description must be a string.');
    } else {
      payload.description = input.description.trim();
    }
  } else if (!partial) {
    payload.description = '';
  }

  if (Object.prototype.hasOwnProperty.call(input, 'completed')) {
    if (typeof input.completed !== 'boolean') {
      errors.push('Completed must be a boolean.');
    } else {
      payload.completed = input.completed ? 1 : 0;
    }
  } else if (!partial) {
    payload.completed = 0;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'scheduledDate')) {
    if (input.scheduledDate === null || input.scheduledDate === '') {
      payload.scheduledDate = null;
    } else if (typeof input.scheduledDate !== 'string' || !isValidDateString(input.scheduledDate)) {
      errors.push('Scheduled date must use YYYY-MM-DD format.');
    } else {
      payload.scheduledDate = input.scheduledDate;
    }
  } else if (!partial) {
    payload.scheduledDate = null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'priority')) {
    if (typeof input.priority !== 'string' || !VALID_PRIORITIES.includes(input.priority)) {
      errors.push('Priority must be one of: low, medium, high.');
    } else {
      payload.priority = input.priority;
    }
  }

  if (partial && Object.keys(payload).length === 0) {
    errors.push('At least one updatable field is required.');
  }

  return { errors, payload };
}

function parseTodoId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
}

function createApp(options = {}) {
  const app = express();
  const dbPath = options.dbPath || DEFAULT_DB_PATH;

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  initializeDatabase(db);

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  const insertTodoStmt = db.prepare(`
    INSERT INTO todos (title, description, completed, scheduled_date, priority)
    VALUES (?, ?, ?, ?, ?)
  `);

  const getTodoByIdStmt = db.prepare('SELECT * FROM todos WHERE id = ?');
  const listTodosStmt = db.prepare('SELECT * FROM todos ORDER BY created_at DESC, id DESC');
  const deleteTodoStmt = db.prepare('DELETE FROM todos WHERE id = ?');

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Todo backend server is running' });
  });

  app.get('/api/todos', (req, res) => {
    try {
      const todos = listTodosStmt.all().map(mapTodoRow);
      res.json(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      res.status(500).json({ error: 'Failed to fetch todos.' });
    }
  });

  app.post('/api/todos', (req, res) => {
    try {
      const { errors, payload } = parseTodoInput(req.body || {}, { partial: false });

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const result = insertTodoStmt.run(
        payload.title,
        payload.description,
        payload.completed,
        payload.scheduledDate,
        payload.priority,
      );

      const todo = getTodoByIdStmt.get(result.lastInsertRowid);
      return res.status(201).json(mapTodoRow(todo));
    } catch (error) {
      console.error('Error creating todo:', error);
      return res.status(500).json({ error: 'Failed to create todo.' });
    }
  });

  app.patch('/api/todos/:id', (req, res) => {
    try {
      const todoId = parseTodoId(req.params.id);

      if (!todoId) {
        return res.status(400).json({ error: 'Valid todo ID is required.' });
      }

      const existingTodo = getTodoByIdStmt.get(todoId);
      if (!existingTodo) {
        return res.status(404).json({ error: 'Todo not found.' });
      }

      const { errors, payload } = parseTodoInput(req.body || {}, { partial: true });

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      const nextTodo = {
        title: payload.title ?? existingTodo.title,
        description: payload.description ?? existingTodo.description,
        completed: payload.completed ?? existingTodo.completed,
        scheduledDate: Object.prototype.hasOwnProperty.call(payload, 'scheduledDate')
          ? payload.scheduledDate
          : existingTodo.scheduled_date,
        priority: payload.priority ?? existingTodo.priority,
      };

      db.prepare(`
        UPDATE todos
        SET title = ?, description = ?, completed = ?, scheduled_date = ?, priority = ?
        WHERE id = ?
      `).run(
        nextTodo.title,
        nextTodo.description,
        nextTodo.completed,
        nextTodo.scheduledDate,
        nextTodo.priority,
        todoId,
      );

      const updatedTodo = getTodoByIdStmt.get(todoId);
      return res.json(mapTodoRow(updatedTodo));
    } catch (error) {
      console.error('Error updating todo:', error);
      return res.status(500).json({ error: 'Failed to update todo.' });
    }
  });

  app.delete('/api/todos/:id', (req, res) => {
    try {
      const todoId = parseTodoId(req.params.id);

      if (!todoId) {
        return res.status(400).json({ error: 'Valid todo ID is required.' });
      }

      const result = deleteTodoStmt.run(todoId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Todo not found.' });
      }

      return res.json({ message: 'Todo deleted successfully.', id: todoId });
    } catch (error) {
      console.error('Error deleting todo:', error);
      return res.status(500).json({ error: 'Failed to delete todo.' });
    }
  });

  return { app, db };
}

module.exports = { createApp, DEFAULT_DB_PATH };