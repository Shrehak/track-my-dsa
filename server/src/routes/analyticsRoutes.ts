import { Router } from 'express';
import {
  getDashboardStats,
  getWeakTopics,
  getRevisionBacklog,
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/weak-topics', getWeakTopics);
router.get('/backlog', getRevisionBacklog);

export default router;
