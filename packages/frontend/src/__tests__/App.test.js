import { ThemeProvider, createTheme } from '@mui/material';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

let todos;

const renderApp = () => {
  return render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
};

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(todos));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const { title, description, priority, scheduledDate } = req.body;

    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ errors: ['Title is required.'] })
      );
    }

    const createdTodo = {
      id: 99,
      title,
      description: description || '',
      completed: false,
      priority,
      scheduledDate: scheduledDate || null,
      createdAt: '2026-04-20 10:00:00',
      updatedAt: '2026-04-20 10:00:00',
    };
    todos = [createdTodo, ...todos];

    return res(ctx.status(201), ctx.json(createdTodo));
  }),

  rest.patch('/api/todos/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const index = todos.findIndex((todo) => todo.id === id);

    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Todo not found.' }));
    }

    todos[index] = {
      ...todos[index],
      ...req.body,
    };

    return res(ctx.status(200), ctx.json(todos[index]));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    todos = todos.filter((todo) => todo.id !== id);

    return res(
      ctx.status(200),
      ctx.json({ message: 'Todo deleted successfully.', id })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  todos = [
    {
      id: 1,
      title: 'Write release notes',
      description: 'Summarize completed work',
      completed: false,
      priority: 'high',
      scheduledDate: '2026-04-21',
      createdAt: '2026-04-20 08:00:00',
      updatedAt: '2026-04-20 08:00:00',
    },
    {
      id: 2,
      title: 'Refine backlog',
      description: '',
      completed: true,
      priority: 'low',
      scheduledDate: null,
      createdAt: '2026-04-20 09:00:00',
      updatedAt: '2026-04-20 09:00:00',
    },
  ];
  server.resetHandlers();
});
afterAll(() => server.close());

describe('App Component', () => {
  beforeEach(() => {
    todos = [
      {
        id: 1,
        title: 'Write release notes',
        description: 'Summarize completed work',
        completed: false,
        priority: 'high',
        scheduledDate: '2026-04-21',
        createdAt: '2026-04-20 08:00:00',
        updatedAt: '2026-04-20 08:00:00',
      },
      {
        id: 2,
        title: 'Refine backlog',
        description: '',
        completed: true,
        priority: 'low',
        scheduledDate: null,
        createdAt: '2026-04-20 09:00:00',
        updatedAt: '2026-04-20 09:00:00',
      },
    ];
  });

  test('renders the header', async () => {
    renderApp();

    expect(await screen.findByText('Task Planner')).toBeInTheDocument();
    expect(screen.getByText(/open tasks out of/i)).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    renderApp();

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Write release notes')).toBeInTheDocument();
      expect(screen.getByText('Refine backlog')).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    const titleInput = screen.getAllByRole('textbox')[0];
    await user.type(titleInput, 'Plan sprint goals');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(screen.getByText('Plan sprint goals')).toBeInTheDocument();
    });
  });

  test('shows API error when loading fails', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Unable to load todos.')).toBeInTheDocument();
    });
  });

  test('shows empty state when no todos exist', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    renderApp();

    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Create your first one.')).toBeInTheDocument();
    });
  });

  test('toggles and deletes a todo', async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByText('Write release notes');

    const targetCheckbox = screen.getByRole('checkbox', {
      name: /mark write release notes as complete/i,
    });
    await user.click(targetCheckbox);

    await waitFor(() => {
      expect(targetCheckbox).toBeChecked();
    });

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Write release notes')).not.toBeInTheDocument();
    });
  });
});