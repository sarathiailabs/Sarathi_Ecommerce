import express from 'express';
import adminController from '../controllers/adminController.js';
import { get_current_admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/products', express.json(), get_current_admin, adminController.createProduct);
router.put('/products/:product_id', express.json(), get_current_admin, adminController.updateProduct);
router.delete('/products/:product_id', get_current_admin, adminController.deleteProduct);
router.get('/orders', get_current_admin, adminController.getAllOrders);
router.put('/orders/:order_id/status', express.json(), get_current_admin, adminController.updateOrderStatus);

export default router;
