import test from 'node:test';
import assert from 'node:assert/strict';

import resolveRepositoryContext from '../src/middleware/resolveRepositoryContext.js';
import { getRepositoryFeed } from '../src/services/activity.service.js';
import Repository from '../src/models/Repository.model.js';
import User from '../src/models/User.model.js';

const originalUserFindOne = User.findOne;
const originalRepositoryFindOne = Repository.findOne;

const createRepositoryQuery = (repository) => ({
  populate: async () => repository,
});

const invokeMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    const res = {};
    const next = (err) => resolve(err ?? null);
    middleware(req, res, next);
  });

test.beforeEach(() => {
  User.findOne = originalUserFindOne;
  Repository.findOne = originalRepositoryFindOne;
});

test.afterEach(() => {
  User.findOne = originalUserFindOne;
  Repository.findOne = originalRepositoryFindOne;
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

  User.findOne = async ({ username }) => ({
    _id: username === 'alice' ? 'user-alice' : 'user-bob',
    username,
  });

  Repository.findOne = ({ owner }) =>
    createRepositoryQuery(owner === 'user-alice' ? aliceRepo : bobRepo);

  const req = {
    params: { username: 'alice', reponame: 'shared' },
  };

  const error = await invokeMiddleware(resolveRepositoryContext, req);

  assert.equal(error, null);
  assert.equal(req.resolvedRepository._id, 'repo-alice');
  assert.equal(req.resolvedRepository.owner._id, 'user-alice');
});

test('resolveRepositoryContext blocks private repositories for non-owners', async () => {
  const privateRepo = {
    _id: 'repo-private',
    name: 'secret',
    owner: { _id: 'user-alice', username: 'alice' },
    visibility: 'private',
  };

  User.findOne = async () => ({
    _id: 'user-alice',
    username: 'alice',
  });

  Repository.findOne = () => createRepositoryQuery(privateRepo);

  const req = {
    params: { username: 'alice', reponame: 'secret' },
    user: { id: 'user-bob' },
  };

  const error = await invokeMiddleware(resolveRepositoryContext, req);

  assert.ok(error);
  assert.equal(error.statusCode, 404);
  assert.equal(req.resolvedRepository, undefined);
});

test('getRepositoryFeed requires a resolved repository id', async () => {
  await assert.rejects(
    () => getRepositoryFeed({ repo: 'shared', page: 1, limit: 10 }),
    {
      message: 'Repository parameter is required',
    }
  );
});