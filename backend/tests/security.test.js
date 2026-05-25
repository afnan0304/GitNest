import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

process.env.NODE_ENV = 'test';

const mockUserFindOne = jest.fn();
const mockRepoFindOne = jest.fn();
const mockRepoFindById = jest.fn();
const mockActivityCreate = jest.fn();

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
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

const { default: resolveRepositoryContext } = await import('../src/middleware/resolveRepositoryContext.js');
const { getRepositoryFeed } = await import('../src/services/activity.service.js');

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