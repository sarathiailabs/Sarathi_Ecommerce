import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Total products fetched: ${products.length}`);
  
  const categoryCounts = {};
  for (const p of products) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }
  
  console.log('Categories count:', categoryCounts);
  
  fs.writeFileSync('products_dump.json', JSON.stringify(products, null, 2));
  console.log('Wrote products to products_dump.json');
}

main();
