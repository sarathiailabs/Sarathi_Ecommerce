import express from 'express';
import orderController from '../controllers/orderController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.post('/', express.json(), get_current_user, orderController.checkout);
router.get('/', get_current_user, orderController.getOrderHistory);
router.get('/:order_id', get_current_user, orderController.getOrderById);
router.post('/:order_id/cancel', express.json(), get_current_user, orderController.cancelOrder);

export default router;
