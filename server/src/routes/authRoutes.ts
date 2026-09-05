import { Router } from 'express';
import { register, login, demoLogin, getMe, registerSchema, loginSchema } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/demo', demoLogin);
router.get('/me', authenticate, getMe);

export default router;
