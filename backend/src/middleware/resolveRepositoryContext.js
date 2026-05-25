import User from '../models/User.model.js';
import Repository from '../models/Repository.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const resolveRepositoryContext = asyncHandler(async (req, res, next) => {
  const { username, reponame } = req.params;

  if (!username || !reponame) {
    return next(new AppError('Repository not found', 404));
  }

  const owner = await User.findOne({
    username: username.toLowerCase(),
  });

  if (!owner) {
    return next(new AppError('Repository not found', 404));
  }

  const repository = await Repository.findOne({
    name: reponame,
    owner: owner._id,
  }).populate('owner', 'username avatarUrl bio');

  if (!repository) {
    return next(new AppError('Repository not found', 404));
  }

  if (
    repository.visibility === 'private' &&
    repository.owner._id.toString() !== req.user?.id
  ) {
    return next(new AppError('Repository not found', 404));
  }

  req.resolvedRepository = repository;
  next();
});

export default resolveRepositoryContext;