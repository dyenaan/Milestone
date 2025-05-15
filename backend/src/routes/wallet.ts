import express from 'express';
import {
    getWalletJobs,
    getWalletMilestones,
    getWalletTransactions,
    processMilestonePayment,
    linkWalletToUser
} from '../controllers/wallet';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Public routes - accessible with just wallet address
router.get('/jobs/:walletAddress', getWalletJobs);
router.get('/milestones/:walletAddress', getWalletMilestones);
router.get('/transactions/:walletAddress', getWalletTransactions);

// Protected routes - require authentication
router.post('/link', authenticateJWT, linkWalletToUser);
router.post('/payment/milestone/:milestoneId', authenticateJWT, processMilestonePayment);

export default router; 