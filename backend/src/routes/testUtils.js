import express from 'express';
import testController from '../controllers/testController.js';

const router = express.Router();

router.post('/create-user', express.json(), testController.createTestUser);
router.post('/reset', testController.resetTestData);
router.get('/fixtures', testController.listFixtures);

export default router;
