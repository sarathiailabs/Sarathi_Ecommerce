import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data: products } = await supabase.from('products').select('id, name, category');
  const { data: reviews } = await supabase.from('reviews').select('product_id');
  const { data: orderItems } = await supabase.from('order_items').select('product_id');
  const { data: carts } = await supabase.from('carts').select('product_id');
  const { data: wishlists } = await supabase.from('wishlists').select('product_id');

  console.log(`Products: ${products?.length || 0}`);
  console.log(`Reviews: ${reviews?.length || 0}`);
  console.log(`Order Items: ${orderItems?.length || 0}`);
  console.log(`Carts: ${carts?.length || 0}`);
  console.log(`Wishlists: ${wishlists?.length || 0}`);

  const prodUsage = {};
  products.forEach(p => {
    prodUsage[p.id] = { name: p.name, category: p.category, reviews: 0, orderItems: 0, carts: 0, wishlists: 0 };
  });

  reviews?.forEach(r => { if (prodUsage[r.product_id]) prodUsage[r.product_id].reviews++; });
  orderItems?.forEach(oi => { if (prodUsage[oi.product_id]) prodUsage[oi.product_id].orderItems++; });
  carts?.forEach(c => { if (prodUsage[c.product_id]) prodUsage[c.product_id].carts++; });
  wishlists?.forEach(w => { if (prodUsage[w.product_id]) prodUsage[w.product_id].wishlists++; });

  console.log('\nProduct Usage Summary:');
  Object.keys(prodUsage).forEach(id => {
    const u = prodUsage[id];
    if (u.reviews > 0 || u.orderItems > 0 || u.carts > 0 || u.wishlists > 0) {
      console.log(`Product ID: ${id} | Name: ${u.name} | Cat: ${u.category} | R: ${u.reviews}, OI: ${u.orderItems}, C: ${u.carts}, W: ${u.wishlists}`);
    }
  });
}

main();
