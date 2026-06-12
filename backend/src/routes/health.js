import express from 'express';
import healthController from '../controllers/healthController.js';

const router = express.Router();

router.get('/', healthController.getHealth);
router.get('/detailed', healthController.getHealthDetailed);
router.get('/ready', healthController.getReady);

export default router;
