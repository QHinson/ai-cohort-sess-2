const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Todos API', () => {
  let app;
  let db;

  beforeEach(() => {
    const setup = createApp({ dbPath: ':memory:' });
    app = setup.app;
    db = setup.db;
  });

  afterEach(() => {
    db.close();
  });

  it('creates and lists todos', async () => {
    const createResponse = await request(app).post('/api/todos').send({
      title: 'Write integration tests',
      description: 'Cover create and list behavior',
      priority: 'high',
      scheduledDate: '2026-04-21',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Write integration tests');
    expect(createResponse.body.priority).toBe('high');
    expect(createResponse.body.completed).toBe(false);
    expect(createResponse.body.scheduledDate).toBe('2026-04-21');

    const listResponse = await request(app).get('/api/todos');

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      title: 'Write integration tests',
      description: 'Cover create and list behavior',
      priority: 'high',
      completed: false,
    });
  });

  it('rejects todo creation without title', async () => {
    const response = await request(app).post('/api/todos').send({
      description: 'Missing title',
      priority: 'medium',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Title is required.');
  });

  it('updates an existing todo', async () => {
    const createResponse = await request(app).post('/api/todos').send({
      title: 'Initial title',
      priority: 'low',
    });

    const updateResponse = await request(app)
      .patch(`/api/todos/${createResponse.body.id}`)
      .send({
        title: 'Updated title',
        completed: true,
        priority: 'medium',
        scheduledDate: null,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: createResponse.body.id,
      title: 'Updated title',
      completed: true,
      priority: 'medium',
      scheduledDate: null,
    });
  });

  it('deletes a todo and returns 404 on second delete', async () => {
    const createResponse = await request(app).post('/api/todos').send({
      title: 'Delete me',
      priority: 'low',
    });

    const deleteResponse = await request(app).delete(`/api/todos/${createResponse.body.id}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Todo deleted successfully.',
      id: createResponse.body.id,
    });

    const secondDeleteResponse = await request(app).delete(`/api/todos/${createResponse.body.id}`);

    expect(secondDeleteResponse.status).toBe(404);
    expect(secondDeleteResponse.body).toEqual({ error: 'Todo not found.' });
  });

  it('validates update requests with no fields', async () => {
    const createResponse = await request(app).post('/api/todos').send({
      title: 'Patch validation',
      priority: 'medium',
    });

    const response = await request(app).patch(`/api/todos/${createResponse.body.id}`).send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('At least one updatable field is required.');
  });
});
