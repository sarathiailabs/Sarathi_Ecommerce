import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, ShieldCheck, Truck, RefreshCw,
  Star, Heart, Share2, Check, ChevronRight, Zap,
  BadgeCheck, Info, MessageSquare, Minus, Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useCart, Product } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const getStarRating = (id: string) => {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return Number((3.5 + (n % 30) / 20).toFixed(1))
}
const getReviewCount = (id: string) => {
  const n = id.charCodeAt(1) + id.charCodeAt(2)
  return 50 + (n % 300)
}

const MOCK_REVIEWS = [
  { author: 'Rahul M.', rating: 5, date: '2 weeks ago', text: 'Absolutely top-tier quality. The build is premium and it performs exactly as advertised. Highly recommend!', verified: true },
  { author: 'Priya S.', rating: 4, date: '1 month ago', text: 'Really impressed with the product. Delivery was fast and packaging was excellent. Minor gripe: could include a carrying case.', verified: true },
  { author: 'Amit K.', rating: 5, date: '3 weeks ago', text: 'Best purchase of the year! Works flawlessly and looks even better in person. 10/10 would buy again.', verified: false },
]

interface SpecItem {
  key: string
  value: string
}

const getSpecifications = (product: Product): SpecItem[] => {
  const specs: SpecItem[] = []
  const category = (product.category || '').toLowerCase()
  const name = (product.name || '').toLowerCase()

  // Helper safely getting values
  const brandVal = product.brand || 'N/A'
  const weightVal = product.weight ? `${product.weight} kg` : 'N/A'
  const dimVal = product.dimensions || 'N/A'

  // 1. Grocery Category (with special Tea rules)
  if (category === 'grocery') {
    const isTea = name.includes('tea') || name.includes('tulsi')
    if (isTea) {
      specs.push({ key: 'Ingredients', value: name.includes('green') ? 'Certified Organic Green Tea Leaves, Rama Tulsi, Krishna Tulsi, Vana Tulsi' : 'Assam Black Tea Leaves, 15% Long Leaves' })
      specs.push({ key: 'Net Quantity', value: name.includes('1kg') ? '1 kg' : '25 Tea Bags (50g)' })
      specs.push({ key: 'Flavor', value: name.includes('green') ? 'Classic Green Tea & Holy Basil (Tulsi)' : 'Rich & Aromatic Black Tea' })
      specs.push({ key: 'Storage Instructions', value: 'Store in a cool, dry place in an airtight container away from strong odors.' })
      specs.push({ key: 'Shelf Life', value: '12 Months from packaging date' })
      specs.push({ key: 'Brand', value: brandVal })
    } else {
      specs.push({ key: 'Weight', value: name.includes('500g') ? '500g' : name.includes('110g') ? '110g' : weightVal })
      specs.push({ key: 'Ingredients', value: name.includes('almond') ? '100% Raw Premium California Almonds' : 'Dehydrated Potatoes, Vegetable Oil, Corn Flour, Wheat Starch, Sour Cream & Onion Seasonings' })
      specs.push({ key: 'Nutritional Info', value: name.includes('almond') ? 'Per 100g: Energy 607 kcal, Protein 21.2g, Fiber 12.2g, Fats 49.9g' : 'Per 100g: Energy 520 kcal, Protein 4.2g, Carbs 61g, Fats 29g' })
      specs.push({ key: 'Expiry Date', value: '6 Months from packaging date' })
      specs.push({ key: 'Storage Instructions', value: 'Store in a cool, dry place. Keep airtight after opening.' })
      specs.push({ key: 'Brand', value: brandVal })
    }
  }
  // 2. Electronics Category
  else if (category === 'electronics') {
    specs.push({ key: 'Brand', value: brandVal })
    specs.push({ key: 'Model', value: product.name.split('(')[0].trim() })
    
    let battery = 'N/A'
    if (name.includes('iphone') || name.includes('galaxy') || name.includes('phone')) {
      battery = name.includes('iphone') ? '4422 mAh (Up to 29 hours video playback)' : '5000 mAh (Up to 30 hours video playback)'
    } else if (name.includes('macbook') || name.includes('laptop') || name.includes('zephyrus')) {
      battery = name.includes('macbook') ? 'Integrated 52.6-watt-hour lithium-polymer (Up to 18 hours)' : 'Integrated 76-Whr 4-cell Lithium-ion (Up to 8 hours)'
    } else if (name.includes('headphones') || name.includes('airpods') || name.includes('xm5') || name.includes('audio')) {
      battery = name.includes('headphones') || name.includes('xm5') ? 'Rechargeable battery (Up to 30 hours with ANC)' : 'Up to 6 hours listening time (Up to 30 hours with case)'
    } else if (name.includes('watch') || name.includes('series')) {
      battery = 'Rechargeable lithium-ion battery (Up to 18 hours normal use)'
    } else if (name.includes('camera') || name.includes('alpha')) {
      battery = 'NP-FZ100 Rechargeable Battery (Approx. 520 shots)'
    }
    specs.push({ key: 'Battery', value: battery })

    let connectivity = 'N/A'
    if (name.includes('phone') || name.includes('laptop') || name.includes('zephyrus')) {
      connectivity = '5G, Wi-Fi 6E/7, Bluetooth 5.3, USB-C'
    } else if (name.includes('headphones') || name.includes('airpods') || name.includes('audio') || name.includes('watch')) {
      connectivity = 'Bluetooth 5.3, NFC, Wireless charging'
    } else if (name.includes('camera') || name.includes('alpha')) {
      connectivity = 'Wi-Fi, Bluetooth, Micro HDMI, USB-C'
    } else if (name.includes('printer')) {
      connectivity = 'Wi-Fi Direct, USB 2.0, Mobile printing (AirPrint)'
    }
    specs.push({ key: 'Connectivity', value: connectivity })
    specs.push({ key: 'Dimensions', value: dimVal })
    specs.push({ key: 'Warranty', value: '1 Year Brand Warranty' })
  }
  // 3. Clothing / Fashion Category
  else if (category === 'fashion') {
    let material = '100% Premium Cotton'
    if (name.includes('jeans')) material = '98% Cotton, 2% Elastane (Stretch Denim)'
    else if (name.includes('dress')) material = '100% Flowy Satin Polyester'
    else if (name.includes('suit')) material = '100% Premium Printed Cotton'
    
    let fit = 'Regular Fit'
    if (name.includes('jeans') || name.includes('511')) fit = 'Slim Fit'
    else if (name.includes('dress')) fit = 'Flowy Wrap Fit'
    else if (name.includes('anarkali') || name.includes('biba')) fit = 'Anarkali flared fit'

    specs.push({ key: 'Material', value: material })
    specs.push({ key: 'Size', value: 'S, M, L, XL, XXL' })
    specs.push({ key: 'Fit', value: fit })
    specs.push({ key: 'Wash Care', value: name.includes('dress') || name.includes('anarkali') ? 'Gentle Hand Wash / Dry Clean recommended' : 'Machine wash warm, tumble dry low' })
    specs.push({ key: 'Color', value: name.includes('jeans') ? 'Dark Indigo / Blue' : name.includes('polo') ? 'Solid Pique White' : name.includes('dress') ? 'Emerald Satin / Cowl neckline' : 'Printed Multi-color' })
    specs.push({ key: 'Brand', value: brandVal })
  }
  // 4. Books Category
  else if (category === 'books') {
    let author = 'N/A'
    if (name.includes('alchemist')) author = 'Paulo Coelho'
    else if (name.includes('sapiens')) author = 'Yuval Noah Harari'
    else if (name.includes('habits')) author = 'James Clear'
    else if (name.includes('algorithms')) author = 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein'
    
    specs.push({ key: 'Author', value: author })
    specs.push({ key: 'Publisher', value: brandVal })
    specs.push({ key: 'Language', value: 'English' })
    specs.push({ key: 'Format', value: 'Paperback (Standard Edition)' })
    
    let pages = 'N/A'
    if (name.includes('alchemist')) pages = '163'
    else if (name.includes('sapiens')) pages = '512'
    else if (name.includes('habits')) pages = '320'
    else if (name.includes('algorithms')) pages = '1312'
    specs.push({ key: 'Page Count', value: pages })
  }
  // 5. Home & Kitchen
  else if (category === 'home & kitchen' || category === 'home' || category === 'kitchen') {
    specs.push({ key: 'Brand', value: brandVal })
    
    let material = 'Mixed Material'
    if (name.includes('vacuum')) material = 'ABS Polycarbonate & Aluminum Wand'
    else if (name.includes('fryer')) material = 'BPA-free Food Grade Plastic & Stainless Steel'
    else if (name.includes('sofa')) material = 'Premium Solid Wood Frame, Foam Padding & Chenille Fabric'
    else if (name.includes('chair')) material = 'Breathable Mesh Back, Alloy Steel Support & High Density Foam'
    else if (name.includes('vase')) material = 'Handcrafted Glazed Ceramic'
    
    specs.push({ key: 'Material', value: material })
    specs.push({ key: 'Dimensions', value: dimVal })
    specs.push({ key: 'Weight', value: weightVal })
    
    let warranty = 'N/A'
    if (name.includes('vacuum') || name.includes('fryer')) warranty = '2 Years Brand Warranty'
    else if (name.includes('chair')) warranty = '3 Years Brand Warranty'
    else if (name.includes('sofa')) warranty = '1 Year Frame Warranty'
    
    specs.push({ key: 'Warranty', value: warranty })
    specs.push({ key: 'Country of Origin', value: 'India' })
  }
  // 6. Beauty
  else if (category === 'beauty') {
    specs.push({ key: 'Brand', value: brandVal })
    
    let type = 'Personal Care'
    if (name.includes('cleanser')) type = 'Skincare (Facial Cleanser)'
    else if (name.includes('serum')) type = 'Skincare (Facial Serum)'
    else if (name.includes('shampoo')) type = 'Haircare (Restructuring Shampoo)'
    else if (name.includes('trimmer')) type = 'Grooming (Beard Trimmer)'
    specs.push({ key: 'Type', value: type })

    let volume = '1 Unit'
    if (name.includes('cleanser')) volume = '236 ml'
    else if (name.includes('serum')) volume = '30 ml'
    else if (name.includes('shampoo')) volume = '300 ml'
    specs.push({ key: 'Volume / Pack', value: volume })

    let ingredients = 'N/A'
    if (name.includes('cleanser')) ingredients = 'Ceramides 1, 3, 6-II, Hyaluronic Acid, Glycerin'
    else if (name.includes('serum')) ingredients = 'Niacinamide 10%, Zinc PCA 1%, Aqua, Phenoxyethanol'
    else if (name.includes('shampoo')) ingredients = 'Gold Quinoa Protein, Hydrolyzed Wheat Protein, Citric Acid'
    else if (name.includes('trimmer')) ingredients = 'Stainless steel self-sharpening blades'
    specs.push({ key: 'Key Ingredients / Features', value: ingredients })

    specs.push({ key: 'Skin / Hair Type', value: name.includes('shampoo') ? 'Dry, Damaged Hair' : name.includes('cleanser') ? 'Normal to Dry, Sensitive Skin' : name.includes('serum') ? 'All Skin Types, Blemish-Prone Skin' : 'All Skin/Hair Types' })
    specs.push({ key: 'Warranty', value: name.includes('trimmer') ? '2 Years Brand Warranty' : 'N/A' })
  }
  // 7. Sports & Fitness
  else if (category === 'sports & fitness' || category === 'sports') {
    specs.push({ key: 'Brand', value: brandVal })
    
    let material = 'N/A'
    if (name.includes('dumbbells')) material = 'Cast Iron Core, Heavy-duty Rubber Coating'
    else if (name.includes('mat')) material = 'Eco-friendly TPE (Thermal Plastic Elastomer)'
    else if (name.includes('football')) material = 'Synthetic Rubber casing, Latex Bladder'
    else if (name.includes('treadmill')) material = 'Alloy Steel, PVC Non-slip belt & Electronics'
    specs.push({ key: 'Material', value: material })

    specs.push({ key: 'Weight / Load', value: name.includes('dumbbells') ? '10 kg (5kg x 2)' : name.includes('treadmill') ? 'Max User Weight: 100 kg' : weightVal })
    specs.push({ key: 'Dimensions', value: dimVal })
    specs.push({ key: 'Ideal Use', value: name.includes('mat') ? 'Yoga, Pilates, Floor Exercises' : name.includes('football') ? 'Outdoor Training & Matches' : name.includes('dumbbells') ? 'Strength & Resistance Training' : 'Cardio Running & Walking' })
    specs.push({ key: 'Warranty', value: name.includes('treadmill') ? '1 Year Brand Warranty' : 'N/A' })
  }
  // 8. Stationery / Office & Stationery
  else if (category.includes('stationery') || category.includes('office')) {
    specs.push({ key: 'Brand', value: brandVal })
    
    let material = 'Premium Stationery'
    if (name.includes('pens') || name.includes('pen')) material = name.includes('fountain') ? 'Stainless Steel Nib & Matte Metal body' : 'Plastic body with Japanese waterproof ink'
    else if (name.includes('notebook')) material = 'Elemental Chlorine-Free Paper, Spiral bound'
    else if (name.includes('printer')) material = 'High-grade ABS Plastic / Electronics'
    specs.push({ key: 'Material', value: material })

    specs.push({ key: 'Dimensions', value: dimVal })
    specs.push({ key: 'Pack Size / Pages', value: name.includes('notebook') ? '300 Pages (6-Subject)' : name.includes('pens') ? 'Pack of 10' : '1 Unit' })
    specs.push({ key: 'Weight', value: weightVal })
  }
  // Default fallback (similar to original)
  else {
    specs.push({ key: 'Brand', value: brandVal })
    specs.push({ key: 'Warranty', value: '1 Year Brand Warranty' })
    specs.push({ key: 'Country of Origin', value: 'India' })
    specs.push({ key: 'Weight', value: weightVal })
    specs.push({ key: 'Dimensions', value: dimVal })
  }

  return specs
}

type TabType = 'description' | 'specs' | 'reviews'

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [adding, setAdding] = useState<boolean>(false)
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageZoomed, setImageZoomed] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)

  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct({
          ...response.data,
          price: Number(response.data.price),
          stock: Number(response.data.stock)
        })

        if (isAuthenticated) {
          try {
            const checkRes = await api.get(`/wishlist/check/${id}`)
            setIsWishlisted(checkRes.data.in_wishlist)
          } catch (err) {
            console.error('Failed to check wishlist status:', err)
          }
        }
      } catch {
        showToast('Product not found. Redirecting...', true)
        setTimeout(() => navigate('/'), 2000)
      } finally {
        setLoading(false)
      }
    }
    fetchProductAndWishlist()
  }, [id, navigate, isAuthenticated])


  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your wishlist', true)
      return
    }
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`)
        setIsWishlisted(false)
        showToast('Removed from wishlist')
      } else {
        await api.post('/wishlist', { product_id: id })
        setIsWishlisted(true)
        showToast('Added to wishlist! ❤️')
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Could not update wishlist', true)
    }
  }

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError })
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) { showToast('Please sign in to add items to your cart', true); return }
    if (!product) return
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      setAddedSuccess(true)
      showToast(`${product.name} added to cart! 🛒`)
      setTimeout(() => setAddedSuccess(false), 2000)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Could not add to cart', true)
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) { showToast('Please sign in to continue', true); return }
    if (!product) return
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      navigate('/checkout')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Could not proceed', true)
    } finally {
      setAdding(false)
    }
  }

  const adjustQuantity = (delta: number) => {
    if (!product) return
    const next = quantity + delta
    if (next >= 1 && next <= product.stock) setQuantity(next)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="skeleton h-5 w-40 rounded-sm" />
        <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-sm border border-slate-200">
          <div className="lg:w-2/5 aspect-square skeleton rounded-sm" />
          <div className="lg:w-3/5 space-y-4">
            <div className="skeleton h-8 rounded-sm w-3/4" />
            <div className="skeleton h-5 rounded-sm w-1/4" />
            <div className="skeleton h-12 rounded-sm w-1/2" />
            <div className="skeleton h-24 rounded-sm w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const rating = getStarRating(product.id)
  const reviewCount = getReviewCount(product.id)
  const discount = Math.floor((product.id.charCodeAt(0) % 3) * 10 + 10) // 10-30%
  const hasDiscount = product.id.charCodeAt(0) % 3 !== 0
  const originalPrice = hasDiscount ? (product.price / (1 - discount / 100)) : null
  const stockPercent = Math.min(100, (product.stock / 50) * 100)

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'description', label: 'Description', icon: <Info size={13} /> },
    { id: 'specs', label: 'Specifications', icon: <BadgeCheck size={13} /> },
    { id: 'reviews', label: `Reviews (${reviewCount})`, icon: <MessageSquare size={13} /> },
  ]

  return (
    <div data-page="product-detail" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 select-none bg-[#F8FAFC] min-h-[60vh]">
      {/* Breadcrumb path */}
      <nav data-testid="pdp-breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap font-medium">
        <Link to="/" className="hover:text-[#0F6FFF]">Home</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-600">{product.category}</span>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-450 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product display split box */}
      <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/50 shadow-xs">
        
        {/* ============ LEFT COLUMN: Image & Gallery ============ */}
        <div className="lg:w-2/5 flex flex-col items-center">
          <div className="w-full relative aspect-square border border-slate-200/60 p-4 rounded-2xl flex items-center justify-center bg-white overflow-hidden group">
            <img
              src={product.image_url}
              alt={product.name}
              className={`object-contain max-h-full transition-transform duration-300 ${imageZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'}`}
              onClick={() => setImageZoomed(!imageZoomed)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
              }}
            />

            {/* Out of stock overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <span className="px-4 py-2 bg-red-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl shadow-sm">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Wishlist Button inside Image */}
            <button
              onClick={handleToggleWishlist}
              data-testid="pdp-add-to-wishlist-btn"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-[#0F6FFF] hover:scale-105 transition-all"
            >
              <Heart size={15} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
            </button>
          </div>

          {/* Action buttons (Flipkart Style layout) */}
          <div className="w-full flex gap-3 mt-4">
            <button
              data-testid="pdp-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className={`flex-1 py-3 text-xs font-bold rounded-sm uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 ${
                addedSuccess
                  ? 'bg-[#10B981] text-white'
                  : product.stock === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-[#14B8A6] hover:bg-[#e68f00] text-white'
              }`}
            >
              <ShoppingCart size={14} />
              {addedSuccess ? 'Added to Cart' : adding ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              data-testid="pdp-buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock === 0 || adding}
              className="flex-1 py-3 text-xs font-bold rounded-sm uppercase tracking-wider bg-[#14B8A6] hover:bg-[#e05310] text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap size={14} />
              Buy Now
            </button>
          </div>
        </div>

        {/* ============ RIGHT COLUMN: Details ============ */}
        <div className="lg:w-3/5 flex flex-col gap-4">
          <div>
            <h1 data-testid="pdp-product-name" className="text-base sm:text-lg font-semibold text-slate-800 leading-snug">
              {product.name}
            </h1>
            
            {/* Rating summary */}
            <div data-testid="pdp-rating-row" className="flex items-center gap-2 mt-2 flex-wrap text-xs font-semibold">
              <span data-testid="pdp-product-rating" className="rating-badge">
                {rating} ★
              </span>
              <span data-testid="pdp-review-count" className="text-slate-400">
                {reviewCount} Ratings & {Math.floor(reviewCount / 6)} Reviews
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-0.5 text-emerald-600">
                <BadgeCheck size={14} />
                Verified Purchase
              </span>
            </div>
          </div>

          {/* Pricing Info */}
          <div data-testid="pdp-price-box" className="bg-[#fcfcfc] border border-slate-100 p-4 rounded-sm">
            <div className="flex items-baseline gap-2.5">
              <span data-testid="pdp-product-price" className="text-2xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {originalPrice && (
                <>
                  <span className="text-xs text-slate-400 line-through font-medium">
                    ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-[#10B981]">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
            
            {/* Stock indicator */}
            {product.stock > 0 ? (
              <div data-testid="pdp-stock-indicator" className="mt-3 flex items-center gap-2">
                <span data-testid="pdp-product-stock" className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-[#10B981]'}`}>
                  {product.stock <= 5 ? `Hurry! Only ${product.stock} items left in stock` : 'Item Available in Stock'}
                </span>
              </div>
            ) : (
              <div className="mt-3">
                <span className="text-xs font-bold text-red-500">Currently Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div data-testid="pdp-quantity-section" className="flex items-center gap-4 py-3 border-t border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantity</span>
              <div className="flex items-center">
                <div data-testid="pdp-quantity-control" className="flex items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden">
                  <button
                    data-testid="pdp-qty-decrease"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                  >
                    <Minus size={12} />
                  </button>
                  <span data-testid="pdp-qty-value" className="w-8 text-center text-xs font-bold text-slate-800 select-none">
                    {quantity}
                  </span>
                  <button
                    data-testid="pdp-qty-increase"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Total Price: <span className="text-slate-800 font-extrabold text-sm">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
              </span>
            </div>
          )}

          {/* Support items */}
          <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck size={16} className="text-[#0F6FFF]" />
              <span className="text-[10px] font-bold text-slate-700">Free Logistics</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={16} className="text-[#0F6FFF]" />
              <span className="text-[10px] font-bold text-slate-700">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw size={16} className="text-[#0F6FFF]" />
              <span className="text-[10px] font-bold text-slate-700">30 Days Return</span>
            </div>
          </div>

          {/* Share Action */}
          <div className="flex justify-end">
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 px-2 hover:bg-slate-100 rounded-sm">
              <Share2 size={13} />
              <span>Share details</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============ TABS SECTION ============ */}
      <div className="mt-8 bg-white p-6 md:p-8 border border-slate-200/50 rounded-3xl shadow-xs">
        {/* Tab Header bar */}
        <div className="flex border-b border-slate-200 scrollable-tabs">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`pdp-tab-${tab.id}`}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'text-[#0F6FFF] border-[#0F6FFF]'
                    : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content bodies */}
        <div className="py-4">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Product Description</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-xl">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Specifications</h3>
              <div data-testid="pdp-specs-table" className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {getSpecifications(product).map((item, i) => {
                  return (
                    <div key={item.key} data-testid={`pdp-spec-row-${item.key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={`grid grid-cols-2 py-2.5 px-4 text-xs ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} border-b border-slate-100 last:border-0`}>
                      <span className="font-bold text-slate-400">{item.key}</span>
                      <span className="font-semibold text-slate-700">{item.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-200/40">
                <div className="text-center min-w-[120px]">
                  <div className="text-4xl font-black text-slate-800">{rating}</div>
                  <div className="flex justify-center gap-0.5 mt-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < Math.floor(rating) ? 'text-[#14B8A6]' : 'text-slate-200'} fill={i < Math.floor(rating) ? '#14B8A6' : 'none'} />
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{reviewCount} ratings</div>
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 2 : 1
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 w-3">{star}</span>
                        <Star size={10} className="text-slate-400" />
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 w-6">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase text-slate-700 border-b border-slate-200 pb-2">Customer Reviews</h4>
              <div data-testid="pdp-reviews-list" className="space-y-4">
                {MOCK_REVIEWS.map((review, i) => (
                  <div key={i} data-testid={`pdp-review-card-${i}`} className="border-b border-slate-100 pb-4 last:border-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rating-badge text-[9px] font-bold">
                        {review.rating} ★
                      </span>
                      <span className="text-xs font-bold text-slate-700">{review.author}</span>
                      {review.verified && (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm border border-emerald-100">
                          Verified Purchaser
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{review.text}</p>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase">{review.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-sm border shadow-lg max-w-xs ${
              toastMsg.isError
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}
          >
            {toastMsg.isError ? '⚠️' : '✅'}
            <span className="text-xs font-semibold">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
