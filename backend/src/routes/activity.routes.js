import express from 'express';
import {
  getGlobalActivities,
  getRepositoryActivities,
  getUserActivities,
} from '../controllers/activity.controller.js';
import resolveRepositoryContext from '../middleware/resolveRepositoryContext.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/global', ...schemaValidator(contracts.activities.global), getGlobalActivities);
router.get('/user/:username', ...schemaValidator(contracts.activities.user), getUserActivities);
router.get(
  '/repository/:username/:reponame',
  protect,
  ...schemaValidator(contracts.activities.repository),
  resolveRepositoryContext,
  getRepositoryActivities
);

export default router;
