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
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct({
          ...response.data,
          price: Number(response.data.price),
          stock: Number(response.data.stock)
        })
      } catch {
        showToast('Product not found. Redirecting...', true)
        setTimeout(() => navigate('/'), 2000)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-pulse">
        <div className="skeleton h-5 w-40 rounded-lg" />
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2 aspect-square skeleton rounded-3xl" />
          <div className="lg:w-1/2 space-y-5">
            {[80, 55, 40, 70, 100, 60].map((w, i) => (
              <div key={i} className={`skeleton h-${i === 0 ? 10 : i === 4 ? 14 : 5} rounded-xl w-${w < 60 ? '1/3' : w < 70 ? '3/5' : '4/5'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  const rating = getStarRating(product.id)
  const reviewCount = getReviewCount(product.id)
  const stockPercent = Math.min(100, (product.stock / 50) * 100)

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'description', label: 'Description', icon: <Info size={14} /> },
    { id: 'specs', label: 'Specifications', icon: <BadgeCheck size={14} /> },
    { id: 'reviews', label: `Reviews (${reviewCount})`, icon: <MessageSquare size={14} /> },
  ]

  return (
    <div data-page="product-detail" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav data-testid="pdp-breadcrumb" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#615E59] mb-8 flex-wrap">
        <Link to="/" className="text-[#E1392A] hover:underline font-black">Home</Link>
        <ChevronRight size={14} className="text-[#1D1C1A]/40" />
        <span className="text-[#FAF6EE] bg-[#E1392A] px-2.5 py-0.5 rounded border-2 border-[#1D1C1A] text-[9px] font-black uppercase shadow-xs">{product.category}</span>
        <ChevronRight size={14} className="text-[#1D1C1A]/40" />
        <span className="text-[#1D1C1A]/70 line-clamp-1">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* ============ LEFT: Image ============ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/2"
        >
          <div
            className={`relative rounded-3xl overflow-hidden bg-white border-3 border-[#1D1C1A] shadow-[5px_5px_0px_0px_#1D1C1A] cursor-zoom-in transition-all duration-300 ${imageZoomed ? 'scale-105 shadow-[7px_7px_0px_0px_#1D1C1A]' : ''}`}
            onClick={() => setImageZoomed(!imageZoomed)}
          >
            <div className="aspect-square flex items-center justify-center bg-white">
              <img
                src={product.image_url}
                alt={product.name}
                className={`object-cover w-full h-full transition-transform duration-500 ${imageZoomed ? 'scale-125' : 'scale-100'}`}
              />
            </div>

            {/* Category badge */}
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#F5B025] text-[#1D1C1A] border-2 border-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A]">
              {product.category}
            </span>

            {/* Out of stock overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <span className="px-5 py-2.5 rounded-2xl border-3 border-[#1D1C1A] bg-[#E1392A] text-white font-black tracking-widest uppercase shadow-[4px_4px_0px_0px_#1D1C1A]">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-white/90 text-[#1D1C1A] text-[9px] font-black uppercase tracking-wider border-2 border-[#1D1C1A] shadow-xs">
              {imageZoomed ? 'Click to zoom out' : 'Click to zoom'}
            </div>
          </div>

          {/* Action bar under image */}
          <div className="flex gap-4 mt-5">
            <button
              data-testid="pdp-add-to-wishlist-btn"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#1D1C1A] text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-[3px_3px_0px_0px_#1D1C1A] hover:shadow-[1px_1px_0px_0px_#1D1C1A] hover:translate-x-[1px] hover:translate-y-[1px] ${
                isWishlisted
                  ? 'bg-[#E1392A] text-white'
                  : 'bg-white text-[#1D1C1A] hover:bg-[#FAF6EE]'
              }`}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-white' : 'text-[#E1392A]'} />
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#1D1C1A] bg-white text-[#1D1C1A] hover:bg-[#FAF6EE] text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#1D1C1A] hover:shadow-[1px_1px_0px_0px_#1D1C1A] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
              <Share2 size={16} className="text-[#E1392A]" />
              Share
            </button>
          </div>

        </motion.div>

        {/* ============ RIGHT: Details ============ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:w-1/2 flex flex-col gap-6"
        >
          {/* Name & Rating */}
          <div>
            <h1
              data-testid="pdp-product-name"
              className="text-3xl md:text-4xl font-black text-[#1D1C1A] tracking-tight uppercase leading-none mb-3"
            >
              {product.name}
            </h1>

            {/* Rating row */}
            <div data-testid="pdp-rating-row" className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className={i < Math.floor(rating) ? 'text-[#F5B025]' : 'text-[#1D1C1A]/20'} fill={i < Math.floor(rating) ? '#F5B025' : 'none'} />
                ))}
              </div>
              <span data-testid="pdp-product-rating" className="text-xs font-black uppercase text-[#1D1C1A]">{rating}</span>
              <span data-testid="pdp-review-count" className="text-[10px] font-black uppercase tracking-wider text-[#615E59]">({reviewCount.toLocaleString()} reviews)</span>
              <span className="w-0.5 h-3.5 bg-[#1D1C1A]/20" />
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-black uppercase tracking-wider">
                <BadgeCheck size={14} />
                Verified Product
              </span>
            </div>
          </div>

          {/* Price */}
          <div data-testid="pdp-price-box" className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 space-y-2.5 shadow-[4px_4px_0px_0px_#1D1C1A]">
            <div className="flex items-baseline gap-3">
              <span data-testid="pdp-product-price" className="text-3xl font-black text-[#E1392A]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-[#615E59] line-through font-bold">
                ₹{Math.round(product.price * 1.2).toLocaleString('en-IN')}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#F5B025] text-[#1D1C1A] text-[10px] font-black border-2 border-[#1D1C1A] shadow-xs">
                20% OFF
              </span>
            </div>
            <p className="text-[10px] text-[#615E59] font-black uppercase tracking-wider">Inclusive of all taxes. Free shipping on this item.</p>

            {/* Stock indicator */}
            {product.stock > 0 && (
              <div data-testid="pdp-stock-indicator" className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                  <span data-testid="pdp-product-stock" className={`${product.stock <= 5 ? 'text-[#E1392A]' : 'text-emerald-600'}`}>
                    {product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                  </span>
                  <span className="text-[#615E59]/80">Selling fast</span>
                </div>
                <div className="h-3 bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      product.stock <= 5
                        ? 'bg-[#E1392A]'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div data-testid="pdp-quantity-section" className="space-y-2">
              <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Quantity</label>
              <div className="flex items-center gap-4">
                <div data-testid="pdp-quantity-control" className="inline-flex items-center bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_#1D1C1A]">
                  <button
                    data-testid="pdp-qty-decrease"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-[#1D1C1A] hover:bg-[#F5B025] hover:text-[#1D1C1A] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black"
                  >
                    <Minus size={16} />
                  </button>
                  <span data-testid="pdp-qty-value" className="w-10 text-center text-xs font-black text-[#1D1C1A] select-none">
                    {quantity}
                  </span>
                  <button
                    data-testid="pdp-qty-increase"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center text-[#1D1C1A] hover:bg-[#F5B025] hover:text-[#1D1C1A] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-[#615E59] font-black uppercase tracking-wider">
                  Total: <span className="text-[#1D1C1A] font-black text-sm">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </span>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <motion.button
              data-testid="pdp-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-200 border-3 border-[#1D1C1A] shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[2px_2px_0px_0px_#1D1C1A] hover:translate-x-[2px] hover:translate-y-[2px] ${
                addedSuccess
                  ? 'bg-emerald-500 text-[#1D1C1A]'
                  : product.stock === 0
                  ? 'bg-[#FAF6EE] text-[#1D1C1A]/40 cursor-not-allowed border-[#1D1C1A]/10 shadow-none'
                  : 'bg-[#E1392A] text-white hover:bg-[#C92F22]'
              }`}
            >
              {addedSuccess ? (
                <><Check size={18} />Added!</>
              ) : (
                <><ShoppingCart size={18} />{adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</>
              )}
            </motion.button>

            <motion.button
              data-testid="pdp-buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock === 0 || adding}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-white border-3 border-[#1D1C1A] text-[#1D1C1A] hover:bg-[#FAF6EE] shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[2px_2px_0px_0px_#1D1C1A] hover:translate-x-[2px] hover:translate-y-[2px] disabled:bg-[#FAF6EE] disabled:text-[#1D1C1A]/30 disabled:border-[#1D1C1A]/10 disabled:shadow-none transition-all duration-200"
            >
              <Zap size={18} className="text-[#E1392A]" />
              Buy Now
            </motion.button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-[#1D1C1A]/10 mt-2">
            {[
              { icon: <Truck size={16} />, title: 'Express Delivery', sub: '2–3 business days' },
              { icon: <ShieldCheck size={16} />, title: 'Secure Checkout', sub: 'SSL encrypted' },
              { icon: <RefreshCw size={16} />, title: 'Easy Returns', sub: '30-day policy' },
            ].map((b) => (
              <div key={b.title} className="flex flex-col items-center text-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center text-[#E1392A] shadow-xs flex-shrink-0">
                  {b.icon}
                </div>
                <div>
                  <div className="text-[9px] font-black text-[#1D1C1A] uppercase tracking-wider">{b.title}</div>
                  <div className="text-[8px] text-[#615E59] font-bold uppercase tracking-wider mt-0.5">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ============ TABS SECTION ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-16"
      >
        {/* Tab headers */}
        <div className="flex border-b-3 border-[#1D1C1A] scrollable-tabs">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-black uppercase tracking-wider border-b-4 transition-all duration-200 whitespace-nowrap ${
                  isSelected
                    ? 'text-[#E1392A] border-[#E1392A] bg-[#FAF6EE]/50 shadow-xs'
                    : 'text-[#1D1C1A]/50 border-transparent hover:text-[#1D1C1A] hover:bg-[#FAF6EE]/20'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="py-8"
          >
            {activeTab === 'description' && (
              <div className="max-w-3xl space-y-4">
                <h3 className="text-sm font-black text-[#1D1C1A] uppercase tracking-wider mb-2">About This Product</h3>
                <p className="text-[#615E59] text-xs font-medium leading-relaxed">{product.description}</p>
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  {['Premium quality materials', 'Industry-standard certifications', '1-year manufacturer warranty', 'Compatible with all major ecosystems'].map((point) => (
                    <div key={point} className="bg-white border-2 border-[#1D1C1A] rounded-xl p-3 flex items-center gap-3 shadow-[2px_2px_0px_0px_#1D1C1A]">
                      <Check size={16} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-xs text-[#1D1C1A] font-black uppercase tracking-wider">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <h3 className="text-sm font-black text-[#1D1C1A] uppercase tracking-wider mb-4">Technical Specifications</h3>
                <div className="space-y-2">
                  {SPEC_KEYS.map((key, i) => {
                    const values = ['Aircraft-grade Aluminum', '1 Year', 'India', '0.8 kg', 'Bluetooth 5.3 / USB-C', '36 Hours']
                    return (
                      <div key={key} className={`flex justify-between items-center py-3 px-4 rounded-xl border-2 border-[#1D1C1A]/10 mt-2 bg-white`}>
                        <span className="text-xs font-black uppercase tracking-wider text-[#615E59]">{key}</span>
                        <span className="text-xs font-black uppercase tracking-wider text-[#1D1C1A]">{values[i]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 text-center flex-shrink-0 min-w-[140px] shadow-[4px_4px_0px_0px_#1D1C1A]">
                    <div className="text-5xl font-black text-[#E1392A] mb-1">{rating}</div>
                    <div className="flex justify-center gap-1 mb-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-[#F5B025]' : 'text-[#1D1C1A]/20'} fill={i < Math.floor(rating) ? '#F5B025' : 'none'} />
                      ))}
                    </div>
                    <div className="text-[10px] text-[#615E59] font-black uppercase tracking-wider">{reviewCount.toLocaleString()} reviews</div>
                  </div>
                  <div className="flex-1 space-y-2.5 w-full">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 2 : 1
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-xs font-black text-[#1D1C1A] w-4">{star}</span>
                          <Star size={11} className="text-[#F5B025]" fill="#F5B025" />
                          <div className="flex-1 h-3 bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#F5B025] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-[#615E59] w-8">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <h3 className="text-sm font-black uppercase text-[#1D1C1A] border-t-2 border-[#1D1C1A]/10 pt-6 mb-4">Customer Reviews</h3>
                {MOCK_REVIEWS.map((review, i) => (
                  <div key={i} className="bg-white border-2 border-[#1D1C1A] rounded-2xl p-5 space-y-3 shadow-[3px_3px_0px_0px_#1D1C1A]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-black text-[#1D1C1A] text-xs uppercase tracking-wider">{review.author}</span>
                          {review.verified && (
                            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                              <BadgeCheck size={10} />
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={12} className={j < review.rating ? 'text-[#F5B025]' : 'text-[#1D1C1A]/20'} fill={j < review.rating ? '#F5B025' : 'none'} />
                            ))}
                          </div>
                          <span className="text-[10px] text-[#615E59] font-black uppercase tracking-wider">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-[#615E59] leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border-3 border-[#1D1C1A] shadow-[5px_5px_0px_0px_#1D1C1A] text-xs font-black uppercase tracking-wider ${
              toastMsg.isError
                ? 'bg-[#E1392A] text-white'
                : 'bg-[#FAF6EE] text-[#1D1C1A]'
            }`}
          >
            {toastMsg.isError ? '⚠️' : '✅'}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
