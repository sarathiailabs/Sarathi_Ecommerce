import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:product_id', productController.getProduct);

export default router;
