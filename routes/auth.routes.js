import { Router } from 'express';
import { signup, login, logout, me } from '../controllers/auth.controller.js';
import authenticate from '../src/components/middleware/authenticate.js';
import validate from '../src/components/middleware/validate.js';
import { signupValidator, loginValidator } from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', signupValidator, validate, signup);

// POST /api/auth/login
router.post('/login', loginValidator, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, me);

export default router;
