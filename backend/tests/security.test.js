import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import request from 'supertest';

process.env.NODE_ENV = 'test';

const mockUserFindOne = jest.fn();
const mockRepoFindOne = jest.fn();
const mockRepoFindById = jest.fn();
const mockActivityCreate = jest.fn();
const mockActivityFind = jest.fn();
const mockActivityCount = jest.fn();

jest.unstable_mockModule('../src/models/User.model.js', () => ({
  default: {
    findOne: mockUserFindOne,
  },
}));

jest.unstable_mockModule('../src/models/Repository.model.js', () => ({
  default: {
    findOne: mockRepoFindOne,
    findById: mockRepoFindById,
    create: jest.fn(),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/Activity.model.js', () => ({
  default: {
    create: mockActivityCreate,
    find: mockActivityFind,
    countDocuments: mockActivityCount,
  },
}));

const { default: resolveRepositoryContext } = await import('../src/middleware/resolveRepositoryContext.js');
const { getRepositoryFeed } = await import('../src/services/activity.service.js');
const { default: express } = await import('express');
const { default: repositoryRoutes } = await import('../src/routes/repository.routes.js');
const { default: activityRoutes } = await import('../src/routes/activity.routes.js');
const { default: errorHandler } = await import('../src/middleware/errorHandler.js');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/repositories', repositoryRoutes);
  app.use('/api/v1/activities', activityRoutes);
  app.use(errorHandler);
  return app;
};

const invokeMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    const res = {};
    const next = (err) => {
      resolve(err || null);
    };

    middleware(req, res, next);
  });

describe('repository security regressions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('resolveRepositoryContext resolves the exact repository for duplicate names', async () => {
    const aliceRepo = {
      _id: 'repo-alice',
      name: 'shared',
      owner: { _id: 'user-alice', username: 'alice' },
      visibility: 'public',
    };
    const bobRepo = {
      _id: 'repo-bob',
      name: 'shared',
      owner: { _id: 'user-bob', username: 'bob' },
      visibility: 'public',
    };

    mockUserFindOne.mockResolvedValue({ _id: 'user-alice', username: 'alice' });
    mockRepoFindOne.mockReturnValue({
      populate: jest.fn().mockImplementation(async () => aliceRepo),
    });

    const req = {
      params: { username: 'alice', reponame: 'shared' },
    };

    const error = await invokeMiddleware(resolveRepositoryContext, req);

    expect(error).toBeNull();
    expect(req.resolvedRepository._id).toBe('repo-alice');
    expect(req.resolvedRepository.owner._id).toBe('user-alice');

    mockUserFindOne.mockResolvedValueOnce({ _id: 'user-bob', username: 'bob' });
    mockRepoFindOne.mockReturnValueOnce({
      populate: jest.fn().mockImplementation(async () => bobRepo),
    });

    const bobReq = {
      params: { username: 'bob', reponame: 'shared' },
    };

    const bobError = await invokeMiddleware(resolveRepositoryContext, bobReq);

    expect(bobError).toBeNull();
    expect(bobReq.resolvedRepository._id).toBe('repo-bob');
    expect(bobReq.resolvedRepository.owner._id).toBe('user-bob');
  });

  test('resolveRepositoryContext blocks private repositories for non-owners', async () => {
    const privateRepo = {
      _id: 'repo-private',
      name: 'secret',
      owner: { _id: 'user-alice', username: 'alice' },
      visibility: 'private',
    };

    mockUserFindOne.mockResolvedValue({ _id: 'user-alice', username: 'alice' });
    mockRepoFindOne.mockReturnValue({
      populate: jest.fn().mockImplementation(async () => privateRepo),
    });

    const req = {
      params: { username: 'alice', reponame: 'secret' },
      user: { id: 'user-bob' },
    };

    const error = await invokeMiddleware(resolveRepositoryContext, req);

    expect(error).toBeTruthy();
    expect(error.statusCode).toBe(404);
    expect(req.resolvedRepository).toBeUndefined();
  });

  test('getRepositoryFeed requires a repository id', async () => {
    await expect(
      getRepositoryFeed({ repo: 'shared', page: 1, limit: 10 })
    ).rejects.toThrow('Repository parameter is required');
  });
});

describe('repository activity routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const query = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    };
    mockActivityFind.mockReturnValue(query);
    mockActivityCount.mockResolvedValue(0);
  });

  test('GET repository resolves the correct tenant repository', async () => {
    const app = createTestApp();

    mockUserFindOne.mockResolvedValue({ _id: 'user-alice', username: 'alice' });
    mockRepoFindOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'repo-alice',
        name: 'shared',
        owner: { _id: 'user-alice', username: 'alice' },
        visibility: 'public',
      }),
    });

    const res = await request(app)
      .get('/api/v1/repositories/alice/shared');

    expect(res.status).toBe(200);
    expect(res.body.data.owner.username).toBe('alice');
  });

  test('GET repository activity hides private repos for other users', async () => {
    const app = createTestApp();

    mockUserFindOne.mockResolvedValue({ _id: 'user-alice', username: 'alice' });
    mockRepoFindOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'repo-private',
        name: 'secret',
        owner: { _id: 'user-alice', username: 'alice' },
        visibility: 'private',
      }),
    });

    const res = await request(app)
      .get('/api/v1/activities/repository/alice/secret');

    expect(res.status).toBe(404);
  });
});