import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShoppingCart, Search, X, SlidersHorizontal,
  Star, Heart, TrendingUp, Shield, Truck, Headset,
  Cpu, Laptop, Headphones, Watch, Gamepad2, Camera,
  Home as HomeIcon, Smartphone, Sparkles, Package,
  ChevronDown, ChevronUp, Filter, ChevronLeft, ChevronRight,
  Send, Quote, CheckCircle2, Tag, Tv, Shirt, BookOpen, Apple, PenTool, ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, A11y } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import api from '../services/api'
import { useCart, Product } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { HeroSlider } from '../components/HeroSlider'
import { scrollToElementWithOffset } from '../utils/scroll'

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
]

// Deterministic mock star ratings
const getStarRating = (id: string) => {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return 3.5 + ((n % 30) / 20) // 3.5 – 5.0
}

const getReviewCount = (id: string) => {
  const n = id.charCodeAt(1) + id.charCodeAt(2)
  return 50 + (n % 300)
}

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('default')
  const [loading, setLoading] = useState<boolean>(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Landing page states
  const [heroSearch, setHeroSearch] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  // Countdown timer for Deals of the Week
  const [timeLeft, setTimeLeft] = useState({ hours: 16, minutes: 42, seconds: 18 })
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 24, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Carousels Scroll Refs
  const trendingScrollRef = useRef<HTMLDivElement>(null)
  const arrivalsScrollRef = useRef<HTMLDivElement>(null)

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current
      const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75
      ref.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' })
    }
  }

  // Collapsible sidebar sections
  const [catCollapse, setCatCollapse] = useState(false)
  const [priceCollapse, setPriceCollapse] = useState(false)
  const [sortCollapse, setSortCollapse] = useState(false)
  
  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { addToCart } = useCart()
  const { user, isAuthenticated, isAdmin, isShopOwner, isDeliveryPartner } = useAuth()
  const isStaff = isAdmin || isShopOwner || isDeliveryPartner
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const handleResetFilters = () => {
      setSelectedCategory('All')
      setSearchQuery('')
      setSearchParams({})
    }
    window.addEventListener('reset-filters', handleResetFilters)
    return () => {
      window.removeEventListener('reset-filters', handleResetFilters)
    }
  }, [setSearchParams])

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    const newParams: Record<string, string> = {}
    if (cat !== 'All') {
      newParams.category = cat
    }
    if (searchQuery) {
      newParams.search = searchQuery
    }
    setSearchParams(newParams)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }



  const urlSearch = searchParams.get('search')
  const urlCat = searchParams.get('category')

  // Sync search and category from URL
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch)
    } else {
      setSearchQuery('')
    }

    if (urlCat) {
      if (urlCat.toLowerCase() === 'deals') {
        setSelectedCategory('Deals')
      } else {
        const matched = categories.find(c => {
          const normDb = c.toLowerCase().replace(/[^a-z0-9]/g, '')
          const normUrl = urlCat.toLowerCase().replace(/[^a-z0-9]/g, '')
          return normDb === normUrl
        })
        if (matched) setSelectedCategory(matched)
      }
    } else {
      setSelectedCategory('All')
    }
  }, [urlSearch, urlCat, categories])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products')
        const data = response.data.map((p: any) => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock)
        }))
        setProducts(data)
        const distinct = Array.from(new Set(data.map((p: any) => p.category))) as string[]
        setCategories(['All', 'Deals', ...distinct])
      } catch (err: any) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      console.log(`[TEMP LOG] Rendered Image URL for first product "${products[0].name}": ${products[0].image_url}`);
    }
  }, [products])

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) {
        setWishlist(new Set())
        return
      }
      try {
        const response = await api.get('/wishlist')
        const ids = response.data.map((item: any) => item.product_id)
        setWishlist(new Set(ids))
      } catch (err) {
        console.error('Failed to load wishlist:', err)
      }
    }
    fetchWishlist()
  }, [isAuthenticated])

  const showToast = useCallback((text: string, isError = false) => {
    setToastMsg({ text, isError })
    setTimeout(() => setToastMsg(null), 3000)
  }, [])

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your cart', true)
      return
    }
    setAddingId(productId)
    try {
      await addToCart(productId, 1)
      showToast('Added to cart successfully! 🛒')
      setTimeout(() => navigate('/cart'), 700)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Could not add item', true)
    } finally {
      setAddingId(null)
    }
  }

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to add items to your wishlist', true)
      return
    }
    const isCurrentlyWishlisted = wishlist.has(productId)
    try {
      if (isCurrentlyWishlisted) {
        await api.delete(`/wishlist/${productId}`)
        setWishlist(prev => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
        showToast('Removed from wishlist')
      } else {
        await api.post('/wishlist', { product_id: productId })
        setWishlist(prev => {
          const next = new Set(prev)
          next.add(productId)
          return next
        })
        showToast('Added to wishlist! ❤️')
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update wishlist', true)
    }
  }

  // Filter + sort
  const filteredProducts = products
    .filter(p => {
      if (selectedCategory === 'All') return true
      if (selectedCategory === 'Deals') return (p.original_price && Number(p.price) < Number(p.original_price)) || p.is_featured
      return p.category === selectedCategory
    })
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price
        case 'price_desc': return b.price - a.price
        case 'name_asc': return a.name.localeCompare(b.name)
        default: return 0
      }
    })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  }

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'All'

  // Curated subsets for homepage sections
  const trendingProducts = products
    .filter((p) => getStarRating(p.id) >= 4.0)
    .slice(0, 8)

  const recommendedProducts = products
    .filter((p) => p.stock > 0)
    .slice(2, 6)

  const dealsProducts = products
    .filter((p) => p.id.charCodeAt(0) % 3 !== 0)
    .slice(0, 3)

  const newArrivals = [...products]
    .reverse()
    .slice(0, 8)

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      setSearchQuery(heroSearch)
      setSearchParams({ search: heroSearch.trim() })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true)
      showToast('Thank you for subscribing to our Newsletter! ✉️')
      setNewsletterEmail('')
    }
  }

  const getCategoryMeta = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'electronics':
        return { icon: <Cpu size={22} className="text-[#0F6FFF]" />, title: 'Electronics', subtitle: 'Smartphones & Laptops' }
      case 'home & kitchen':
        return { icon: <HomeIcon size={22} className="text-[#0F6FFF]" />, title: 'Home & Kitchen', subtitle: 'Furniture & Appliances' }
      case 'fashion':
        return { icon: <Shirt size={22} className="text-[#0F6FFF]" />, title: 'Fashion', subtitle: 'Clothing & Footwear' }
      case 'beauty':
        return { icon: <Sparkles size={22} className="text-[#0F6FFF]" />, title: 'Beauty', subtitle: 'Skincare & Grooming' }
      case 'sports & fitness':
        return { icon: <TrendingUp size={22} className="text-[#0F6FFF]" />, title: 'Sports & Fitness', subtitle: 'Equipment & Yoga' }
      case 'books':
        return { icon: <BookOpen size={22} className="text-[#0F6FFF]" />, title: 'Books', subtitle: 'Fiction & Academic' }
      case 'grocery':
        return { icon: <Apple size={22} className="text-[#0F6FFF]" />, title: 'Grocery', subtitle: 'Snacks & Beverages' }
      case 'office & stationery':
        return { icon: <PenTool size={22} className="text-[#0F6FFF]" />, title: 'Office & Stationery', subtitle: 'Printers & Stationery' }
      case 'deals':
        return { icon: <Sparkles size={22} className="text-[#14B8A6]" />, title: 'Deals', subtitle: 'Hot Promotions' }
      default:
        return { icon: <ShoppingBag size={22} className="text-[#0F6FFF]" />, title: cat, subtitle: 'Curated Collections' }
    }
  }

  return (
    <div className="min-h-[60vh] bg-[#F5F7FA]">
      {isFiltered ? (
        /* ==================== CATALOG MODE (Filtered Search / Category results) ==================== */
        <div className="w-full bg-[#F5F7FA] py-8 md:py-10">
          <section id="products-section" data-testid="products-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div id="electronics-section" className="absolute -top-10" />
          <div id="home-kitchen-section" className="absolute -top-10" />
          <div id="fashion-section" className="absolute -top-10" />
          <div id="sports-section" className="absolute -top-10" />
          <div id="helpcenter-section" className="absolute -top-10" />
          <div id="returnspolicy-section" className="absolute -top-10" />
          <div id="shippinginfo-section" className="absolute -top-10" />
          <div id="contactus-section" className="absolute -top-10" />
          <div id="signin-section" className="absolute -top-10" />
          <div id="createaccount-section" className="absolute -top-10" />
          <div id="myorders-section" className="absolute -top-10" />
          <div id="cart-section" className="absolute -top-10" />
          {/* Horizontal Category Chips Carousel */}
          {!isStaff && (
            <div className="w-full mb-8">
              <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none select-none">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      data-testid={`category-chip-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleCategorySelect(cat)}
                      className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all border whitespace-nowrap shadow-xs hover:shadow-sm ${
                        isActive
                          ? 'bg-[#0F6FFF] border-[#0F6FFF] text-white hover:bg-[#0D5ED9]'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Centered Main Layout Block */}
          <div className="w-full bg-white rounded-3xl border border-slate-200/50 p-6 md:p-8 shadow-xs">
            {/* Header Info & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-8">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight capitalize">
                  {selectedCategory === 'All' ? 'Search Results' : selectedCategory}
                </h2>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                  {loading ? 'Refreshing items...' : `${filteredProducts.length} items found`}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Unified Filter Toggle Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs hover:shadow-sm transition-all"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    data-testid="sort-select"
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      scrollToElementWithOffset('products-section', 95)
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/25 transition-all shadow-xs"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div data-testid="product-loading-skeleton" data-loading="true" className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 flex flex-col gap-3">
                    <div className="aspect-square skeleton rounded-xl" />
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                    <div className="skeleton h-7 rounded w-full mt-2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div data-testid="no-products-message" className="text-center py-16 bg-white">
                <Search size={32} className="text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 mb-1">No products found</h3>
                <p className="text-slate-400 text-xs mb-4">Try clearing filters or checking spelling.</p>
                <button
                  data-testid="clear-filters-btn"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setSearchParams({})
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="px-4 py-2 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                data-testid="products-grid"
                data-loading="false"
                className="grid grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => {
                    const rating = getStarRating(product.id)
                    const reviewCount = getReviewCount(product.id)
                    const isWishlisted = wishlist.has(product.id)
                    const discount = Math.floor((product.id.charCodeAt(0) % 3) * 10 + 10)
                    const hasDiscount = product.id.charCodeAt(0) % 3 !== 0
                    const originalPrice = hasDiscount ? product.price / (1 - discount / 100) : null

                    return (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        layout
                        data-testid={`product-card-${product.id}`}
                        data-product-id={product.id}
                        data-category={product.category}
                        data-price={product.price}
                        data-stock={product.stock}
                        className="bg-white border border-slate-200/60 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-3 md:p-4 flex flex-col group relative"
                      >
                        {/* Rating Star Badge on Top Right */}
                        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/60 flex items-center gap-1 shadow-xs z-10">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-extrabold text-slate-750">{rating.toFixed(1)}</span>
                        </div>

                        {/* Wishlist Button on Top Left */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          data-testid={`wishlist-button-${product.id}`}
                          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          className="absolute top-6 left-6 w-7 h-7 rounded-full bg-white/90 border border-slate-200/60 shadow-xs flex items-center justify-center text-[#0F6FFF] hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <Heart size={13} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                        </button>

                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden mb-4 bg-slate-50/50 rounded-2xl flex items-center justify-center border border-slate-100/55">
                          <Link to={`/product/${product.id}`} data-testid={`product-link-${product.id}`} title={`View ${product.name}`} className="block w-full h-full">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              data-testid={`product-image-${product.id}`}
                              className="object-contain w-full h-full p-2 group-hover:scale-102 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                              }}
                            />
                          </Link>

                          {/* Sold Out Badge */}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="px-2 py-1 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-2xl shadow-xs">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product info details */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            {/* Product Title */}
                            <Link to={`/product/${product.id}`} className="block">
                              <h3 data-testid={`product-name-${product.id}`} className="font-bold text-slate-800 text-sm hover:text-[#0F6FFF] transition-colors line-clamp-2 leading-snug">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Rating badge & reviews */}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="rating-badge text-[10px]">
                                {rating.toFixed(1)} ★
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ({reviewCount})
                              </span>
                            </div>
                          </div>

                          <div className="mt-4">
                            {/* Price Row */}
                            <div className="flex items-baseline flex-wrap gap-1">
                              <span data-testid={`product-price-${product.id}`} className="text-sm font-extrabold text-slate-900">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              {originalPrice && (
                                <>
                                  <span className="text-[10px] text-slate-400 line-through">
                                    ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[10px] font-bold text-accent-500 bg-accent-50/60 px-1.5 py-0.5 rounded-md">
                                    {discount}% off
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Add to Cart button */}
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              data-testid={`add-to-cart-${product.id}`}
                              aria-label={`Add ${product.name} to cart`}
                              title={product.stock === 0 ? 'Out of stock' : `Add ${product.name} to cart`}
                              disabled={product.stock === 0 || addingId === product.id}
                              className={`w-full mt-4 py-2 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 ${
                                product.stock === 0
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : addingId === product.id
                                  ? 'bg-blue-300 text-white cursor-wait'
                                  : 'bg-[#0F6FFF] text-white hover:bg-[#0D5ED9] shadow-xs active:scale-[0.99]'
                              }`}
                            >
                              <ShoppingCart size={12} />
                              {addingId === product.id ? 'Adding' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>
        </div>
      ) : (
        <div className="relative">
          <div id="signin-section" className="absolute top-0" />
          <div id="createaccount-section" className="absolute top-0" />
          <div id="myorders-section" className="absolute top-0" />
          <div id="cart-section" className="absolute top-0" />
          <div className="w-full">
            {/* 1. Hero Section */}
            <HeroSlider />

          {/* 2. Featured Categories */}
          <div className="w-full bg-[#F5F7FA] py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none relative">
              <div id="products-section" className="absolute -top-10" />
              <div id="electronics-section" className="absolute -top-10" />
              <div id="home-kitchen-section" className="absolute -top-10" />
              <div id="fashion-section" className="absolute -top-10" />
              <div id="sports-section" className="absolute -top-10" />
              <div className="text-left mb-4">
                <h2 className="text-xs uppercase tracking-widest text-[#0F6FFF] font-black">Categories</h2>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Shop Curated Hardware</h3>
              </div>

              <div className="flex items-center gap-5 overflow-x-auto pb-4 scrollbar-none md:grid md:grid-cols-4 lg:grid-cols-5 md:gap-5">
              {categories
                .filter((c) => c !== 'All')
                .map((cat) => {
                  const meta = getCategoryMeta(cat)
                  let bgImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80'
                  let gradient = 'from-slate-900/40 to-slate-950/80'

                  switch (cat.toLowerCase()) {
                    case 'electronics':
                      bgImage = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-blue-950/40 to-slate-950/85'
                      break
                    case 'home & kitchen':
                      bgImage = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-orange-950/40 to-slate-950/85'
                      break
                    case 'fashion':
                      bgImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-pink-950/40 to-slate-950/85'
                      break
                    case 'beauty':
                      bgImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-rose-950/40 to-slate-950/85'
                      break
                    case 'sports & fitness':
                      bgImage = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-emerald-950/40 to-slate-950/85'
                      break
                    case 'books':
                      bgImage = 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-amber-950/40 to-slate-950/85'
                      break
                    case 'grocery':
                      bgImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-green-950/40 to-slate-950/85'
                      break
                    case 'office & stationery':
                      bgImage = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-slate-900/40 to-slate-950/85'
                      break
                    case 'deals':
                      bgImage = 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=400&q=80'
                      gradient = 'from-cyan-950/40 to-slate-950/85'
                      break
                  }

                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="flex-shrink-0 w-44 md:w-auto h-40 rounded-3xl overflow-hidden relative group shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/10 text-left"
                    >
                      {/* Category Background Image */}
                      <img
                        src={bgImage}
                        alt={cat}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />

                      {/* Content panel */}
                      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                        {/* Icon badge with glassmorphism */}
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-[#0F6FFF]/20 transition-all duration-300">
                          {React.cloneElement(meta.icon as React.ReactElement, { className: 'text-white w-5 h-5' })}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-wider">{meta.title}</h4>
                          <p className="text-[10px] text-slate-350 font-bold mt-0.5">{meta.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          </section>
          </div>

          {/* 3. Trending Products (Swiper carousel) */}
          <div className="w-full bg-white border-y border-slate-100 py-8 md:py-10">
            <section id="trending-carousel" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none relative">
              <div className="flex items-end justify-between mb-4">
                <div className="text-left">
                  <h2 className="text-xs uppercase tracking-widest text-[#0F6FFF] font-black">Trending</h2>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">Selected Highlights</h3>
                </div>
                {/* Carousel navigation controls */}
                <div className="flex items-center gap-2">
                  <button
                    className="trending-prev w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 shadow-2xs transition-colors hover:border-[#0F6FFF] hover:text-[#0F6FFF] disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    className="trending-next w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 shadow-2xs transition-colors hover:border-[#0F6FFF] hover:text-[#0F6FFF] disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            {/* Swiper slider container */}
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              navigation={{
                prevEl: '.trending-prev',
                nextEl: '.trending-next',
              }}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-8"
            >
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <SwiperSlide key={i}>
                    <div className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 flex flex-col gap-3 animate-pulse">
                      <div className="aspect-square bg-slate-100 rounded-xl" />
                      <div className="skeleton h-4 rounded w-3/4" />
                      <div className="skeleton h-7 rounded w-full mt-2" />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                trendingProducts.map((product) => {
                  const rating = getStarRating(product.id)
                  const isWishlisted = wishlist.has(product.id)
                  return (
                    <SwiperSlide key={product.id} className="h-auto">
                      <div
                        className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 hover:shadow-md hover:border-slate-250 transition-all duration-200 flex flex-col justify-between relative group shadow-2xs h-full"
                      >
                        {/* Rating Star Badge */}
                        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/60 flex items-center gap-1 shadow-xs z-10">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-extrabold text-slate-750">{rating.toFixed(1)}</span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-6 left-6 w-7 h-7 rounded-full bg-white/90 border border-slate-200/60 shadow-xs flex items-center justify-center text-[#0F6FFF] hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <Heart size={13} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                        </button>

                        <div>
                          <div className="aspect-square bg-slate-50/50 flex items-center justify-center rounded-xl overflow-hidden p-2 relative border border-slate-100/50 mb-3">
                            <Link to={`/product/${product.id}`} className="block w-full h-full">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-contain w-full h-full group-hover:scale-102 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                                }}
                              />
                            </Link>
                          </div>
                          <Link to={`/product/${product.id}`} className="block">
                            <h4 className="font-bold text-xs text-slate-800 hover:text-[#0F6FFF] line-clamp-2 leading-relaxed">
                              {product.name}
                            </h4>
                          </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0 || addingId === product.id}
                            className="px-3.5 py-1.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all shadow-xs active:scale-95 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </SwiperSlide>
                  )
                })
              )}
            </Swiper>
          </section>
          </div>

          {/* 4. Featured Collection */}
          <div className="w-full bg-[#F5F7FA] py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
              <div className="grid md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 border border-slate-800 shadow-lg min-h-[220px] flex flex-col justify-between group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(15,111,255,0.15),transparent)]" />
                <div className="relative z-10 max-w-sm space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#0F6FFF] font-black">Design Spotlight</span>
                  <h4 className="text-xl sm:text-2xl font-black leading-tight">Minimalist Audio Elite</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">Experience pristine audio fidelity with our premium, industrial design soundwear.</p>
                </div>
                <div className="relative z-10 pt-4">
                  <button
                    onClick={() => setSelectedCategory('Electronics')}
                    className="px-5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Explore Electronics
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 border border-slate-800 shadow-lg min-h-[220px] flex flex-col justify-between group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.12),transparent)]" />
                <div className="relative z-10 max-w-sm space-y-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#14B8A6] font-black">Hardware Curation</span>
                  <h4 className="text-xl sm:text-2xl font-black leading-tight">Elite Workspace Ecosystem</h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">Transform your daily desk setup with ergonomic hardware and connectivity nodes.</p>
                </div>
                <div className="relative z-10 pt-4">
                  <button
                    onClick={() => setSelectedCategory('Electronics')}
                    className="px-5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Shop Hardware
                  </button>
                </div>
              </div>
            </div>
          </section>
          </div>

          {/* 5. AI Recommendations Section */}
          <div className="w-full bg-white border-y border-slate-100 py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
              <div className="text-left mb-4">
                <h2 className="text-xs uppercase tracking-widest text-[#0F6FFF] font-black">For You</h2>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Recommended for You</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {loading
                ? [...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 flex flex-col gap-3 animate-pulse">
                      <div className="aspect-square bg-slate-100 rounded-xl" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                    </div>
                  ))
                : recommendedProducts.map((product) => {
                    const rating = getStarRating(product.id)
                    const isWishlisted = wishlist.has(product.id)
                    return (
                      <div
                        key={product.id}
                        className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 hover:shadow-md hover:border-slate-250 transition-all duration-200 flex flex-col justify-between group relative shadow-2xs"
                      >
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-6 left-6 w-7 h-7 rounded-full bg-white/90 border border-slate-200/60 shadow-xs flex items-center justify-center text-[#0F6FFF] hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <Heart size={13} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                        </button>

                        <div>
                          <div className="aspect-square bg-slate-50/50 flex items-center justify-center rounded-xl overflow-hidden p-2 relative border border-slate-100/50 mb-3">
                            <Link to={`/product/${product.id}`} className="block w-full h-full">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-contain w-full h-full group-hover:scale-102 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                                }}
                              />
                            </Link>
                          </div>
                          <Link to={`/product/${product.id}`} className="block">
                            <h4 className="font-bold text-xs text-slate-800 hover:text-[#0F6FFF] line-clamp-2 leading-relaxed">
                              {product.name}
                            </h4>
                          </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
                          <span className="text-xs font-extrabold text-slate-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0 || addingId === product.id}
                            className="px-3 py-1 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )
                  })}
            </div>
          </section>
          </div>

          {/* 6. Deals of the Day */}
          <div className="w-full bg-[#F5F7FA] py-6">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
              <div className="bg-slate-900 rounded-[32px] p-6 md:p-10 border border-slate-800 text-white flex flex-col lg:flex-row items-center gap-10 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.1),transparent)]" />
              
              {/* Countdown panel */}
              <div className="lg:w-1/3 text-left space-y-4 relative z-10">
                <span className="px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 text-[9px] font-extrabold uppercase tracking-widest inline-block">
                  Limited Offers
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">Deals of the Day</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Elite hardware configuration deals expiring soon. Free delivery across India.
                </p>
                {/* Live ticking timer display */}
                <div className="flex items-center gap-2 pt-2 text-slate-100 font-mono">
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center shadow-xs">
                    <span className="block text-sm font-extrabold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase font-sans">Hrs</span>
                  </div>
                  <span className="text-sm font-bold">:</span>
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center shadow-xs">
                    <span className="block text-sm font-extrabold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase font-sans">Min</span>
                  </div>
                  <span className="text-sm font-bold">:</span>
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-center shadow-xs">
                    <span className="block text-sm font-extrabold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] text-slate-400 uppercase font-sans">Sec</span>
                  </div>
                </div>
              </div>

              {/* Promo deals cards carousel */}
              <div className="flex-1 w-full relative z-10 overflow-hidden">
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={16}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                  className="deals-swiper pb-4"
                >
                  {dealsProducts.map((p) => {
                    const discount = Math.floor((p.id.charCodeAt(0) % 3) * 10 + 10)
                    return (
                      <SwiperSlide key={p.id}>
                        <div
                          className="bg-white border border-slate-200/10 rounded-2xl p-3 md:p-4 flex flex-col justify-between relative group shadow-md text-slate-800 h-full"
                        >
                          {/* Sale badge */}
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm">
                            {discount}% OFF
                          </div>

                          <div>
                            <div className="aspect-square bg-slate-50 flex items-center justify-center rounded-xl overflow-hidden p-2 mb-3 border border-slate-100">
                              <Link to={`/product/${p.id}`} className="block w-full h-full">
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="object-contain w-full h-full group-hover:scale-102 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                                  }}
                                />
                              </Link>
                            </div>
                            <Link to={`/product/${p.id}`} className="block">
                              <h4 className="font-bold text-xs text-slate-800 hover:text-[#0F6FFF] line-clamp-2 leading-relaxed">
                                {p.name}
                              </h4>
                            </Link>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-sm font-black text-slate-900">₹{p.price.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => handleAddToCart(p.id)}
                              className="px-3 py-1.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-[9px] font-extrabold rounded-lg uppercase tracking-wider transition-colors shadow-xs"
                            >
                              Buy
                            </button>
                          </div>
                        </div>
                      </SwiperSlide>
                    )
                  })}
                </Swiper>
              </div>
            </div>
          </section>
          </div>

          {/* 7. New Arrivals */}
          <div className="w-full bg-white border-y border-slate-100 py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none relative">
              <div className="flex items-end justify-between mb-4">
                <div className="text-left">
                  <h2 className="text-xs uppercase tracking-widest text-[#0F6FFF] font-black">Fresh</h2>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">New Arrivals</h3>
                </div>
              {/* Carousel navigation controls */}
              <div className="flex items-center gap-2">
                <button
                  className="arrivals-prev w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 shadow-2xs transition-colors hover:border-[#0F6FFF] hover:text-[#0F6FFF] disabled:opacity-40"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  className="arrivals-next w-8 h-8 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 shadow-2xs transition-colors hover:border-[#0F6FFF] hover:text-[#0F6FFF] disabled:opacity-40"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Swiper container with autoplay */}
            <Swiper
              modules={[Autoplay, Navigation, Pagination, A11y]}
              navigation={{
                prevEl: '.arrivals-prev',
                nextEl: '.arrivals-next',
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-8"
            >
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <SwiperSlide key={i}>
                    <div className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 flex flex-col gap-3 animate-pulse">
                      <div className="aspect-square bg-slate-100 rounded-xl" />
                      <div className="skeleton h-4 rounded w-3/4" />
                      <div className="skeleton h-7 rounded w-full mt-2" />
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                newArrivals.map((product) => {
                  const rating = getStarRating(product.id)
                  const isWishlisted = wishlist.has(product.id)
                  return (
                    <SwiperSlide key={product.id} className="h-auto">
                      <div
                        className="bg-white border border-slate-200/50 rounded-2xl p-3 md:p-4 hover:shadow-md hover:border-slate-250 transition-all duration-200 flex flex-col justify-between relative group shadow-2xs h-full"
                      >
                        {/* Rating Star Badge */}
                        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/60 flex items-center gap-1 shadow-xs z-10">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-extrabold text-slate-750">{rating.toFixed(1)}</span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-6 left-6 w-7 h-7 rounded-full bg-white/90 border border-slate-200/60 shadow-xs flex items-center justify-center text-[#0F6FFF] hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <Heart size={13} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                        </button>

                        <div>
                          <div className="aspect-square bg-slate-50/50 flex items-center justify-center rounded-xl overflow-hidden p-2 relative border border-slate-100/55 mb-3">
                            <Link to={`/product/${product.id}`} className="block w-full h-full">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="object-contain w-full h-full group-hover:scale-102 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                                }}
                              />
                            </Link>
                          </div>
                          <Link to={`/product/${product.id}`} className="block">
                            <h4 className="font-bold text-xs text-slate-800 hover:text-[#0F6FFF] line-clamp-2 leading-relaxed">
                              {product.name}
                            </h4>
                          </Link>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0 || addingId === product.id}
                            className="px-3.5 py-1.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all shadow-xs active:scale-95 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </SwiperSlide>
                  )
                })
              )}
            </Swiper>
          </section>
          </div>

          {/* 8. Our Philosophy */}
          <div className="w-full bg-[#F5F7FA] py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none relative">
              <div id="helpcenter-section" className="absolute -top-10" />
              <div id="returnspolicy-section" className="absolute -top-10" />
              <div id="shippinginfo-section" className="absolute -top-10" />
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
                <h2 className="text-xs uppercase tracking-widest text-[#0F6FFF] font-black">Our Philosophy</h2>
                <h3 className="text-2xl font-black text-slate-900">Redefining Shopping Aesthetics</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                At Sarathi Store, we believe products should be beautiful, functional, and reliable. We partner with elite creators to deliver certified quality without friction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0F6FFF]">
                  <Shield size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Curated Standards</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Every device is vetted by our hardware configuration experts for design compliance, quality metrics, and operational performance.
                </p>
              </div>

              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0F6FFF]">
                  <Truck size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Frictionless Logistics</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Direct logistics networks ensure secure transit, real-time updates, and elite boxing delivered straight to your door.
                </p>
              </div>

              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0F6FFF]">
                  <Headset size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Dedicated Helpdesk</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Access a highly responsive customer support line for warranty queries, order tracking, and instant shopping assistance.
                </p>
              </div>
            </div>
          </section>
          </div>

          {/* 9. Testimonials and Ratings */}
          <div className="w-full bg-white border-y border-slate-100 py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-left space-y-2">
                <div className="inline-flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">Approved by Elite Creators</h3>
                <p className="text-xs text-slate-550 font-semibold leading-relaxed">
                  Join thousands of tech leaders, designers, and home organizers upgrading their hardware setup.
                </p>
              </div>

              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                <Quote size={20} className="text-[#0F6FFF]/30" />
                <p className="text-xs text-slate-650 leading-relaxed font-semibold italic">
                  "The shopping experience is seamless. Highly curated list of appliances and electronics. The delivery was fast and the boxing was extremely premium."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    AD
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      Anuj D. <CheckCircle2 size={10} className="text-emerald-500" />
                    </h5>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verified Tech Buyer</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-4">
                <Quote size={20} className="text-[#0F6FFF]/30" />
                <p className="text-xs text-slate-650 leading-relaxed font-semibold italic">
                  "I love the clean interface of Sarathi. No confusing clutter or ads, just high-quality products. Added multiple items to my wishlist and bought them easily!"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    SS
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      Siddharth S. <CheckCircle2 size={10} className="text-emerald-500" />
                    </h5>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verified Pro Organiser</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          </div>

          {/* Brands Showcase */}
          <div className="w-full bg-[#F5F7FA] border-y border-slate-150/40 py-6 overflow-hidden select-none">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Premium Brands We Showcase
              </span>
            </div>
            <div className="relative w-full flex items-center overflow-x-hidden">
              <div className="flex gap-16 whitespace-nowrap animate-marquee text-slate-400 font-sans">
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">APPLE</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">SAMSUNG</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">SONY</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">BOSE</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">NINTENDO</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">LOGITECH</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">DELL</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">HP</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">CANON</span>
                {/* Duplicated for seamless loop */}
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">APPLE</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">SAMSUNG</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">SONY</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">BOSE</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">NINTENDO</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">LOGITECH</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">DELL</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">HP</span>
                <span className="text-xl font-black tracking-widest hover:text-[#0F6FFF] transition-colors cursor-default">CANON</span>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="w-full bg-white py-8 md:py-10">
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 select-none relative">
              <div id="contactus-section" className="absolute -top-10" />
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[32px] p-8 md:p-10 text-center text-white space-y-6 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(15,111,255,0.08),transparent)]" />
              <div className="max-w-md mx-auto space-y-2 relative z-10">
                <h3 className="text-xl sm:text-2xl font-black">Join the Elite Circle</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Subscribe to receive early releases, member-only deals, and elite configuration updates.
                </p>
              </div>

              {newsletterSubscribed ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold uppercase tracking-wider max-w-sm mx-auto"
                >
                  ✓ Subscribed Successfully! Check your inbox soon.
                </motion.div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="relative max-w-md w-full bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 flex items-center shadow-lg focus-within:border-white/20 transition-all mx-auto relative z-10"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-slate-450 px-3.5 py-2.5"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Subscribe</span>
                    <Send size={12} />
                  </button>
                </form>
              )}
            </div>
          </section>
          </div>
          </div>
        </div>
      )}

      {/* Collapsible Sliding Filter Drawer Panel */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-md z-50 shadow-2xl border-l border-slate-200/80 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <span className="text-base font-extrabold text-slate-800 uppercase tracking-wide">Filters</span>
                <div className="flex items-center gap-3">
                  {isFiltered && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('All')
                        setMobileFiltersOpen(false)
                      }}
                      className="text-xs font-bold text-[#0F6FFF] hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Filters content inside drawer */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Search</h4>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0F6FFF] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">Categories</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          data-testid={`category-checkbox-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                          checked={selectedCategory === cat}
                          onChange={() => {
                            handleCategorySelect(cat)
                            setMobileFiltersOpen(false)
                          }}
                          className="w-4 h-4 border-slate-355 rounded text-[#0F6FFF] focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs transition-colors ${selectedCategory === cat ? 'text-[#0F6FFF] font-bold' : 'text-slate-600 group-hover:text-slate-800'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3">Sort by</h4>
                  <div className="space-y-3">
                    {SORT_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group select-none">
                        <input
                          type="radio"
                          name="sortByMobile"
                          data-testid={`sort-radio-${opt.value}`}
                          checked={sortBy === opt.value}
                          onChange={() => {
                            setSortBy(opt.value)
                            setMobileFiltersOpen(false)
                            scrollToElementWithOffset('products-section', 95)
                          }}
                          className="w-4 h-4 border-slate-355 text-[#0F6FFF] focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs transition-colors ${sortBy === opt.value ? 'text-[#0F6FFF] font-bold' : 'text-slate-600 group-hover:text-slate-800'}`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clean Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            data-testid="toast-notification"
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-sm border shadow-lg max-w-xs ${
              toastMsg.isError ? 'border-red-200 bg-red-50 text-red-800' : 'border-blue-200 bg-blue-50 text-blue-900'
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
