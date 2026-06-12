import express from 'express';
import authController from '../controllers/authController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/token', express.urlencoded({ extended: true }), authController.loginToken);
router.post('/login', express.json(), authController.loginJson);
router.get('/me', get_current_user, authController.getMe);
router.put('/me', express.json(), get_current_user, authController.updateMe);
router.post('/change-password', express.json(), get_current_user, authController.changePassword);
router.post('/forgot-password', express.json(), authController.forgotPassword);
router.post('/reset-password', express.json(), authController.resetPassword);

export default router;
