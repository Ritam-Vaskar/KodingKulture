import express from 'express';
import {
  submitCode,
  getSubmissionsByProblem,
  getSubmissionById
} from '../controllers/submission.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, submitCode);
router.get('/problem/:problemId', protect, getSubmissionsByProblem);
router.get('/:id', protect, getSubmissionById);

export default router;
