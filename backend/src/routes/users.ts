import { Router } from 'express';
import * as userController from '../controllers/users';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Users routes - all routes require authentication
router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, userController.updateProfile);

export default router; 