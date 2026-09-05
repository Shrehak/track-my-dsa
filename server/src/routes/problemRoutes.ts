import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  reviewProblem,
  createProblemSchema,
  updateProblemSchema,
  reviewProblemSchema,
} from '../controllers/problemController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// All problem routes are protected
router.use(authenticate);

router.get('/', getProblems);
router.post('/', validate(createProblemSchema), createProblem);
router.get('/:id', getProblemById);
router.put('/:id', validate(updateProblemSchema), updateProblem);
router.delete('/:id', deleteProblem);
router.post('/:id/review', validate(reviewProblemSchema), reviewProblem);

export default router;
