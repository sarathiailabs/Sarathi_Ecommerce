import express from 'express';
import reviewController from '../controllers/reviewController.js';
import { get_current_user } from '../middleware/auth.js';

const router = express.Router();

router.post('/:product_id', express.json(), get_current_user, reviewController.createReview);
router.get('/product/:product_id', reviewController.getProductReviews);
router.put('/:review_id', express.json(), get_current_user, reviewController.updateReview);
router.delete('/:review_id', get_current_user, reviewController.deleteReview);
router.post('/:review_id/helpful', get_current_user, reviewController.markHelpful);

export default router;
