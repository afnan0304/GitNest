import { jest, describe, beforeEach, test, expect } from '@jest/globals';
import request from 'supertest';

process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';
process.env.TRUST_PROXY = '1';
process.env.AUTH_RATE_LIMIT_MAX = '1';
process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';

const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFindById = jest.fn();
const mockSign = jest.fn(() => 'signed.jwt.token');
const mockVerify = jest.fn(() => ({ id: 'user-id' }));

await jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
    findById: mockFindById,
  },
}));

await jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
    verify: mockVerify,
  },
}));

const { default: createApp } = await import('../src/app.js');
const app = createApp();

const withIp = (req, ip) => req.set('X-Forwarded-For', ip);

const makeResponseUser = (overrides = {}) => ({
  _id: 'user-id',
  username: 'tester',
  email: 'tester@example.com',
  ...overrides,
});

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register with invalid data returns validation errors', async () => {
    const res = await withIp(
      request(app).post('/api/v1/auth/register')
        .send({ username: 't1', email: 'bad', password: '123' }),
      '10.0.0.10'
    );

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      status: 'fail',
      message: 'Validation failed',
    });
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('register, login, and getMe succeed with mocked model methods', async () => {
    mockFindOne.mockImplementationOnce(() => Promise.resolve(null));
    mockFindOne.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        _id: 'user-id',
        username: 'tester',
        email: 'tester@example.com',
        matchPassword: jest.fn().mockResolvedValue(true),
      }),
    }));

    mockCreate.mockResolvedValue(makeResponseUser());
    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(makeResponseUser()),
    });

    const registerRes = await withIp(
      request(app).post('/api/v1/auth/register')
        .send({
          username: 'tester',
          email: 'tester@example.com',
          password: 'password123',
        }),
      '10.0.0.11'
    );

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data).toMatchObject({
      _id: 'user-id',
      username: 'tester',
      email: 'tester@example.com',
      token: 'signed.jwt.token',
    });

    const loginRes = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({
          email: 'tester@example.com',
          password: 'password123',
        }),
      '10.0.0.12'
    );

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data).toMatchObject({
      _id: 'user-id',
      username: 'tester',
      email: 'tester@example.com',
      token: 'signed.jwt.token',
    });

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer signed.jwt.token');

    expect(meRes.status).toBe(200);
    expect(meRes.body.data).toMatchObject({
      _id: 'user-id',
      username: 'tester',
      email: 'tester@example.com',
    });
  });

  test('rate limiting returns 429 after too many auth attempts', async () => {
    mockFindOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    const ip = '10.0.0.13';

    await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' }),
      ip
    );

    const limited = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' }),
      ip
    );

    expect(limited.status).toBe(429);
    expect(limited.body).toMatchObject({
      success: false,
      status: 'fail',
    });
  });

  test('login validation rejects invalid email', async () => {
    const res = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'password123' }),
      '10.0.0.14'
    );

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      status: 'fail',
      message: 'Validation failed',
    });
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  test('login validation requires both email and password', async () => {
    const res = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'test@test.com' }),
      '10.0.0.15'
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('register rejects duplicate email/username', async () => {
    mockFindOne.mockResolvedValue(makeResponseUser());

    const res = await withIp(
      request(app).post('/api/v1/auth/register')
        .send({
          username: 'tester',
          email: 'tester@example.com',
          password: 'password123',
        }),
      '10.0.0.16'
    );

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      status: 'fail',
      message: 'User already exists',
    });
  });

  test('login with wrong credentials returns 401', async () => {
    mockFindOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: 'user-id',
        username: 'tester',
        email: 'tester@example.com',
        matchPassword: jest.fn().mockResolvedValue(false),
      }),
    }));

    const res = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'tester@example.com', password: 'wrongpassword' }),
      '10.0.0.17'
    );

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      status: 'fail',
      message: 'Invalid credentials',
    });
  });

  test('login with non-existent user returns 401', async () => {
    mockFindOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    const res = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' }),
      '10.0.0.18'
    );

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('success responses include success: true', async () => {
    mockFindOne.mockImplementationOnce(() => Promise.resolve(null));
    mockFindOne.mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        _id: 'user-id',
        username: 'tester',
        email: 'tester@example.com',
        matchPassword: jest.fn().mockResolvedValue(true),
      }),
    }));

    mockCreate.mockResolvedValue(makeResponseUser());

    const registerRes = await withIp(
      request(app).post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'password123',
        }),
      '10.0.0.19'
    );

    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.status).toBe('success');

    const loginRes = await withIp(
      request(app).post('/api/v1/auth/login')
        .send({ email: 'tester@test.com', password: 'password123' }),
      '10.0.0.20'
    );

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.status).toBe('success');
  });

  test('GET /me without token returns 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      status: 'fail',
    });
  });

  test('GET /me with invalid token returns 401', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not authorized to access this route');
  });

  test('GET /me with deleted user returns 401', async () => {
    mockVerify.mockReturnValue({ id: 'deleted-user-id' });
    mockFindById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer some-valid-token');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('User associated with token no longer exists');
  });

  test('NoSQL injection via email is sanitized', async () => {
    mockFindOne.mockResolvedValue(null);

    const res = await withIp(
      request(app).post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: { $ne: null },
          password: 'password123',
        }),
      '10.0.0.21'
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('register with empty fields returns validation errors', async () => {
    const res = await withIp(
      request(app).post('/api/v1/auth/register')
        .send({ username: '', email: '', password: '' }),
      '10.0.0.22'
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
