import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { registerValidator, loginValidator } from '../validators/auth.validators.js';

const router = express.Router();

const toNumber = (value, fallback) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const authLimiter = rateLimit({
	windowMs: toNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
	max: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 10),
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			status: 'fail',
			message: 'Too many auth attempts, please try again later',
		});
	},
});

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.get('/me', protect, getMe);

export default router;
