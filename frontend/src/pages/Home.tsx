import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShoppingCart, Search, X, SlidersHorizontal,
  Star, Heart, TrendingUp, Shield, Truck, Headset,
  Cpu, Laptop, Headphones, Watch, Gamepad2, Camera,
  Home as HomeIcon, Smartphone, Sparkles, Package,
  ChevronDown, ChevronUp, Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useCart, Product } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { HeroSlider } from '../components/HeroSlider'

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

  // Collapsible sidebar sections
  const [catCollapse, setCatCollapse] = useState(false)
  const [priceCollapse, setPriceCollapse] = useState(false)
  const [sortCollapse, setSortCollapse] = useState(false)
  
  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { addToCart } = useCart()
  const { user, isAuthenticated, isAdmin, isShopOwner, isDeliveryPartner } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Redirect users with special roles to their dashboards
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true })
      } else if (isShopOwner) {
        navigate('/seller/dashboard', { replace: true })
      } else if (isDeliveryPartner) {
        navigate('/delivery/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, isShopOwner, isDeliveryPartner, navigate])

  // Sync search and category from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) setSearchQuery(urlSearch)

    const urlCat = searchParams.get('category')
    if (urlCat) {
      if (urlCat.toLowerCase() === 'deals') {
        setSelectedCategory('Deals')
      } else {
        const matched = categories.find(c => c.toLowerCase() === urlCat.toLowerCase())
        if (matched) setSelectedCategory(matched)
      }
    } else {
      setSelectedCategory('All')
    }
  }, [searchParams, categories])

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
      if (selectedCategory === 'Deals') return p.id.charCodeAt(0) % 3 !== 0
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

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-16">
      {/* Hero promo slider banner */}
      {!isFiltered && (
        <div className="w-full bg-white pb-4">
          <HeroSlider />
        </div>
      )}

      {/* Main product listing container */}
      <section id="products" data-testid="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Mobile Filter Button */}
        <div className="flex lg:hidden items-center justify-between bg-white p-3 rounded-sm shadow-xs mb-4">
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2874F0] text-white rounded-sm text-xs font-semibold"
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          
          {/* LEFT SIDEBAR: Collapsible Flipkart Filters (Desktop) */}
          <aside data-testid="filters-sidebar" className="hidden lg:block w-60 bg-white rounded-sm shadow-xs border border-slate-200/60 p-4 space-y-5 flex-shrink-0">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Filters</h3>
              {isFiltered && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                  className="text-xs font-bold text-[#2874F0] hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Collapsible Search */}
            <div className="border-b border-slate-100 pb-4">
              <button
                onClick={() => setSortCollapse(!sortCollapse)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2"
              >
                <span>Search</span>
                {sortCollapse ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!sortCollapse && (
                <div className="relative mt-2">
                  <input
                    type="text"
                    name="catalogSearch"
                    data-testid="catalog-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    title="Search within product catalog"
                    aria-label="Catalog search"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2874F0] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      data-testid="catalog-search-clear"
                      aria-label="Clear search"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Categories */}
            <div className="border-b border-slate-100 pb-4">
              <button
                onClick={() => setCatCollapse(!catCollapse)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2"
              >
                <span>Categories</span>
                {catCollapse ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!catCollapse && (
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat
                    return (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          name={`category-${cat}`}
                          data-testid={`category-checkbox-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                          checked={isActive}
                          onChange={() => setSelectedCategory(cat)}
                          className="w-4 h-4 border-slate-300 rounded-sm text-[#2874F0] focus:ring-0 cursor-pointer"
                        />
                        <span className={`text-xs ${isActive ? 'text-[#2874F0] font-bold' : 'text-slate-600 hover:text-slate-800'}`}>
                          {cat}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Collapsible Price Sorting */}
            <div>
              <button
                onClick={() => setPriceCollapse(!priceCollapse)}
                className="w-full flex items-center justify-between text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2"
              >
                <span>Sort by Price</span>
                {priceCollapse ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!priceCollapse && (
                <div className="space-y-2 mt-2">
                  {SORT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="sortByRadio"
                        data-testid={`sort-radio-${opt.value}`}
                        checked={sortBy === opt.value}
                        onChange={() => setSortBy(opt.value)}
                        className="w-4 h-4 border-slate-300 text-[#2874F0] focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs ${sortBy === opt.value ? 'text-[#2874F0] font-bold' : 'text-slate-600 hover:text-slate-800'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* RIGHT SIDE: Product Grid & Results Header */}
          <div className="flex-1 w-full bg-white rounded-sm border border-slate-200/60 p-4">
            
            {/* Header info bar */}
            <div className="hidden lg:flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 capitalize">
                  {selectedCategory === 'All' ? 'Featured Collection' : selectedCategory}
                </h2>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  {loading ? 'Refreshing items...' : `${filteredProducts.length} items found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  data-testid="sort-select"
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-sm text-xs font-bold text-slate-700 focus:outline-none"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div data-testid="product-loading-skeleton" data-loading="true" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-sm p-3 flex flex-col gap-3">
                    <div className="aspect-square skeleton rounded-sm" />
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
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                  className="px-4 py-2 bg-[#2874F0] hover:bg-[#1e5ecb] text-white text-xs font-bold rounded-sm shadow-xs transition-colors"
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
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => {
                    const rating = getStarRating(product.id)
                    const reviewCount = getReviewCount(product.id)
                    const isWishlisted = wishlist.has(product.id)
                    const discount = Math.floor((product.id.charCodeAt(0) % 3) * 10 + 10) // 10-30%
                    const hasDiscount = product.id.charCodeAt(0) % 3 !== 0
                    const originalPrice = hasDiscount ? (product.price / (1 - discount / 100)) : null

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
                        className="bg-white border border-slate-100 rounded-sm hover:shadow-md transition-all duration-150 p-2.5 flex flex-col group relative"
                      >
                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          data-testid={`wishlist-button-${product.id}`}
                          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/80 border border-slate-200/60 shadow-xs flex items-center justify-center text-[#2874F0] hover:scale-105 active:scale-95 transition-all z-10"
                        >
                          <Heart size={14} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
                        </button>

                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden mb-3 bg-slate-50 rounded-sm flex items-center justify-center">
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
                              <span className="px-2 py-1 bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-xs">
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
                              <h3 data-testid={`product-name-${product.id}`} className="font-semibold text-slate-800 text-xs hover:text-[#2874F0] transition-colors line-clamp-2 leading-relaxed">
                                {product.name}
                              </h3>
                            </Link>

                            {/* Rating badge & reviews */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="rating-badge text-[10px]">
                                {rating.toFixed(1)} ★
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ({reviewCount})
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
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
                                  <span className="text-[10px] font-bold text-[#388E3C]">
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
                              className={`w-full mt-3 py-1.5 text-xs font-semibold rounded-sm tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 ${
                                product.stock === 0
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : addingId === product.id
                                  ? 'bg-blue-300 text-white cursor-wait'
                                  : 'bg-[#2874F0] text-white hover:bg-[#1e5ecb] shadow-xs active:scale-[0.99]'
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
        </div>
      </section>

      {/* Mobile Filters Drawer Panel */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <span className="text-sm font-bold text-slate-800 uppercase">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-slate-500 hover:text-slate-800">
                  <X size={18} />
                </button>
              </div>

              {/* Filters content inside mobile drawer */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Search</h4>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm text-xs"
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Categories</h4>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          data-testid={`mobile-category-checkbox-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                          checked={selectedCategory === cat}
                          onChange={() => { setSelectedCategory(cat); setMobileFiltersOpen(false) }}
                          className="w-4 h-4 border-slate-300 rounded-sm text-[#2874F0] focus:ring-0"
                        />
                        <span className={`text-xs ${selectedCategory === cat ? 'text-[#2874F0] font-bold' : 'text-slate-600'}`}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Sort by</h4>
                  <div className="space-y-2.5">
                    {SORT_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sortByMobile"
                          data-testid={`mobile-sort-radio-${opt.value}`}
                          checked={sortBy === opt.value}
                          onChange={() => { setSortBy(opt.value); setMobileFiltersOpen(false) }}
                          className="w-4 h-4 border-slate-300 text-[#2874F0] focus:ring-0"
                        />
                        <span className={`text-xs ${sortBy === opt.value ? 'text-[#2874F0] font-bold' : 'text-slate-600'}`}>
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
