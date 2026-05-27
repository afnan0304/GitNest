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
    repoParamValidator,
    createRepositoryValidator,
    updateRepositoryValidator,
} from '../validators/repository.validators.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';

const router = express.Router();

//Public routes
router.get('/:username', ...schemaValidator(contracts.repositories.listByUser), getUserRepositories);
router.get(
    '/:username/:reponame',
    ...schemaValidator(contracts.repositories.get),
    validate(repoParamValidator),
    resolveRepositoryContext,
    getRepository
);

//Protected routes
router.post('/', protect, ...schemaValidator(contracts.repositories.create), validate(createRepositoryValidator), createRepository);
router.put(
    '/:username/:reponame',
    protect,
    ...schemaValidator(contracts.repositories.update),
    validate(repoParamValidator),
    resolveRepositoryContext,
    validate(updateRepositoryValidator),
    updateRepository
);
router.delete(
    '/:username/:reponame',
    protect,
    ...schemaValidator(contracts.repositories.remove),
    validate(repoParamValidator),
    resolveRepositoryContext,
    deleteRepository
);
router.post(
    '/:username/:reponame/star',
    protect,
    ...schemaValidator(contracts.repositories.star),
    validate(repoParamValidator),
    resolveRepositoryContext,
    starRepository
);
router.post(
    '/:username/:reponame/fork',
    protect,
    ...schemaValidator(contracts.repositories.fork),
    validate(repoParamValidator),
    resolveRepositoryContext,
    forkRepository
);

export default router;
