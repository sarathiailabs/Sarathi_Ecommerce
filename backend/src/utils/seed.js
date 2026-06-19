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
  // Electronics
  {
    name: 'iPhone 15 Pro (128GB, Natural Titanium)',
    description: 'Featuring the class-leading A17 Pro chip, a customizable Action button, and a versatile Pro camera system with a 48MP main lens.',
    price: 129900.00,
    original_price: 134900.00,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    rating: 4.8,
    review_count: 142,
    is_featured: true
  },
  {
    name: 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray)',
    description: 'Unlock revolutionary mobile experiences with Galaxy AI. Features a built-in S Pen, a 200MP camera, and the Snapdragon 8 Gen 3 processor.',
    price: 139999.00,
    original_price: 149999.00,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Samsung',
    rating: 4.9,
    review_count: 98,
    is_featured: true
  },
  {
    name: 'MacBook Air 13-inch M3 (8GB Unified Memory, 256GB SSD)',
    description: 'The world\'s most popular laptop is better than ever with the M3 chip. Strikingly thin design with up to 18 hours of battery life.',
    price: 104900.00,
    original_price: 114900.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Apple',
    rating: 4.7,
    review_count: 85,
    is_featured: false
  },
  {
    name: 'ASUS ROG Zephyrus G14 Gaming Laptop',
    description: 'Powerful gaming meets portability. Features an AMD Ryzen 9 processor, NVIDIA RTX 4060 graphics, and a stunning 120Hz ROG Nebula display.',
    price: 149990.00,
    original_price: 169990.00,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'ASUS',
    rating: 4.6,
    review_count: 57,
    is_featured: true
  },
  {
    name: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    description: 'Industry-leading noise cancellation with dual processors, eight microphones, exceptional call quality, and up to 30 hours of battery life.',
    price: 29990.00,
    original_price: 34990.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'Sony',
    rating: 4.8,
    review_count: 312,
    is_featured: true
  },
  {
    name: 'Apple AirPods Pro (2nd Generation) with USB-C',
    description: 'Features up to 2x more Active Noise Cancellation, Transparency mode, and Adaptive Audio to dynamically tailor noise control to your environment.',
    price: 22900.00,
    original_price: 24900.00,
    stock: 55,
    image_url: 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'Apple',
    rating: 4.7,
    review_count: 215,
    is_featured: false
  },
  {
    name: 'Sony Alpha 7 IV Mirrorless Camera (Body Only)',
    description: 'A true hybrid camera featuring a 33MP full-frame Exmor R CMOS sensor, high-speed autofocus, and 4K 60p video recording.',
    price: 218990.00,
    original_price: 242990.00,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Cameras',
    brand: 'Sony',
    rating: 4.9,
    review_count: 38,
    is_featured: true
  },
  {
    name: 'Apple Watch Series 9 GPS 45mm (Midnight)',
    description: 'The ultimate device for a healthy life. Features the powerful S9 SiP chip, double tap gesture support, and advanced health sensors.',
    price: 41900.00,
    original_price: 44900.00,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    category: 'Electronics',
    subcategory: 'Smart Watches',
    brand: 'Apple',
    rating: 4.7,
    review_count: 73,
    is_featured: false
  },

  // Home & Kitchen
  {
    name: 'Dyson V11 Absolute Cord-Free Vacuum Cleaner',
    description: 'Intelligently senses and adapts to different floor types. Features powerful suction, a radial cyclone design, and advanced whole-machine filtration.',
    price: 49900.00,
    original_price: 54900.00,
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80',
    category: 'Home & Kitchen',
    subcategory: 'Appliances',
    brand: 'Dyson',
    rating: 4.8,
    review_count: 95,
    is_featured: true
  },
  {
    name: 'Philips Digital Air Fryer HD9252/90',
    description: 'Healthy frying with Rapid Air technology. Enjoy delicious, crispy food with up to 90% less fat, featuring an easy-to-use digital touch panel.',
    price: 7999.00,
    original_price: 9999.00,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=800&q=80',
    category: 'Home & Kitchen',
    subcategory: 'Appliances',
    brand: 'Philips',
    rating: 4.5,
    review_count: 245,
    is_featured: false
  },
  {
    name: 'Sleepyhead 3-Seater Fabric Sofa (Emerald Green)',
    description: 'Transform your living room with this comfortable and stylish sofa. Features high-density foam padding and solid wood structuring.',
    price: 18999.00,
    original_price: 24999.00,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    category: 'Home & Kitchen',
    subcategory: 'Furniture',
    brand: 'Sleepyhead',
    rating: 4.4,
    review_count: 36,
    is_featured: false
  },
  {
    name: 'Featherlite Ergonomic High-Back Office Chair',
    description: 'Promote healthy posture with dynamic lumbar support, 3D adjustable armrests, a breathable mesh back, and synchro-tilt mechanism.',
    price: 8999.00,
    original_price: 11999.00,
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
    category: 'Home & Kitchen',
    subcategory: 'Furniture',
    brand: 'Featherlite',
    rating: 4.6,
    review_count: 185,
    is_featured: true
  },
  {
    name: 'Solimo Ceramic Flower Vase Set (Teal & Amber)',
    description: 'Elegant handcrafted ceramic vases, perfect for decorating your living room table, mantelpiece, or bedside table.',
    price: 999.00,
    original_price: 1499.00,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80',
    category: 'Home & Kitchen',
    subcategory: 'Decor',
    brand: 'Solimo',
    rating: 4.3,
    review_count: 62,
    is_featured: false
  },

  // Fashion
  {
    name: 'Levi\'s Men\'s 511 Slim Fit Stretchable Jeans',
    description: 'The classic slim fit jean with modern stretch for ultimate comfort and durability. Sits below the waist with a slim leg.',
    price: 2599.00,
    original_price: 3299.00,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    category: 'Fashion',
    subcategory: 'Men\'s Clothing',
    brand: 'Levi\'s',
    rating: 4.4,
    review_count: 310,
    is_featured: false
  },
  {
    name: 'U.S. Polo Assn. Men\'s Solid Pique Polo Shirt',
    description: 'A classic polo shirt crafted from 100% premium pique cotton. Features signature brand embroidery and ribbed collar/cuffs.',
    price: 1199.00,
    original_price: 1799.00,
    stock: 150,
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80',
    category: 'Fashion',
    subcategory: 'Men\'s Clothing',
    brand: 'U.S. Polo Assn.',
    rating: 4.3,
    review_count: 188,
    is_featured: false
  },
  {
    name: 'Zara Women\'s Flowy Satin Midi Dress',
    description: 'A gorgeous satin evening dress featuring a cowl neckline, thin adjustable straps, and a clean flowing wrap silhouette.',
    price: 3990.00,
    original_price: 4990.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    category: 'Fashion',
    subcategory: 'Women\'s Clothing',
    brand: 'Zara',
    rating: 4.5,
    review_count: 42,
    is_featured: true
  },
  {
    name: 'BIBA Women\'s Cotton Anarkali Suit Set',
    description: 'Elegant ethnic suit set featuring a printed cotton Anarkali kurta, solid churidar pants, and a matching cotton dupatta.',
    price: 2499.00,
    original_price: 3999.00,
    stock: 65,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    category: 'Fashion',
    subcategory: 'Women\'s Clothing',
    brand: 'BIBA',
    rating: 4.6,
    review_count: 53,
    is_featured: false
  },
  {
    name: 'Nike Air Max 90 Premium Sneakers',
    description: 'Step into legacy. Features iconic Max Air cushioning in the heel, premium leather overlays, and durable rubber waffle outsoles.',
    price: 9995.00,
    original_price: 11995.00,
    stock: 75,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    category: 'Fashion',
    subcategory: 'Footwear',
    brand: 'Nike',
    rating: 4.7,
    review_count: 512,
    is_featured: true
  },
  {
    name: 'Ray-Ban Unisex Wayfarer Classic Sunglasses',
    description: 'The most recognizable style in the history of sunglasses. Offers 100% UV protection with acetate frames and classic G-15 lenses.',
    price: 8490.00,
    original_price: 9490.00,
    stock: 90,
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    category: 'Fashion',
    subcategory: 'Accessories',
    brand: 'Ray-Ban',
    rating: 4.6,
    review_count: 178,
    is_featured: false
  },

  // Beauty
  {
    name: 'CeraVe Hydrating Facial Cleanser (236ml)',
    description: 'Developed with dermatologists. Cleanses and refreshes the skin without over-stripping or leaving it feeling tight and dry.',
    price: 1150.00,
    original_price: 1350.00,
    stock: 200,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'CeraVe',
    rating: 4.8,
    review_count: 420,
    is_featured: true
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1% Serum',
    description: 'High-strength vitamin and mineral blemish formula. Reduces the appearance of skin blemishes and congestion, balancing visible sebum activity.',
    price: 650.00,
    original_price: 850.00,
    stock: 250,
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    category: 'Beauty',
    subcategory: 'Skincare',
    brand: 'The Ordinary',
    rating: 4.6,
    review_count: 512,
    is_featured: false
  },
  {
    name: 'L\'Oreal Professionnel Absolut Repair Shampoo (300ml)',
    description: 'Deeply nourishes and restructures damaged hair. Enriched with Gold Quinoa and Wheat Protein to instantly reduce hair surface damage.',
    price: 899.00,
    original_price: 1050.00,
    stock: 130,
    image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80',
    category: 'Beauty',
    subcategory: 'Haircare',
    brand: 'L\'Oreal',
    rating: 4.5,
    review_count: 310,
    is_featured: false
  },
  {
    name: 'Philips Series 3000 Cordless Beard Trimmer',
    description: 'Get a perfect protective trim, time after time. Lift & Trim system cuts up to 30% faster, featuring self-sharpening steel blades.',
    price: 1599.00,
    original_price: 1999.00,
    stock: 140,
    image_url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&q=80',
    category: 'Beauty',
    subcategory: 'Grooming',
    brand: 'Philips',
    rating: 4.4,
    review_count: 154,
    is_featured: false
  },

  // Sports & Fitness
  {
    name: 'Decathlon Hex Dumbbells (5kg Pair)',
    description: 'Solid cast iron core encased in heavy-duty rubber. Protects your flooring, reduces bounce noise, and features a textured chrome grip.',
    price: 1999.00,
    original_price: 2499.00,
    stock: 65,
    image_url: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80',
    category: 'Sports & Fitness',
    subcategory: 'Fitness Equipment',
    brand: 'Decathlon',
    rating: 4.8,
    review_count: 184,
    is_featured: true
  },
  {
    name: 'Lifelong Motorized Home Folding Treadmill',
    description: 'Equipped with a powerful 2.5 HP peak quiet motor. Features an LED dashboard tracker, built-in speakers, and standard shock absorbers.',
    price: 18999.00,
    original_price: 29999.00,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1578762560072-46cf124c2ed2?w=800&q=80',
    category: 'Sports & Fitness',
    subcategory: 'Fitness Equipment',
    brand: 'Lifelong',
    rating: 4.6,
    review_count: 42,
    is_featured: true
  },
  {
    name: 'YogaBar 6mm Eco-Friendly TPE Yoga Mat',
    description: 'Premium dual-layered non-slip textured mat. Provides optimal joint cushioning, is sweat-resistant, and includes a nylon carrying strap.',
    price: 1299.00,
    original_price: 1899.00,
    stock: 110,
    image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800&q=80',
    category: 'Sports & Fitness',
    subcategory: 'Yoga',
    brand: 'YogaBar',
    rating: 4.6,
    review_count: 125,
    is_featured: false
  },
  {
    name: 'Nivia Storm Football (Size 5)',
    description: 'Standard size 5 tournament ball. Crafted with 32 panels, synthetic rubber casing, and high-bounce latex bladder for superior flight.',
    price: 499.00,
    original_price: 699.00,
    stock: 200,
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
    category: 'Sports & Fitness',
    subcategory: 'Outdoor Sports',
    brand: 'Nivia',
    rating: 4.5,
    review_count: 240,
    is_featured: false
  },

  // Books
  {
    name: 'The Alchemist by Paulo Coelho',
    description: 'A beautiful and inspiring fable about following your dreams and listening to your heart, capturing millions of readers worldwide.',
    price: 299.00,
    original_price: 399.00,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    category: 'Books',
    subcategory: 'Fiction',
    brand: 'HarperCollins',
    rating: 4.7,
    review_count: 320,
    is_featured: true
  },
  {
    name: 'Sapiens: A Brief History of Humankind',
    description: 'Renowned historian Yuval Noah Harari explores how biology and history have defined us, from early hominids to the modern age.',
    price: 450.00,
    original_price: 599.00,
    stock: 110,
    image_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
    category: 'Books',
    subcategory: 'Non-Fiction',
    brand: 'Harari Publishing',
    rating: 4.7,
    review_count: 812,
    is_featured: false
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'The definitive guide to breaking bad habits and building good ones. Learn how tiny 1% daily adjustments lead to massive transformations.',
    price: 499.00,
    original_price: 799.00,
    stock: 250,
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    category: 'Books',
    subcategory: 'Self-Help',
    brand: 'Avery',
    rating: 4.9,
    review_count: 1250,
    is_featured: true
  },
  {
    name: 'Introduction to Algorithms (CLRS)',
    description: 'The standard academic textbook on computer science algorithms, covering sorting, graph structures, and dynamic programming.',
    price: 2499.00,
    original_price: 2999.00,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    category: 'Books',
    subcategory: 'Technology',
    brand: 'MIT Press',
    rating: 4.8,
    review_count: 195,
    is_featured: false
  },

  // Grocery
  {
    name: 'Happilo Premium California Almonds (500g)',
    description: '100% natural, raw, premium California almonds. Crunchy and packed with vitamins, proteins, and healthy monounsaturated fats.',
    price: 449.00,
    original_price: 599.00,
    stock: 180,
    image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d4f?w=800&q=80',
    category: 'Grocery',
    subcategory: 'Dry Fruits',
    brand: 'Happilo',
    rating: 4.5,
    review_count: 220,
    is_featured: false
  },
  {
    name: 'Tata Tea Gold Leaf Tea (1kg)',
    description: 'An exquisite blend of fine Assam tea leaves mixed with long leaves to deliver an incredibly rich aroma and refreshing taste.',
    price: 420.00,
    original_price: 470.00,
    stock: 200,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80',
    category: 'Grocery',
    subcategory: 'Beverages',
    brand: 'Tata Tea',
    rating: 4.6,
    review_count: 140,
    is_featured: false
  },
  {
    name: 'Pringles Potato Chips (Sour Cream & Onion, 110g)',
    description: 'The iconic stackable potato chips. Crispy, salty, and loaded with rich sour cream and onion seasonings.',
    price: 99.00,
    original_price: 110.00,
    stock: 300,
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80',
    category: 'Grocery',
    subcategory: 'Snacks',
    brand: 'Pringles',
    rating: 4.4,
    review_count: 520,
    is_featured: true
  },
  {
    name: 'Organic India Tulsi Green Tea Classic (25 Tea Bags)',
    description: '100% certified organic green tea leaves blended with the healing power of Holy Basil (Tulsi) for stress relief and detoxification.',
    price: 169.00,
    original_price: 199.00,
    stock: 150,
    image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&q=80',
    category: 'Grocery',
    subcategory: 'Organic Food',
    brand: 'Organic India',
    rating: 4.7,
    review_count: 85,
    is_featured: false
  },

  // Office & Stationery
  {
    name: 'Parker Vector Matte Black Fountain Pen',
    description: 'A sleek and classic writing instrument. Features a durable stainless steel nib, an elegant matte black finish, and clean ink flow.',
    price: 349.00,
    original_price: 399.00,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
    category: 'Office & Stationery',
    subcategory: 'Office Essentials',
    brand: 'Parker',
    rating: 4.5,
    review_count: 167,
    is_featured: false
  },
  {
    name: 'Canon PIXMA TS307 Single Function Wireless Inkjet Printer',
    description: 'An affordable compact wireless printer. Supports mobile printing, borderless photo printing, and high-yield black/color print cartridges.',
    price: 3499.00,
    original_price: 4999.00,
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80',
    category: 'Office & Stationery',
    subcategory: 'Printers',
    brand: 'Canon',
    rating: 4.2,
    review_count: 98,
    is_featured: true
  },
  {
    name: 'Classmate Octane Gel Pens (Pack of 10, Blue)',
    description: 'Enjoy a smooth, fast writing experience. Features Japanese waterproof ink, a comfortable rubber grip, and a stylish textured body.',
    price: 100.00,
    original_price: 100.00,
    stock: 500,
    image_url: 'https://images.unsplash.com/photo-1585336139185-a400f080d1e12?w=800&q=80',
    category: 'Office & Stationery',
    subcategory: 'Office Essentials',
    brand: 'Classmate',
    rating: 4.6,
    review_count: 310,
    is_featured: false
  },
  {
    name: 'Classmate Pulse 6-Subject Notebook (Single Line, 300 Pages)',
    description: 'Premium softcover notebook with spiral binding. Features high-quality white paper and convenient theme-based subject separator flags.',
    price: 175.00,
    original_price: 195.00,
    stock: 250,
    image_url: 'https://images.unsplash.com/photo-153140678377-a5be20888e57?w=800&q=80',
    category: 'Office & Stationery',
    subcategory: 'Notebooks',
    brand: 'Classmate',
    rating: 4.7,
    review_count: 120,
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

  // Check if products already exist in the database to prevent overwriting existing catalog data on startup
  const { data: dbProductsCheck, error: checkError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('[LIFESPAN] Error checking for existing products:', checkError.message);
  }

  if (dbProductsCheck && dbProductsCheck.length > 0) {
    console.log('[LIFESPAN] Products already exist in database. Skipping table clearance and seeding to preserve existing data.');
    console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
    return;
  }

  // Clear existing database tables to ensure clean seeding
  console.log('Clearing existing database tables...');
  await supabase.from('order_items').delete().neq('id', 'none');
  await supabase.from('deliveries').delete().neq('id', 'none');
  await supabase.from('orders').delete().neq('id', 'none');
  await supabase.from('returns').delete().neq('id', 'none');
  await supabase.from('reviews').delete().neq('id', 'none');
  await supabase.from('wishlists').delete().neq('id', 'none');
  await supabase.from('carts').delete().neq('id', 'none');
  await supabase.from('product_variants').delete().neq('id', 'none');
  await supabase.from('product_inventory').delete().neq('id', 'none');
  await supabase.from('products').delete().neq('id', 'none');

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
          subcategory: product.subcategory || null,
          brand: product.brand || null,
          weight: product.weight || null,
          dimensions: product.dimensions || null,
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
