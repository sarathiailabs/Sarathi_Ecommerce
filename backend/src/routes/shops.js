import express from 'express';
import shopController from '../controllers/shopController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.post('/', express.json(), get_current_user, shopController.openShop);
router.get('/my', get_current_user, shopController.getMyShops);
router.post('/:shop_id/products', express.json(), get_current_user, shopController.addProduct);

export default router;
