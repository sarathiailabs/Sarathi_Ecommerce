import express from 'express';
import deliveryController from '../controllers/deliveryController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.get('/unassigned', get_current_user, deliveryController.getUnassignedShipments);
router.get('/my', get_current_user, deliveryController.getClaimedShipments);
router.post('/:delivery_id/claim', get_current_user, deliveryController.claimShipment);
router.put('/:delivery_id/status', express.json(), get_current_user, deliveryController.updateShipmentStatus);

export default router;
