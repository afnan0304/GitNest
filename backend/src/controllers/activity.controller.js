import asyncHandler from '../utils/asyncHandler.js';
import { getGlobalFeed, getRepositoryFeed, getUserFeed } from '../services/activity.service.js';

export const getGlobalActivities = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const { activities, pagination } = await getGlobalFeed({ page, limit });
  res.status(200).json({
    success: true,
    message: 'Global activity feed retrieved successfully',
    activities,
    pagination,
  });
});

export const getUserActivities = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const { activities, pagination } = await getUserFeed({ username, page, limit });
  res.status(200).json({
    success: true,
    message: 'User activity feed retrieved successfully',
    activities,
    pagination,
  });
});

export const getRepositoryActivities = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const { activities, pagination } = await getRepositoryFeed({
    repositoryId: req.resolvedRepository._id,
    page,
    limit,
  });
  res.status(200).json({
    success: true,
    message: 'Repository activity feed retrieved successfully',
    activities,
    pagination,
  });
});
