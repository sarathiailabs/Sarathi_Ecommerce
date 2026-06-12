import express from 'express';
import couponController from '../controllers/couponController.js';
import { get_current_user, get_current_admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', express.json(), get_current_admin, couponController.createCoupon);
router.get('/', get_current_admin, couponController.listCoupons);
router.post('/validate', express.json(), get_current_user, couponController.validateCoupon);
router.put('/:coupon_id', express.json(), get_current_admin, couponController.updateCoupon);
router.delete('/:coupon_id', get_current_admin, couponController.deleteCoupon);

export default router;
