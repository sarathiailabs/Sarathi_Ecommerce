import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const shopService = {
  async createShop(shopData, currentUser) {
    if (currentUser.role !== 'shop_owner' && !currentUser.is_admin) {
      throw new AppError(403, 'Only registered Shop Owners can open a shop.');
    }

    const shopId = uuidv4();
    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        id: shopId,
        owner_id: currentUser.id,
        name: shopData.name,
        description: shopData.description,
        logo_url: shopData.logo_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      throw new AppError(500, `Error opening shop: ${error.message}`);
    }

    return shop;
  },

  async addProductToShop(shopId, productData, currentUser) {
    // 1. Fetch shop details
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      throw new AppError(404, 'Shop not found.');
    }

    // 2. Verify shop ownership
    if (shop.owner_id !== currentUser.id && !currentUser.is_admin) {
      throw new AppError(403, 'You do not own this shop.');
    }

    // 3. Insert product
    const productId = uuidv4();
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        id: productId,
        shop_id: shopId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        stock: productData.stock,
        image_url: productData.image_url,
        images: productData.images,
        category: productData.category,
        subcategory: productData.subcategory,
        brand: productData.brand,
        sku: productData.sku,
        weight: productData.weight,
        dimensions: productData.dimensions,
        rating: 0.0,
        review_count: 0,
        is_featured: productData.is_featured || false,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (productError) {
      throw new AppError(500, `Error listing product to shop: ${productError.message}`);
    }

    return product;
  }
};

export default shopService;
