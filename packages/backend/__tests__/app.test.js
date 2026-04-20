const request = require('supertest');
const { createApp } = require('../src/app');

describe('App Health Endpoint', () => {
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

  it('returns service health status', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Todo backend server is running',
    });
  });
});