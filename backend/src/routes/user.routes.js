import express from 'express';
import { getUserProfile, updateProfile, followUser, unfollowUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { updateProfileValidator } from '../validators/user.validators.js';

const router = express.Router();

router.put('/profile', protect, validate(updateProfileValidator), updateProfile);
router.get('/:username', getUserProfile);
router.post('/:username/follow', protect, followUser);
router.delete('/:username/follow', protect, unfollowUser);

export default router;
