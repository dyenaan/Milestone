import { Router } from 'express';
import * as authController from '../controllers/auth';

const router = Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/aptos', authController.loginWithAptos);
router.post('/aptos/google', authController.loginWithGoogleAptos);
router.post('/aptos/apple', authController.loginWithAppleAptos);

export default router; 