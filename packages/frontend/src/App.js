import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const EMPTY_FORM = {
  title: '',
  description: '',
  scheduledDate: '',
  priority: 'medium',
};

function getErrorMessage(errorPayload, fallbackMessage) {
  if (errorPayload?.errors && Array.isArray(errorPayload.errors)) {
    return errorPayload.errors.join(' ');
  }

  if (errorPayload?.error) {
    return errorPayload.error;
  }

  return fallbackMessage;
}

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [editState, setEditState] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');

      if (!response.ok) {
        throw new Error('Unable to load todos.');
      }

      const result = await response.json();
      setTodos(result);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();

    if (!formState.title.trim()) {
      setFormError('A title is required to create a task.');
      return;
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formState.title,
          description: formState.description,
          scheduledDate: formState.scheduledDate || null,
          priority: formState.priority,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Failed to create todo.'));
      }

      setTodos((current) => [result, ...current]);
      setFormState(EMPTY_FORM);
      setFormError('');
      setError('');
      setSnackbarMessage('Task created');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Failed to update todo.'));
      }

      setTodos((current) => current.map((item) => (item.id === result.id ? result : item)));
      setSnackbarMessage(result.completed ? 'Task completed' : 'Task marked active');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Failed to delete todo.'));
      }

      setTodos((current) => current.filter((item) => item.id !== todoId));
      setError('');
      setSnackbarMessage('Task deleted');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenEdit = (todo) => {
    setEditState({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      scheduledDate: todo.scheduledDate || '',
      priority: todo.priority,
    });
  };

  const handleEditChange = (field, value) => {
    setEditState((current) => ({ ...current, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editState.title.trim()) {
      setError('A title is required to save this task.');
      return;
    }

    try {
      const response = await fetch(`/api/todos/${editState.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editState.title,
          description: editState.description,
          scheduledDate: editState.scheduledDate || null,
          priority: editState.priority,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(result, 'Failed to save todo changes.'));
      }

      setTodos((current) => current.map((item) => (item.id === result.id ? result : item)));
      setEditState(null);
      setError('');
      setSnackbarMessage('Task updated');
    } catch (err) {
      setError(err.message);
    }
  };

  const openCount = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);

  return (
    <Box className="app-shell">
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3}>
          <Card elevation={6}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h4" component="h1" fontWeight={700}>
                  Task Planner
                </Typography>
                <Typography color="text.secondary">
                  {openCount} open {openCount === 1 ? 'task' : 'tasks'} out of {todos.length}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Create Task
              </Typography>

              <Stack component="form" spacing={2} onSubmit={handleCreateTodo}>
                <TextField
                  required
                  label="Title"
                  value={formState.title}
                  onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))}
                />
                <TextField
                  multiline
                  minRows={2}
                  label="Description"
                  value={formState.description}
                  onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    type="date"
                    label="Scheduled Date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={formState.scheduledDate}
                    onChange={(event) => setFormState((current) => ({
                      ...current,
                      scheduledDate: event.target.value,
                    }))}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel id="priority-create-select">Priority</InputLabel>
                    <Select
                      labelId="priority-create-select"
                      label="Priority"
                      value={formState.priority}
                      onChange={(event) => setFormState((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))}
                    >
                      {PRIORITY_OPTIONS.map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                {formError && <Alert severity="warning">{formError}</Alert>}
                <Button type="submit" variant="contained" size="large">
                  Add Task
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Task List
              </Typography>

              {loading && <Typography>Loading tasks...</Typography>}
              {error && <Alert severity="error">{error}</Alert>}
              {!loading && !error && todos.length === 0 && (
                <Typography color="text.secondary">No tasks yet. Create your first one.</Typography>
              )}

              {!loading && !error && todos.length > 0 && (
                <List disablePadding>
                  {todos.map((todo) => (
                    <ListItem
                      key={todo.id}
                      disableGutters
                      secondaryAction={(
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => handleOpenEdit(todo)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteOutlineRoundedIcon />}
                            onClick={() => handleDelete(todo.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      )}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        py: 1.5,
                        pr: { xs: 0, sm: 16 },
                      }}
                    >
                      <Checkbox
                        edge="start"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo)}
                        slotProps={{ input: { 'aria-label': `Mark ${todo.title} as complete` } }}
                      />
                      <ListItemText
                        primary={todo.title}
                        secondary={todo.description || 'No description'}
                        slotProps={{
                          primary: {
                            sx: {
                              textDecoration: todo.completed ? 'line-through' : 'none',
                              opacity: todo.completed ? 0.7 : 1,
                              fontWeight: 600,
                            },
                          },
                          secondary: {
                            sx: {
                              opacity: todo.completed ? 0.7 : 0.9,
                            },
                          },
                        }}
                      />
                      <Stack direction="row" spacing={1} sx={{ mr: { xs: 0, sm: 2 } }}>
                        <Chip
                          icon={<FlagRoundedIcon />}
                          size="small"
                          variant="outlined"
                          label={`Priority: ${todo.priority}`}
                        />
                        {todo.scheduledDate && (
                          <Chip
                            icon={<EventAvailableRoundedIcon />}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            label={todo.scheduledDate}
                          />
                        )}
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>

      <Dialog open={Boolean(editState)} onClose={() => setEditState(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {editState && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                required
                label="Title"
                value={editState.title}
                onChange={(event) => handleEditChange('title', event.target.value)}
              />
              <TextField
                multiline
                minRows={2}
                label="Description"
                value={editState.description}
                onChange={(event) => handleEditChange('description', event.target.value)}
              />
              <TextField
                type="date"
                label="Scheduled Date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={editState.scheduledDate}
                onChange={(event) => handleEditChange('scheduledDate', event.target.value)}
              />
              <FormControl>
                <InputLabel id="priority-edit-select">Priority</InputLabel>
                <Select
                  labelId="priority-edit-select"
                  label="Priority"
                  value={editState.priority}
                  onChange={(event) => handleEditChange('priority', event.target.value)}
                >
                  {PRIORITY_OPTIONS.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditState(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {process.env.NODE_ENV !== 'test' && (
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={1800}
          onClose={() => setSnackbarMessage('')}
        >
          <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSnackbarMessage('')}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}

export default App;