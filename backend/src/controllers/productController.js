import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const productController = {
  async listProducts(req, res, next) {
    try {
      const {
        q,
        category,
        brand,
        min_price,
        max_price,
        featured,
        in_stock,
        sort = 'newest',
        page = '1',
        limit = '100'
      } = req.query;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 100;

      // Start builder on products table where is_active is true
      let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // --- Search ---
      if (q) {
        const term = `%${q.toLowerCase()}%`;
        queryBuilder = queryBuilder.or(`name.ilike.${term},description.ilike.${term},brand.ilike.${term},category.ilike.${term}`);
      }

      // --- Filters ---
      if (category) {
        queryBuilder = queryBuilder.ilike('category', category);
      }

      if (brand) {
        queryBuilder = queryBuilder.ilike('brand', brand);
      }

      if (min_price !== undefined && min_price !== '') {
        queryBuilder = queryBuilder.gte('price', parseFloat(min_price));
      }

      if (max_price !== undefined && max_price !== '') {
        queryBuilder = queryBuilder.lte('price', parseFloat(max_price));
      }

      if (featured !== undefined) {
        const isFeatured = featured === 'true' || featured === true;
        queryBuilder = queryBuilder.eq('is_featured', isFeatured);
      }

      if (in_stock === 'true' || in_stock === true) {
        queryBuilder = queryBuilder.gt('stock', 0);
      }

      // --- Sorting ---
      const sortMap = {
        newest: { column: 'created_at', ascending: false },
        oldest: { column: 'created_at', ascending: true },
        price_asc: { column: 'price', ascending: true },
        price_desc: { column: 'price', ascending: false },
        rating: { column: 'rating', ascending: false },
        popular: { column: 'review_count', ascending: false }
      };

      const sorting = sortMap[sort] || sortMap.newest;
      queryBuilder = queryBuilder.order(sorting.column, { ascending: sorting.ascending });

      // --- Pagination ---
      const from = (pageNum - 1) * limitNum;
      const to = from + limitNum - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data: products, error } = await queryBuilder;

      if (error) {
        return next(new AppError(500, `Error loading products list: ${error.message}`));
      }

      res.status(200).json(products || []);
    } catch (error) {
      next(error);
    }
  },

  async getProduct(req, res, next) {
    try {
      const { product_id } = req.params;
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single();

      if (error || !product) {
        return next(new AppError(404, 'Product not found'));
      }

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }
};

export default productController;
