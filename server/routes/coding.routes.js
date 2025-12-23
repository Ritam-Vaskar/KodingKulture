import express from 'express';
import {
  getCodingProblemsByContest,
  getCodingProblemById,
  createCodingProblem,
  updateCodingProblem,
  deleteCodingProblem
} from '../controllers/coding.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/contest/:contestId', protect, getCodingProblemsByContest);
router.get('/:id', protect, getCodingProblemById);
router.post('/', protect, adminOnly, createCodingProblem);
router.put('/:id', protect, adminOnly, updateCodingProblem);
router.delete('/:id', protect, adminOnly, deleteCodingProblem);

export default router;
