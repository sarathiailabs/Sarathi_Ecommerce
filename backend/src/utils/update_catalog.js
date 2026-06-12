import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CURATED_PRODUCTS = [
  // 9 Electronics
  {
    name: 'MacBook Pro 16-inch M3 Max',
    description: 'The ultimate professional laptop. Features a 16-core CPU, 40-core GPU, 48GB of unified memory, and a stunning Liquid Retina XDR display with up to 22 hours of battery life.',
    price: 249999.00,
    original_price: 269999.00,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=800&q=80',
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.9,
    review_count: 84,
    is_featured: true
  },
  {
    name: 'iPhone 15 Pro Max',
    description: 'Forged in titanium, featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom.',
    price: 159900.00,
    original_price: 159900.00,
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.8,
    review_count: 142,
    is_featured: true
  },
  {
    name: 'iPad Pro 12.9-inch (M2)',
    description: 'Stunning Liquid Retina XDR display, M2 chip for astonishing performance, superfast wireless, and compatibility with Apple Pencil (2nd gen) and Magic Keyboard.',
    price: 119900.00,
    original_price: 124900.00,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.7,
    review_count: 65,
    is_featured: false
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with dual processors, eight microphones, exceptional call quality, and up to 30 hours of battery life with quick charging.',
    price: 29990.00,
    original_price: 34990.00,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    brand: 'Sony',
    rating: 4.8,
    review_count: 312,
    is_featured: true
  },
  {
    name: 'Samsung Galaxy Watch 6 Classic',
    description: 'Classic rotating bezel design meets smart health tracking. Monitor heart rate, sleep cycles, skeletal muscle, and body water directly from your wrist.',
    price: 36999.00,
    original_price: 43999.00,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    category: 'Electronics',
    brand: 'Samsung',
    rating: 4.5,
    review_count: 89,
    is_featured: false
  },
  {
    name: 'LG UltraGear 34-inch Curved Monitor',
    description: 'Immersive QHD (3440 x 1440) nano IPS display with a lightning-fast 160Hz refresh rate and 1ms response time for professional gaming and productivity.',
    price: 72000.00,
    original_price: 85000.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    category: 'Electronics',
    brand: 'LG',
    rating: 4.6,
    review_count: 57,
    is_featured: false
  },
  {
    name: 'Logitech MX Mechanical Keyboard',
    description: 'Low-profile mechanical keyboard offering outstanding feel, precision, and performance. Quiet tactile keys with smart backlighting and multi-device pairing.',
    price: 19995.00,
    original_price: 19995.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1587829191301-51231bcc1da5?w=800&q=80',
    category: 'Electronics',
    brand: 'Logitech',
    rating: 4.7,
    review_count: 110,
    is_featured: false
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Ergonomic mouse featuring an 8,000 DPI sensor that tracks on glass, ultra-quiet clicks, and the hyper-fast MagSpeed scrolling wheel.',
    price: 10995.00,
    original_price: 11995.00,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    category: 'Electronics',
    brand: 'Logitech',
    rating: 4.8,
    review_count: 245,
    is_featured: false
  },
  {
    name: 'Sony Alpha 7 IV Mirrorless Camera',
    description: 'Full-frame mirrorless camera with a 33MP sensor, advanced real-time autofocus, 4K 60p video recording, and exceptional low-light capabilities.',
    price: 218990.00,
    original_price: 242990.00,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    category: 'Electronics',
    brand: 'Sony',
    rating: 4.9,
    review_count: 38,
    is_featured: true
  },

  // 9 Fashion
  {
    name: 'Premium White Cotton T-Shirt',
    description: 'Crafted from 100% organic long-staple cotton. Extremely soft, breathable, and pre-shrunk for a perfect classic fit that lasts.',
    price: 1499.00,
    original_price: 1999.00,
    stock: 150,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    category: 'Fashion',
    brand: 'Zara',
    rating: 4.4,
    review_count: 220,
    is_featured: false
  },
  {
    name: 'Nike Air Max 90 Sneakers',
    description: 'A timeless classic featuring iconic Max Air cushioning in the heel, premium leather overlays, and a waffle outsole for grip and durability.',
    price: 11895.00,
    original_price: 12995.00,
    stock: 90,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    category: 'Fashion',
    brand: 'Nike',
    rating: 4.7,
    review_count: 512,
    is_featured: true
  },
  {
    name: 'Classic Saffiano Leather Handbag',
    description: 'Elegant structuring in textured Saffiano leather. Features double handles, a removable crossbody strap, and organized interior compartments.',
    price: 18900.00,
    original_price: 24500.00,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    category: 'Fashion',
    brand: 'Prada',
    rating: 4.8,
    review_count: 43,
    is_featured: true
  },
  {
    name: 'Ray-Ban Wayfarer Classic Sunglasses',
    description: 'The most recognizable style in the history of sunglasses. Features durable acetate frames and green classic G-15 polarized lenses with 100% UV protection.',
    price: 9890.00,
    original_price: 10990.00,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    category: 'Fashion',
    brand: 'Ray-Ban',
    rating: 4.6,
    review_count: 178,
    is_featured: false
  },
  {
    name: 'Fossil Townsman Automatic Watch',
    description: 'Stunning mechanical watch showcasing its inner workings through a skeleton dial. Features a stainless steel case and rich brown leather strap.',
    price: 16495.00,
    original_price: 18495.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    category: 'Fashion',
    brand: 'Fossil',
    rating: 4.5,
    review_count: 67,
    is_featured: false
  },
  {
    name: 'Genuine Biker Leather Jacket',
    description: 'Classic asymmetrical zip front biker jacket crafted from premium sheepskin leather. Heavy metal hardware and quilted lining for cool weather warmth.',
    price: 24990.00,
    original_price: 29990.00,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    category: 'Fashion',
    brand: 'Diesel',
    rating: 4.7,
    review_count: 54,
    is_featured: true
  },
  {
    name: 'Levi 511 Slim Fit Jeans',
    description: 'A modern slim with room to move. Cut close to the body, the 511 Slim is a great alternative to the skinny jean. Premium stretch denim.',
    price: 4599.00,
    original_price: 5299.00,
    stock: 110,
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    category: 'Fashion',
    brand: 'Levi',
    rating: 4.4,
    review_count: 310,
    is_featured: false
  },
  {
    name: 'Flowing Satin Evening Dress',
    description: 'A gorgeous gown featuring a cowl neckline, adjustable crossover straps, and a thigh-high side slit. Soft drape satin fabric for a luxurious look.',
    price: 8999.00,
    original_price: 11999.00,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    category: 'Fashion',
    brand: 'H&M',
    rating: 4.6,
    review_count: 28,
    is_featured: false
  },
  {
    name: 'Italian Calfskin Leather Belt',
    description: 'Made in Italy from vegetable-tanned calfskin leather. Hand-stitched details and a polished solid brass buckle.',
    price: 2999.00,
    original_price: 3999.00,
    stock: 85,
    image_url: 'https://images.unsplash.com/photo-1624222247344-550fb8ee4582?w=800&q=80',
    category: 'Fashion',
    brand: 'Tommy Hilfiger',
    rating: 4.5,
    review_count: 92,
    is_featured: false
  },

  // 9 Home & Kitchen
  {
    name: 'Stainless Steel Cookware Set (10-Piece)',
    description: 'Professional-grade stainless steel pots and pans with aluminum-core bases for fast, even heating. Includes lids, skillets, and saucepans.',
    price: 14999.00,
    original_price: 19999.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Meyer',
    rating: 4.7,
    review_count: 140,
    is_featured: true
  },
  {
    name: 'Ergonomic Office Chair with Lumbar Support',
    description: 'High-back mesh chair featuring dynamic lumbar support, 3D adjustable armrests, tilt-lock mechanism, and silent rolling casters.',
    price: 17500.00,
    original_price: 22000.00,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Featherlite',
    rating: 4.6,
    review_count: 185,
    is_featured: true
  },
  {
    name: 'Philips High-Speed Bullet Blender',
    description: 'Supercharged 1000W motor breaks down fruits, vegetables, and ice effortlessly. Includes to-go cups and leak-proof travel lids.',
    price: 5999.00,
    original_price: 7999.00,
    stock: 75,
    image_url: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Philips',
    rating: 4.5,
    review_count: 245,
    is_featured: false
  },
  {
    name: 'Delonghi Espresso Coffee Maker',
    description: 'Bring the cafe home. 15-bar professional pressure pump brews rich espresso, and the adjustable manual milk frother creates creamy lattes.',
    price: 24990.00,
    original_price: 29990.00,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Delonghi',
    rating: 4.8,
    review_count: 98,
    is_featured: true
  },
  {
    name: 'Glass Food Storage Containers (Set of 8)',
    description: 'Eco-friendly borosilicate glass containers with leak-proof, airtight locking lids. Oven, microwave, freezer, and dishwasher safe.',
    price: 2499.00,
    original_price: 3499.00,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Treo',
    rating: 4.6,
    review_count: 156,
    is_featured: false
  },
  {
    name: 'Vacuum Insulated Stainless Steel Bottle',
    description: 'Double-wall vacuum insulation keeps beverages ice-cold for up to 24 hours or steaming hot for 12 hours. Made of food-grade 18/8 steel.',
    price: 1899.00,
    original_price: 2499.00,
    stock: 200,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Milton',
    rating: 4.5,
    review_count: 312,
    is_featured: false
  },
  {
    name: 'Morphy Richards 2-Slice Toaster',
    description: 'Retro style meets modern efficiency. Featuring extra-wide slots, variable browning control, defrost/reheat functions, and a removable crumb tray.',
    price: 3299.00,
    original_price: 4499.00,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1627918596660-64ad935c179c?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Morphy Richards',
    rating: 4.3,
    review_count: 73,
    is_featured: false
  },
  {
    name: 'Wusthof Chef Knife Set (3-Piece)',
    description: 'Precision forged from a single piece of high-carbon stainless steel. Includes a Chef knife, Utility knife, and Paring knife.',
    price: 18500.00,
    original_price: 21000.00,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'Wusthof',
    rating: 4.9,
    review_count: 47,
    is_featured: false
  },
  {
    name: 'Ceramic Dinnerware Set (16-Piece)',
    description: 'Beautiful handmade ceramic dinnerware set, service for 4. Includes dinner plates, salad plates, bowls, and mugs in a speckle glaze finish.',
    price: 6999.00,
    original_price: 8999.00,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=80',
    category: 'Home & Kitchen',
    brand: 'FabIndia',
    rating: 4.6,
    review_count: 61,
    is_featured: false
  },

  // 8 Sports & Fitness
  {
    name: 'Decathlon Hex Dumbbell Set (10kg Pair)',
    description: 'Solid cast iron dumbbells encased in high-grade rubber to protect floors and reduce noise. Ergononmic chrome contoured handle for secure grip.',
    price: 3999.00,
    original_price: 4999.00,
    stock: 65,
    image_url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'Decathlon',
    rating: 4.8,
    review_count: 184,
    is_featured: true
  },
  {
    name: 'Premium Eco-Friendly Yoga Mat',
    description: '6mm thick dual-sided non-slip TPE mat. Provides optimal cushioning for joints, is sweat-resistant, and comes with a carrying strap.',
    price: 2499.00,
    original_price: 3499.00,
    stock: 110,
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'YogaPro',
    rating: 4.6,
    review_count: 125,
    is_featured: false
  },
  {
    name: 'Heavy Duty Resistance Bands Loop Set',
    description: 'Set of 5 premium latex loop bands with varying resistance levels. Perfect for home strength training, physical therapy, and warmups.',
    price: 1299.00,
    original_price: 1999.00,
    stock: 140,
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'FitBand',
    rating: 4.5,
    review_count: 240,
    is_featured: false
  },
  {
    name: 'PowerRun Motorized Home Treadmill',
    description: 'Sleek folding treadmill with a 2.5 HP quiet motor. Features a multi-layered running belt, LCD display tracker, and pre-set fitness programs.',
    price: 34999.00,
    original_price: 44999.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1578762560072-46cf124c2ed2?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'PowerRun',
    rating: 4.7,
    review_count: 36,
    is_featured: true
  },
  {
    name: 'Ergonomic Push-Up Bars',
    description: 'Sturdy steel push-up handles covered with non-slip foam grips. Specially designed to reduce wrist strain and maximize chest workouts.',
    price: 1199.00,
    original_price: 1799.00,
    stock: 130,
    image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'IronGrip',
    rating: 4.4,
    review_count: 89,
    is_featured: false
  },
  {
    name: 'Smart Leak-Proof Protein Shaker',
    description: '700ml shaker bottle with a stainless steel whisk ball, dry powder storage compartment, and pill separator capsule.',
    price: 899.00,
    original_price: 1299.00,
    stock: 160,
    image_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'Cyclone',
    rating: 4.3,
    review_count: 154,
    is_featured: false
  },
  {
    name: 'Under Armour Gym Duffel Bag',
    description: 'Spacious water-resistant duffel featuring a large ventilated pocket for laundry or dirty shoes, and padded shoulder strap.',
    price: 3499.00,
    original_price: 4499.00,
    stock: 75,
    image_url: 'https://images.unsplash.com/photo-1553453861-90ac742371f7?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'Under Armour',
    rating: 4.7,
    review_count: 95,
    is_featured: false
  },
  {
    name: 'Fitbit Charge 6 Fitness Tracker',
    description: 'Advanced activity band with built-in GPS, active zone minutes, 24/7 heart rate tracker, sleep score analytics, and 7-day battery life.',
    price: 14999.00,
    original_price: 16999.00,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1609290290569-33e8b1376b57?w=800&q=80',
    category: 'Sports & Fitness',
    brand: 'Fitbit',
    rating: 4.6,
    review_count: 112,
    is_featured: false
  },

  // 8 Beauty
  {
    name: 'CeraVe Moisturizing Face Cream',
    description: 'Developed with dermatologists, this non-greasy moisturizer provides 24-hour hydration with three essential ceramides and hyaluronic acid.',
    price: 1250.00,
    original_price: 1450.00,
    stock: 180,
    image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
    category: 'Beauty',
    brand: 'CeraVe',
    rating: 4.8,
    review_count: 420,
    is_featured: true
  },
  {
    name: 'MAC Studio Fix Fluid Foundation',
    description: 'An oil-controlling medium-to-full buildable coverage foundation that delivers a natural matte finish with SPF 15 protection.',
    price: 3600.00,
    original_price: 3900.00,
    stock: 90,
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    category: 'Beauty',
    brand: 'MAC',
    rating: 4.7,
    review_count: 185,
    is_featured: false
  },
  {
    name: 'Bleu de Chanel Eau de Parfum',
    description: 'An aromatic-woody fragrance for men that teams New Caledonian sandalwood with notes of ambery cedar and tonka bean.',
    price: 12500.00,
    original_price: 12500.00,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    category: 'Beauty',
    brand: 'Chanel',
    rating: 4.9,
    review_count: 240,
    is_featured: true
  },
  {
    name: 'L\'Oreal Professional Shampoo & Conditioner',
    description: 'Expert care series designed for damaged hair. Enriched with golden quinoa protein to instantly resurface, restore, and add brilliant shine.',
    price: 1850.00,
    original_price: 2200.00,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80',
    category: 'Beauty',
    brand: 'L\'Oreal',
    rating: 4.5,
    review_count: 310,
    is_featured: false
  },
  {
    name: 'The Ordinary Hyaluronic Acid Serum',
    description: 'A hydration support formula with ultra-pure vegan hyaluronic acid. Plumps skin, smooths fine lines, and restores elasticity.',
    price: 750.00,
    original_price: 900.00,
    stock: 250,
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    category: 'Beauty',
    brand: 'The Ordinary',
    rating: 4.6,
    review_count: 512,
    is_featured: false
  },
  {
    name: 'Natural Jade Facial Roller & Gua Sha',
    description: 'Dual-sided 100% natural jade stone roller to relieve muscle tension, reduce facial puffiness, and aid serum absorption.',
    price: 999.00,
    original_price: 1599.00,
    stock: 150,
    image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80',
    category: 'Beauty',
    brand: 'EcoTools',
    rating: 4.4,
    review_count: 87,
    is_featured: false
  },
  {
    name: 'Premium Makeup Brush Set (15-Piece)',
    description: 'High-density synthetic fiber bristles that are soft, silky, and do not shed. Includes brushes for foundation, eyeshadow, blending, and lining.',
    price: 2499.00,
    original_price: 3499.00,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    category: 'Beauty',
    brand: 'Anastasia',
    rating: 4.6,
    review_count: 110,
    is_featured: false
  },
  {
    name: 'Dior Rouge Lipstick - Velvet 999',
    description: 'The iconic Dior red lipstick in a long-wear velvet finish, enriched with red peony and pomegranate flower extracts for lip comfort.',
    price: 3950.00,
    original_price: 3950.00,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    category: 'Beauty',
    brand: 'Dior',
    rating: 4.8,
    review_count: 145,
    is_featured: true
  },

  // 8 Books
  {
    name: 'The Great Gatsby',
    description: 'F. Scott Fitzgerald\'s landmark novel capturing the disillusionment and decadence of the Jazz Age. A brilliant portrait of the American Dream.',
    price: 299.00,
    original_price: 399.00,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    category: 'Books',
    brand: 'Penguin Classics',
    rating: 4.7,
    review_count: 320,
    is_featured: true
  },
  {
    name: 'A Brief History of Time',
    description: 'Stephen Hawking\'s classic bestseller exploring the origins and ultimate fate of our universe, black holes, and the nature of space and time.',
    price: 499.00,
    original_price: 599.00,
    stock: 75,
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    category: 'Books',
    brand: 'Bantam Books',
    rating: 4.8,
    review_count: 410,
    is_featured: false
  },
  {
    name: 'Atomic Habits',
    description: 'James Clear\'s definitive guide on building good habits, breaking bad ones, and getting 1% better every day through tiny behavioral changes.',
    price: 550.00,
    original_price: 799.00,
    stock: 250,
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    category: 'Books',
    brand: 'Avery',
    rating: 4.9,
    review_count: 1250,
    is_featured: true
  },
  {
    name: 'The Joy of Cooking',
    description: 'The ultimate culinary bible. Packed with thousands of reliable recipes, cooking techniques, and ingredients profiles for home cooks.',
    price: 1299.00,
    original_price: 1899.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80',
    category: 'Books',
    brand: 'Scribner',
    rating: 4.6,
    review_count: 180,
    is_featured: false
  },
  {
    name: 'Steve Jobs',
    description: 'Walter Isaacson\'s exclusive biography of the creative pioneer who revolutionized the worlds of personal computers, animated movies, music, and phones.',
    price: 699.00,
    original_price: 899.00,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    category: 'Books',
    brand: 'Simon & Schuster',
    rating: 4.8,
    review_count: 295,
    is_featured: false
  },
  {
    name: 'Dune (Deluxe Edition)',
    description: 'Frank Herbert\'s epic science fiction masterpiece set on the desert planet Arrakis. A story of political intrigue, mysticism, and ecology.',
    price: 899.00,
    original_price: 1199.00,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=800&q=80',
    category: 'Books',
    brand: 'Ace Books',
    rating: 4.8,
    review_count: 340,
    is_featured: true
  },
  {
    name: 'Sapiens: A Brief History of Humankind',
    description: 'Yuval Noah Harari explores how biology and history have defined us and enhanced our understanding of what it means to be human.',
    price: 450.00,
    original_price: 599.00,
    stock: 110,
    image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
    category: 'Books',
    brand: 'Harari',
    rating: 4.7,
    review_count: 812,
    is_featured: false
  },
  {
    name: 'Alice in Wonderland (Illustrated)',
    description: 'Lewis Carroll\'s classic children\'s story beautifully illustrated. Follow Alice down the rabbit hole into a whimsical fantasy world.',
    price: 399.00,
    original_price: 499.00,
    stock: 95,
    image_url: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&q=80',
    category: 'Books',
    brand: 'HarperCollins',
    rating: 4.6,
    review_count: 114,
    is_featured: false
  }
];

async function main() {
  console.log('Fetching database products...');
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('id')
    .order('id');

  if (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }

  console.log(`Fetched ${dbProducts.length} database products.`);
  console.log(`Curated products count: ${CURATED_PRODUCTS.length}`);

  if (dbProducts.length !== CURATED_PRODUCTS.length) {
    console.warn('Warning: Database products count does not match curated products count. Aligning as many as possible.');
  }

  const limit = Math.min(dbProducts.length, CURATED_PRODUCTS.length);
  for (let i = 0; i < limit; i++) {
    const dbId = dbProducts[i].id;
    const newData = CURATED_PRODUCTS[i];
    
    console.log(`[${i + 1}/${limit}] Updating product ID: ${dbId} -> "${newData.name}" (${newData.category})`);
    
    const { error: updateError } = await supabase
      .from('products')
      .update({
        name: newData.name,
        description: newData.description,
        price: newData.price,
        original_price: newData.original_price,
        stock: newData.stock,
        image_url: newData.image_url,
        images: null,
        category: newData.category,
        brand: newData.brand,
        rating: newData.rating,
        review_count: newData.review_count,
        is_featured: newData.is_featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbId);

    if (updateError) {
      console.error(`Error updating product ${dbId}:`, updateError);
    }
  }

  console.log('Update complete!');
}

main();
