import express from 'express';
import {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  getMyContests
} from '../controllers/contest.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/', getAllContests);
router.get('/my-contests', protect, getMyContests);
router.get('/:id', getContestById);
router.post('/', protect, adminOnly, createContest);
router.put('/:id', protect, adminOnly, updateContest);
router.delete('/:id', protect, adminOnly, deleteContest);
router.post('/:id/register', protect, registerForContest);

export default router;
