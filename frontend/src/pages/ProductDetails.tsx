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

const SPEC_KEYS = ['Material', 'Warranty', 'Country of Origin', 'Weight', 'Connectivity', 'Battery Life']

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
    <div data-page="product-detail" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none bg-[#F1F3F6] min-h-screen">
      {/* Breadcrumb path */}
      <nav data-testid="pdp-breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 flex-wrap font-medium">
        <Link to="/" className="hover:text-[#2874F0]">Home</Link>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-600">{product.category}</span>
        <ChevronRight size={12} className="text-slate-400" />
        <span className="text-slate-400 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product display split box */}
      <div className="flex flex-col lg:flex-row gap-6 bg-white p-5 rounded-sm border border-slate-200 shadow-xs">
        
        {/* ============ LEFT COLUMN: Image & Gallery ============ */}
        <div className="lg:w-2/5 flex flex-col items-center">
          <div className="w-full relative aspect-square border border-slate-200 p-4 rounded-sm flex items-center justify-center bg-white overflow-hidden group">
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
                <span className="px-4 py-2 bg-red-500 text-white font-bold uppercase tracking-wider text-xs rounded-sm shadow-sm">
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
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-[#2874F0] hover:scale-105 transition-all"
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
                  ? 'bg-[#388E3C] text-white'
                  : product.stock === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-[#FF9F00] hover:bg-[#e68f00] text-white'
              }`}
            >
              <ShoppingCart size={14} />
              {addedSuccess ? 'Added to Cart' : adding ? 'Adding...' : 'Add to Cart'}
            </button>

            <button
              data-testid="pdp-buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock === 0 || adding}
              className="flex-1 py-3 text-xs font-bold rounded-sm uppercase tracking-wider bg-[#FB641B] hover:bg-[#e05310] text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
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
                  <span className="text-xs font-bold text-[#388E3C]">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
            
            {/* Stock indicator */}
            {product.stock > 0 ? (
              <div data-testid="pdp-stock-indicator" className="mt-3 flex items-center gap-2">
                <span data-testid="pdp-product-stock" className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-[#388E3C]'}`}>
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
            <div data-testid="pdp-quantity-section" className="flex items-center gap-4 py-2 border-t border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantity</span>
              <div className="flex items-center">
                <div data-testid="pdp-quantity-control" className="flex items-center border border-slate-300 bg-slate-50 rounded-sm">
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
              <Truck size={16} className="text-[#2874F0]" />
              <span className="text-[10px] font-bold text-slate-700">Free Logistics</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={16} className="text-[#2874F0]" />
              <span className="text-[10px] font-bold text-slate-700">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw size={16} className="text-[#2874F0]" />
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
      <div className="mt-6 bg-white p-5 border border-slate-200 rounded-sm shadow-xs">
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
                    ? 'text-[#2874F0] border-[#2874F0]'
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
              <div data-testid="pdp-specs-table" className="border border-slate-200 rounded-sm overflow-hidden bg-white">
                {SPEC_KEYS.map((key, i) => {
                  const values = ['Premium Grade Aluminum', '1 Year Brand Warranty', 'Made in India', '0.8 kg', 'Bluetooth 5.3 Connection', '36 Hours Battery']
                  return (
                    <div key={key} data-testid={`pdp-spec-row-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className={`grid grid-cols-2 py-2.5 px-4 text-xs ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} border-b border-slate-100 last:border-0`}>
                      <span className="font-bold text-slate-400">{key}</span>
                      <span className="font-semibold text-slate-700">{values[i]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row gap-6 items-center bg-slate-50 p-4 rounded-sm border border-slate-200/50">
                <div className="text-center min-w-[120px]">
                  <div className="text-4xl font-black text-slate-800">{rating}</div>
                  <div className="flex justify-center gap-0.5 mt-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < Math.floor(rating) ? 'text-[#FF9F00]' : 'text-slate-200'} fill={i < Math.floor(rating) ? '#FF9F00' : 'none'} />
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
                          <div className="h-full bg-[#388E3C] rounded-full" style={{ width: `${pct}%` }} />
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
