import shopService from '../services/shopService.js';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const shopController = {
  async openShop(req, res, next) {
    try {
      const { name, description, logo_url } = req.body;
      if (!name) {
        return next(new AppError(400, 'Shop name is required.'));
      }

      const shop = await shopService.createShop({
        name,
        description,
        logo_url
      }, req.user);

      res.status(201).json(shop);
    } catch (error) {
      next(error);
    }
  },

  async getMyShops(req, res, next) {
    try {
      const { data: shops, error } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', req.user.id);

      if (error) {
        return next(new AppError(500, `Error fetching shops: ${error.message}`));
      }

      res.status(200).json(shops || []);
    } catch (error) {
      next(error);
    }
  },

  async addProduct(req, res, next) {
    try {
      const { shop_id } = req.params;
      const {
        name,
        description,
        price,
        original_price,
        stock,
        image_url,
        images,
        category,
        subcategory,
        brand,
        sku,
        weight,
        dimensions,
        is_featured,
        is_active
      } = req.body;

      if (!name || !description || price === undefined || stock === undefined || !image_url || !category) {
        return next(new AppError(400, 'Name, description, price, stock, image_url, and category are required.'));
      }

      const product = await shopService.addProductToShop(shop_id, {
        name,
        description,
        price,
        original_price,
        stock,
        image_url,
        images,
        category,
        subcategory,
        brand,
        sku,
        weight,
        dimensions,
        is_featured,
        is_active
      }, req.user);

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }
};

export default shopController;
