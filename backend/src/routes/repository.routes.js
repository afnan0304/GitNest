import express from 'express';
import {
    createRepository,
    getRepository,
    getUserRepositories,
    updateRepository,
    deleteRepository,
    starRepository,
    forkRepository,
} from '../controllers/repository.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import resolveRepositoryContext from '../middleware/resolveRepositoryContext.js';
import validate from '../middleware/validate.js';
import {
    createRepositoryValidator,
    updateRepositoryValidator,
} from '../validators/repository.validators.js';

const router = express.Router();

//Public routes
router.get('/:username', getUserRepositories);
router.get('/:username/:reponame', resolveRepositoryContext, getRepository);

//Protected routes
router.post('/', protect, validate(createRepositoryValidator), createRepository);
router.put('/:username/:reponame', protect, resolveRepositoryContext, validate(updateRepositoryValidator), updateRepository);
router.delete('/:username/:reponame', protect, resolveRepositoryContext, deleteRepository);
router.post('/:username/:reponame/star', protect, resolveRepositoryContext, starRepository);
router.post('/:username/:reponame/fork', protect, resolveRepositoryContext, forkRepository);

export default router;