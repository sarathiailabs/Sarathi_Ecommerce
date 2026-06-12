import express from 'express';
import cartController from '../controllers/cartController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.get('/', get_current_user, cartController.getCart);
router.post('/items', express.json(), get_current_user, cartController.addOrUpdateCartItem);
router.delete('/items/:product_id', get_current_user, cartController.removeCartItem);

export default router;
