import express from 'express';
import {
  getMCQsByContest,
  submitMCQAnswers,
  createMCQ,
  updateMCQ,
  deleteMCQ
} from '../controllers/mcq.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/contest/:contestId', protect, getMCQsByContest);
router.post('/submit', protect, submitMCQAnswers);
router.post('/', protect, adminOnly, createMCQ);
router.put('/:id', protect, adminOnly, updateMCQ);
router.delete('/:id', protect, adminOnly, deleteMCQ);

export default router;
