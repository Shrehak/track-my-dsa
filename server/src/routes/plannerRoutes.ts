import { Router } from 'express';
import { generatePlan, completePlan, generatePlanSchema } from '../controllers/plannerController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.post('/generate', validate(generatePlanSchema), generatePlan);
router.post('/:planId/complete', completePlan);

export default router;
