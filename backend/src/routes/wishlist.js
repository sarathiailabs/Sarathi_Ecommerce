import express from 'express';
import wishlistController from '../controllers/wishlistController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.post('/', express.json(), get_current_user, wishlistController.addToWishlist);
router.get('/', get_current_user, wishlistController.getWishlist);
router.delete('/:product_id', get_current_user, wishlistController.removeFromWishlist);
router.get('/check/:product_id', get_current_user, wishlistController.checkInWishlist);
router.delete('/', get_current_user, wishlistController.clearWishlist);

export default router;
