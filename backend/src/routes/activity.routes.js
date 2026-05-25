import express from 'express';
import {
  getGlobalActivities,
  getRepositoryActivities,
  getUserActivities,
} from '../controllers/activity.controller.js';
import resolveRepositoryContext from '../middleware/resolveRepositoryContext.js';

const router = express.Router();

router.get('/global', getGlobalActivities);
router.get('/user/:username', getUserActivities);
router.get('/repository/:username/:reponame', resolveRepositoryContext, getRepositoryActivities);

export default router;
