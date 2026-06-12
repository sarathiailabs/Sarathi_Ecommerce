import express from 'express';
import aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', express.json(), aiController.chat);

export default router;
