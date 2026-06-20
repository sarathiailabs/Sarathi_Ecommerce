/**
 * Migration Script: Populate `specifications` JSONB column for existing products.
 *
 * This script reads every product from the database, generates category-specific
 * specifications from its existing fields (name, category, brand, weight, dimensions),
 * and writes them back to the `specifications` column.
 *
 * Prerequisites:
 *   1. Run this SQL in Supabase dashboard first:
 *      ALTER TABLE products ADD COLUMN specifications jsonb DEFAULT '[]'::jsonb;
 *
 *   2. Run this script once:
 *      node src/utils/migrateSpecs.js
 *
 * This is a non-destructive migration — it only updates the `specifications` column
 * and leaves all other product data unchanged.
 */

import supabase from '../db/supabase.js';

// Specification Generator
function generateSpecifications(product) {
  const specs = [];
  const category = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const brandVal = product.brand || 'N/A';
  const weightVal = product.weight ? `${product.weight} kg` : 'N/A';
  const dimVal = product.dimensions || 'N/A';

  // 1. Grocery
  if (category.includes('grocery')) {
    const isTea = name.includes('tea') || name.includes('tulsi');
    if (isTea) {
      specs.push({ key: 'Ingredients', value: name.includes('green') ? 'Certified Organic Green Tea Leaves, Rama Tulsi, Krishna Tulsi, Vana Tulsi' : 'Assam Black Tea Leaves, 15% Long Leaves' });
      specs.push({ key: 'Net Quantity', value: name.includes('1kg') ? '1 kg' : '25 Tea Bags (50g)' });
      specs.push({ key: 'Flavor', value: name.includes('green') ? 'Classic Green Tea & Holy Basil (Tulsi)' : 'Rich & Aromatic Black Tea' });
      specs.push({ key: 'Storage Instructions', value: 'Store in a cool, dry place in an airtight container away from strong odors.' });
      specs.push({ key: 'Shelf Life', value: '12 Months from packaging date' });
      specs.push({ key: 'Brand', value: brandVal });
    } else {
      specs.push({ key: 'Weight', value: name.includes('500g') ? '500g' : name.includes('110g') ? '110g' : weightVal });
      specs.push({ key: 'Ingredients', value: name.includes('almond') ? '100% Raw Premium California Almonds' : 'Dehydrated Potatoes, Vegetable Oil, Corn Flour, Wheat Starch, Sour Cream & Onion Seasonings' });
      specs.push({ key: 'Package Type', value: 'Pouch / Sealed Canister' });
      specs.push({ key: 'Brand', value: brandVal });
    }
  }
  // 2. Electronics
  else if (category.includes('electronics')) {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Connectivity', value: name.includes('watch') ? 'Bluetooth, Wi-Fi, NFC, GPS' : name.includes('headphone') || name.includes('airpods') ? 'Bluetooth 5.3, Wireless' : '5G, Wi-Fi 7, Bluetooth 5.3, USB-C' });
    specs.push({ key: 'Battery Life', value: name.includes('watch') ? 'Up to 18 hours' : name.includes('headphone') ? 'Up to 30 hours' : name.includes('airpods') ? 'Up to 6 hours (24h with case)' : 'Up to 22 hours' });
    specs.push({ key: 'Warranty', value: '1 Year Manufacturer Warranty' });
    specs.push({ key: 'Dimensions', value: dimVal });
    specs.push({ key: 'Weight', value: weightVal });
  }
  // 3. Fashion
  else if (category.includes('fashion') || category.includes('clothing')) {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Material', value: name.includes('jeans') ? '99% Cotton, 1% Elastane' : name.includes('polo') ? '100% Cotton Pique' : 'Premium Fabric' });
    specs.push({ key: 'Fit', value: name.includes('jeans') ? 'Slim Fit' : name.includes('polo') ? 'Regular Fit' : 'Standard Fit' });
    specs.push({ key: 'Care Instructions', value: 'Machine wash cold, tumble dry low' });
  }
  // 4. Books
  else if (category.includes('books')) {
    specs.push({ key: 'Author', value: name.includes('alchemist') ? 'Paulo Coelho' : name.includes('sapiens') ? 'Yuval Noah Harari' : name.includes('habits') ? 'James Clear' : 'CLRS' });
    specs.push({ key: 'Publisher', value: brandVal });
    specs.push({ key: 'Language', value: 'English' });
    specs.push({ key: 'Dimensions', value: dimVal });
    specs.push({ key: 'Weight', value: weightVal });
  }
  // 5. Home & Kitchen
  else if (category.includes('home') || category.includes('kitchen')) {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Warranty', value: '2 Year Brand Warranty' });
    specs.push({ key: 'Dimensions', value: dimVal });
    specs.push({ key: 'Weight', value: weightVal });
  }
  // 6. Beauty
  else if (category.includes('beauty')) {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Volume', value: name.includes('shampoo') ? '300 ml' : '30 ml' });
    specs.push({ key: 'Key Ingredients', value: name.includes('niacinamide') ? 'Niacinamide 10%, Zinc 1%' : name.includes('shampoo') ? 'Gold Quinoa, Wheat Protein' : 'Natural Actives' });
  }
  // 7. Sports & Fitness
  else if (category.includes('sports') || category.includes('fitness')) {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Dimensions', value: dimVal });
    specs.push({ key: 'Weight', value: weightVal });
    specs.push({ key: 'Warranty', value: '1 Year Brand Warranty' });
  }
  // 8. Office & Stationery / Office Supplies
  else if (category.includes('office') || category.includes('stationery')) {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Dimensions', value: dimVal });
    specs.push({ key: 'Weight', value: weightVal });
  }
  // Fallback
  else {
    specs.push({ key: 'Brand', value: brandVal });
    specs.push({ key: 'Weight', value: weightVal });
    specs.push({ key: 'Dimensions', value: dimVal });
    specs.push({ key: 'Warranty', value: '1 Year Brand Warranty' });
  }

  return specs;
}

async function runMigration() {
  console.log('Starting product specifications migration...');
  
  // 1. Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products to check.`);
  let updatedCount = 0;

  for (const product of products) {
    // Check if specifications is empty/null/default
    if (!product.specifications || !Array.isArray(product.specifications) || product.specifications.length === 0) {
      const generated = generateSpecifications(product);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ specifications: generated })
        .eq('id', product.id);

      if (updateError) {
        console.error(`Error updating product ${product.name} (ID: ${product.id}):`, updateError);
      } else {
        console.log(`Updated product: ${product.name}`);
        updatedCount++;
      }
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} products.`);
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Unexpected migration error:', err);
  process.exit(1);
});