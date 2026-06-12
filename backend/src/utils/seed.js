import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';

const ADMIN_USERS = [
  { email: 'admin@novacart.com', password: 'admin123', name: 'NovaCart Administrator' },
  { email: 'admin@example.com', password: 'AdminSecurePassword123!', name: 'System Administrator' }
];

const CUSTOMER_USERS = [
  { email: 'customer@novacart.com', password: 'customer123', name: 'Pratham User' },
  { email: 'john@novacart.com', password: 'john123', name: 'John Doe' },
  { email: 'jane@novacart.com', password: 'jane123', name: 'Jane Smith' },
  { email: 'alex@novacart.com', password: 'alex123', name: 'Alex Mercer' },
  { email: 'sara@novacart.com', password: 'sara123', name: 'Sara Williams' },
  { email: 'mike@novacart.com', password: 'mike123', name: 'Mike Johnson' },
  { email: 'seller@novacart.com', password: 'seller123', name: 'Seller Partner', role: 'shop_owner' },
  { email: 'delivery@novacart.com', password: 'delivery123', name: 'Logistics Partner', role: 'delivery_partner' }
];

const PRODUCTS = [
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

const REVIEW_TEXTS = [
  { comment: 'Amazing product! Exceeded my expectations.', rating: 5 },
  { comment: 'Great quality and fast shipping.', rating: 5 },
  { comment: 'Good value for the price.', rating: 4 },
  { comment: 'Works as described, very satisfied.', rating: 4 },
  { comment: 'Decent product but could be better.', rating: 3 },
  { comment: 'Not bad, but has some issues.', rating: 3 },
  { comment: 'Poor quality, disappointed.', rating: 2 },
  { comment: 'Exactly what I was looking for!', rating: 5 },
  { comment: 'Highly recommend!', rating: 5 },
  { comment: 'Good but a bit overpriced.', rating: 3 }
];

const ADDRESSES = [
  '123 Luxury Villa, Sector 45, Gurgaon, HR',
  'Apartment 4B, Skyview Towers, HSR Layout, Bangalore, KA',
  'Flat 102, Ocean Pearl Residency, Marine Drive, Mumbai, MH',
  'Green Meadows House, Jubilee Hills, Hyderabad, TS',
  'Villa 9, Palm Grove Estate, ECR, Chennai, TN'
];

const PHONES = [
  '+91 98765 43210',
  '+91 87654 32109',
  '+91 76543 21098',
  '+91 91234 56789',
  '+91 99887 76655'
];

const PAYMENT_METHODS = ['card', 'upi', 'netbanking'];
const STATUSES = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Pending'];

export async function seedData() {
  console.log('--- DATABASE SEEDING STARTED ---');

  // 1. Seed admin users
  const seededAdmins = [];
  for (const admin of ADMIN_USERS) {
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', admin.email)
      .maybeSingle();

    let userObj = existingAdmin;
    if (!existingAdmin) {
      console.log(`Seeding admin user: ${admin.email}...`);
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: uuidv4(),
          email: admin.email,
          full_name: admin.name,
          hashed_password: hashedPassword,
          is_admin: true,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (error) {
        console.error(`Error seeding admin: ${error.message}`);
      } else {
        userObj = newUser;
      }
    }
    if (userObj) seededAdmins.push(userObj);
  }

  // 2. Seed customers and partners
  const seededCustomers = [];
  for (const customer of CUSTOMER_USERS) {
    const { data: existingCust } = await supabase
      .from('users')
      .select('*')
      .eq('email', customer.email)
      .maybeSingle();

    let userObj = existingCust;
    if (!existingCust) {
      console.log(`Seeding user: ${customer.email}...`);
      const hashedPassword = await bcrypt.hash(customer.password, 10);
      
      const role = customer.role || 'customer';
      const phoneDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
      const postalDigits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
      const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: uuidv4(),
          email: customer.email,
          full_name: customer.name,
          hashed_password: hashedPassword,
          is_admin: role === 'admin',
          role: role,
          phone: `+91 ${phoneDigits}`,
          address: `${Math.floor(Math.random() * 900) + 100} Main Street`,
          city: cities[Math.floor(Math.random() * cities.length)],
          country: 'India',
          postal_code: postalDigits,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error(`Error seeding user: ${error.message}`);
      } else {
        userObj = newUser;
      }
    }
    
    if (userObj && (userObj.role === 'customer')) {
      seededCustomers.push(userObj);
    }
  }

  // 3. Seed products
  const { data: existingProducts } = await supabase
    .from('products')
    .select('*');

  const seededProducts = [];
  if (!existingProducts || existingProducts.length === 0) {
    console.log(`Seeding products catalog (${PRODUCTS.length} products)...`);
    for (const product of PRODUCTS) {
      const productId = uuidv4();
      const { data: newProd, error } = await supabase
        .from('products')
        .insert({
          id: productId,
          name: product.name,
          description: product.description,
          price: product.price,
          original_price: product.original_price || null,
          stock: product.stock,
          image_url: product.image_url,
          category: product.category,
          brand: product.brand || null,
          rating: product.rating || 0.0,
          review_count: product.review_count || 0,
          is_featured: product.is_featured || false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error(`Error seeding product ${product.name}: ${error.message}`);
      } else {
        seededProducts.push(newProd);
      }
    }
    console.log(`Seeded ${seededProducts.length} products.`);
  } else {
    console.log('Products already exist in the database.');
    seededProducts.push(...existingProducts);
  }

  // 4. Seed reviews
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('id')
    .limit(1);

  if (seededCustomers.length > 0 && seededProducts.length > 0 && (!existingReviews || existingReviews.length === 0)) {
    console.log('Adding sample product reviews...');
    for (const product of seededProducts.slice(0, 10)) {
      const numReviews = Math.floor(Math.random() * 4) + 2; // 2 to 5 reviews
      
      // Shuffle customers so a customer doesn't review same product twice
      const shuffledCust = [...seededCustomers].sort(() => 0.5 - Math.random());
      
      for (let r = 0; r < Math.min(numReviews, shuffledCust.length); r++) {
        const reviewText = REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)];
        await supabase
          .from('reviews')
          .insert({
            id: uuidv4(),
            product_id: product.id,
            user_id: shuffledCust[r].id,
            rating: reviewText.rating,
            title: `Review: ${product.name}`,
            comment: reviewText.comment,
            verified_purchase: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    }
  }

  // 5. Seed historical orders (truncating previous ones)
  await supabase.from('order_items').delete().neq('id', 'none');
  await supabase.from('orders').delete().neq('id', 'none');

  if (seededCustomers.length > 0 && seededProducts.length > 0) {
    console.log('Seeding mock historical order data...');
    let ordersCreated = 0;
    
    for (let i = 0; i < 60; i++) {
      const daysAgo = Math.floor(Math.random() * 31);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(orderDate.getHours() - hoursAgo);
      orderDate.setMinutes(orderDate.getMinutes() - minutesAgo);

      const customer = seededCustomers[Math.floor(Math.random() * seededCustomers.length)];
      const orderId = uuidv4();
      
      // Select random products (1 to 4)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const shuffledProds = [...seededProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffledProds.slice(0, numItems);
      
      let totalVal = 0.0;
      const orderItems = [];

      for (const prod of selectedProducts) {
        const qty = Math.floor(Math.random() * 3) + 1;
        const subtotal = prod.price * qty;
        totalVal += subtotal;
        
        orderItems.push({
          id: uuidv4(),
          order_id: orderId,
          product_id: prod.id,
          quantity: qty,
          price: prod.price
        });
      }

      // Insert Order
      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: customer.id,
          total_amount: totalVal,
          status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
          shipping_address: ADDRESSES[Math.floor(Math.random() * ADDRESSES.length)],
          customer_phone: PHONES[Math.floor(Math.random() * PHONES.length)],
          customer_name: customer.full_name,
          payment_method: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
          created_at: orderDate.toISOString()
        });

      if (orderErr) {
        console.error(`Error seeding order: ${orderErr.message}`);
        continue;
      }

      // Insert Order Items
      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsErr) {
        console.error(`Error seeding order items: ${itemsErr.message}`);
      } else {
        ordersCreated++;
      }
    }
    
    console.log(`Successfully generated ${ordersCreated} historical orders.`);
  }

  console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding script failed:', err);
      process.exit(1);
    });
}
