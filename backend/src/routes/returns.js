import express from 'express';
import returnController from '../controllers/returnController.js';
import { get_current_user, get_current_admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', express.json(), get_current_user, returnController.createReturn);
router.get('/', get_current_user, returnController.getReturns);
router.get('/admin/all', get_current_admin, returnController.getAllReturns);
router.get('/:return_id', get_current_user, returnController.getReturn);
router.put('/:return_id/approve', get_current_admin, returnController.approveReturn);
router.put('/:return_id/reject', get_current_admin, returnController.rejectReturn);
router.put('/:return_id/refund', get_current_admin, returnController.processRefund);

export default router;
