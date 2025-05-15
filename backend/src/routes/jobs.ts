import { Router } from 'express';
import * as jobController from '../controllers/jobs';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Jobs routes
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);
router.post('/', authMiddleware, jobController.createJob);
router.patch('/:id', authMiddleware, jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

// Milestone routes
router.get('/:jobId/milestones', jobController.getMilestones);
router.post('/:jobId/milestones', authMiddleware, jobController.createMilestone);
router.patch('/milestones/:id', authMiddleware, jobController.updateMilestone);
router.delete('/milestones/:id', authMiddleware, jobController.deleteMilestone);

export default router; 