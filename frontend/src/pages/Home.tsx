import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShoppingCart, Eye, Search, X, SlidersHorizontal,
  Zap, Star, Heart, TrendingUp, Shield, Truck, Headset,
  Cpu, Laptop, Headphones, Watch, Gamepad2, Camera,
  Home as HomeIcon, Smartphone,
  ArrowRight, Sparkles, Package
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import { useCart, Product } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Sparkles size={14} />,
  Deals: <TrendingUp size={14} className="text-rose-500 animate-pulse" />,
  Smartphones: <Smartphone size={14} />,
  Laptops: <Laptop size={14} />,
  Audio: <Headphones size={14} />,
  Wearables: <Watch size={14} />,
  Gaming: <Gamepad2 size={14} />,
  Cameras: <Camera size={14} />,
  'Smart Home': <HomeIcon size={14} />,
  Electronics: <Cpu size={14} />,
  Accessories: <Zap size={14} />,
}

const HERO_STATS = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '5K+', label: 'Products' },
  { value: '4.9★', label: 'Avg Rating' },
  { value: '99%', label: 'Satisfaction' },
]

const TRUST_FEATURES = [
  { icon: <Truck size={18} />, label: 'Free Shipping', sub: 'On orders over ₹999' },
  { icon: <Shield size={18} />, label: 'Secure Payments', sub: 'SSL protected' },
  { icon: <Headset size={18} />, label: '24/7 Support', sub: 'Always here to help' },
  { icon: <Package size={18} />, label: 'Easy Returns', sub: '30-day policy' },
]

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

const StarDisplay: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={i < full ? 'text-amber-400' : i === full && half ? 'text-amber-400' : 'text-slate-200'}
            fill={i < full ? '#fbbf24' : i === full && half ? '#fbbf24' : 'none'}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-slate-400 ml-0.5 font-medium">({count})</span>
      )}
    </div>
  )
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

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
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
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 16 } }
  }

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'All'

  return (
    <div className="min-h-screen pb-16">
      {/* ========== HERO SECTION (RETRO-POP / CRAV-INSPIRED) ========== */}
      {!isFiltered && (
        <>
          <section className="relative overflow-hidden bg-[#FAF6EE] border-b-3 border-[#1D1C1A] pt-14 pb-20">
        {/* Retro dots grid background */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#1D1C1A 2px, transparent 2px)', 
            backgroundSize: '24px 24px' 
          }} 
        />
        
        {/* Giant Outlined Backdrop Text - Matches "THE BURGER" layout */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6.5rem] sm:text-[11rem] lg:text-[15rem] font-black tracking-tighter leading-none select-none pointer-events-none text-transparent z-0 opacity-[0.12] whitespace-nowrap" style={{ WebkitTextStroke: '4px #E1392A' }}>
          THE GADGET
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            
            {/* LEFT: Text & Stats */}
            <div className="flex-1 space-y-8 text-center lg:text-left z-10">
              <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-[#F5B025] text-[#1D1C1A] border-3 border-[#1D1C1A] shadow-[3px_3px_0px_0px_#1D1C1A] mb-2 uppercase tracking-wider">
                  <TrendingUp size={12} />
                  {isAuthenticated ? `Welcome Back, ${user?.full_name || 'Valued Member'}!` : '🔥 TRENDING NOW · SUMMER 2026'}
                </span>
              </div>

              <div className="opacity-0 animate-fade-in-up delay-75" style={{ animationFillMode: 'forwards' }}>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.98] uppercase text-[#1D1C1A]">
                  {isAuthenticated ? (
                    <>
                      YOUR ELITE
                      <br />
                      <span className="text-[#E1392A]">
                        SHOPPING DECK
                      </span>
                    </>
                  ) : (
                    <>
                      DISCOVER THE
                      <br />
                      <span className="text-[#E1392A]">
                        FUTURE OF LIVING
                      </span>
                    </>
                  )}
                </h1>
              </div>

              <div className="opacity-0 animate-fade-in-up delay-150" style={{ animationFillMode: 'forwards' }}>
                <p className="text-[#615E59] text-base sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 font-bold">
                  {isAuthenticated 
                    ? 'Explore your curated member catalog. Enjoy exclusive pricing, active rewards, and lightning-fast checkout.' 
                    : 'Curated premium gadgets, smart home devices, and lifestyle tech—engineered for the modern connoisseur.'}
                </p>
              </div>

              <div className="opacity-0 animate-fade-in-up delay-225" style={{ animationFillMode: 'forwards' }}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-primary text-base px-8 py-4 uppercase font-black tracking-wider flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    {isAuthenticated ? 'Browse Catalog' : 'Explore Collection'}
                  </button>
                  {isAuthenticated ? (
                    <Link to="/orders" className="btn-secondary text-base px-8 py-4 uppercase font-black tracking-wider flex items-center justify-center gap-2">
                      Track My Orders
                      <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <Link to="/register" className="btn-secondary text-base px-8 py-4 uppercase font-black tracking-wider flex items-center justify-center gap-2">
                      Join Elite Club
                      <ArrowRight size={18} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats - Glowing Tactile Pods */}
              <div className="opacity-0 animate-fade-in-up delay-300" style={{ animationFillMode: 'forwards' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  {HERO_STATS.map((stat) => (
                    <div key={stat.label} className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-[2px] transition-all duration-200 text-center">
                      <div className="text-3xl font-black text-[#E1392A] tracking-tight">{stat.value}</div>
                      <div className="text-[10px] text-[#615E59] font-black uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Big CUTOUT Image Overlap with Cute Cartoon Stickers & Pacman Eyes */}
            <div className="flex-1 w-full flex items-center justify-center relative min-h-[360px] lg:min-h-[420px] z-10">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#F5B025] to-[#E1392A] border-4 border-[#1D1C1A] shadow-[8px_8px_0px_0px_#1D1C1A] flex items-center justify-center group overflow-visible">
                
                {/* Overlapping realistic product image */}
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
                  alt="Elite Gadget"
                  className="object-contain w-[110%] h-[110%] max-w-none group-hover:scale-105 transition-transform duration-500 z-10 select-none pointer-events-none drop-shadow-[8px_16px_0px_#1D1C1A]"
                />

                {/* STICKER 1: Pacman-style cute cartoon eyes on the headphones - Direct copy of burger sticker */}
                <div className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex gap-1.5 pointer-events-none select-none z-30 animate-bounce-soft">
                  <div className="w-7 h-7 rounded-full bg-white border-3 border-[#1D1C1A] flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#1D1C1A] translate-x-[2px] translate-y-[2px]" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white border-3 border-[#1D1C1A] flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#1D1C1A] -translate-x-[2px] translate-y-[2px]" />
                  </div>
                </div>

                {/* STICKER 2: "SMASHED FRESH" Tech pop sticker */}
                <div className="absolute top-2 left-0 -rotate-12 bg-[#F5B025] text-[#1D1C1A] border-3 border-[#1D1C1A] shadow-[3px_3px_0px_0px_#1D1C1A] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider select-none z-20 hover:scale-110 transition-transform cursor-pointer">
                  💥 SMASHED DEALS!
                </div>

                {/* STICKER 3: "BOLD FLAVOR" equivalent */}
                <div className="absolute bottom-6 right-0 rotate-12 bg-[#E1392A] text-white border-3 border-[#1D1C1A] shadow-[3px_3px_0px_0px_#1D1C1A] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider select-none z-20 hover:scale-110 transition-transform cursor-pointer">
                  ⚡ BOLD PERFORMANCE
                </div>

                {/* Decorative retro star doodles */}
                <div className="absolute -top-10 -right-6 text-3xl text-[#F5B025] select-none pointer-events-none drop-shadow-[2px_2px_0px_#1D1C1A] animate-spin-slow">★</div>
                <div className="absolute bottom-16 -left-10 text-4xl text-[#E1392A] select-none pointer-events-none drop-shadow-[2px_2px_0px_#1D1C1A] animate-bounce-soft">★</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== TILTED POLAROID LIFESTYLE GRID (SECOND SCREENSHOT) ========== */}
      <section className="bg-[#FAF6EE] py-14 border-b-3 border-[#1D1C1A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-black uppercase tracking-widest text-[#E1392A] bg-[#F5B025]/20 border-2 border-[#E1392A]/30 px-3 py-1 rounded-lg">Lifestyle Showcase</span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#1D1C1A] mt-3">CURATED FOR YOUR CRAVING</h2>
          </div>

          {/* Polaroid Deck: Skewed, tilted retro photos next to each other */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6 pt-4">
            
            {/* Polaroid Card 1: Left */}
            <div className="polaroid-card w-72 rotate-[-4deg]">
              <div className="w-full aspect-square border-3 border-[#1D1C1A] overflow-hidden rounded-lg bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80"
                  alt="Retro Audio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center mt-4">
                <span className="font-black text-sm uppercase tracking-wider text-[#1D1C1A]">✦ CRISP AUDIOPHILE</span>
              </div>
            </div>

            {/* Polaroid Card 2: Center */}
            <div className="polaroid-card w-72 rotate-[3deg]">
              <div className="w-full aspect-square border-3 border-[#1D1C1A] overflow-hidden rounded-lg bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"
                  alt="Retro Camera"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center mt-4">
                <span className="font-black text-sm uppercase tracking-wider text-[#E1392A]">✦ SHARP SHUTTER</span>
              </div>
            </div>

            {/* Polaroid Card 3: Right */}
            <div className="polaroid-card w-72 rotate-[-2deg]">
              <div className="w-full aspect-square border-3 border-[#1D1C1A] overflow-hidden rounded-lg bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
                  alt="Tactile Gear"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center mt-4">
                <span className="font-black text-sm uppercase tracking-wider text-[#1D1C1A]">✦ PURE DESIGN</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== TRUST BAR (TACTILE FLOATING DECK) ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white border-3 border-[#1D1C1A] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1D1C1A] hover:shadow-[7px_7px_0px_0px_#1D1C1A] hover:-translate-y-[2px] transition-all duration-300">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6EE] border-3 border-[#1D1C1A] flex items-center justify-center text-[#E1392A] flex-shrink-0 group-hover:scale-110 group-hover:bg-[#F3ECE0] transition-all duration-300 shadow-sm">
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-black text-[#1D1C1A] tracking-tight group-hover:text-[#E1392A] transition-colors uppercase">{f.label}</div>
                  <div className="text-[11px] text-[#615E59] font-bold mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      {/* ========== PRODUCTS SECTION (EDITORIAL L'OISEAU-INSPIRED) ========== */}
      <section id="products" data-testid="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        
        {/* Editorial Section Header */}
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#1D1C1A]">
            {selectedCategory === 'All' ? 'Featured Products' : selectedCategory}
          </h2>
          <p className="text-xs text-[#615E59] font-bold uppercase tracking-widest mt-1">
            {loading ? 'Refreshing catalog...' : `${filteredProducts.length} premium artifact${filteredProducts.length !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {/* Layout Grid with Left Filters Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT SIDEBAR: Clean Minimalist Filters Panel (Visible on Desktop) */}
          <div data-testid="filters-sidebar" className="hidden lg:block w-64 flex-shrink-0 space-y-8 pr-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1D1C1A] mb-3">Filters</h3>
              <div className="h-[3px] bg-[#1D1C1A] w-full" />
            </div>

            {/* Search Box */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-[#615E59]">Search</h4>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="catalogSearch"
                  data-testid="catalog-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog..."
                  title="Search within product catalog"
                  aria-label="Catalog search"
                  className="w-full pl-9 pr-8 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-lg text-xs text-[#1D1C1A] placeholder-slate-400 focus:outline-none transition-all shadow-xs"
                />
                {searchQuery && (
                  <button data-testid="catalog-search-clear" aria-label="Clear search" onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-[#615E59]">Sort By</h4>
              <div className="relative">
                <select
                  name="sortBy"
                  data-testid="sort-select"
                  aria-label="Sort products"
                  title="Sort products by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-lg text-xs text-[#1D1C1A] font-black uppercase focus:outline-none appearance-none cursor-pointer shadow-xs"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <SlidersHorizontal size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Category Checkboxes (Directly matches the screenshot filter pane) */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-[#615E59]">Categories</h4>
              <div className="space-y-2.5">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat
                  return (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        name={`category-${cat}`}
                        data-testid={`category-checkbox-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                        checked={isActive}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 border-2 border-[#1D1C1A] rounded-sm text-[#E1392A] focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-xs font-bold transition-colors uppercase tracking-wider ${isActive ? 'text-[#E1392A] font-black' : 'text-slate-500 group-hover:text-black'}`}>
                        {cat}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Product Grid & Mobile Filter Tabs */}
          <div className="flex-1 space-y-8">
            
            {/* Category tabs visible on mobile/tablets only */}
            <div className="lg:hidden">
              <div className="scrollable-tabs flex gap-2 mb-6 pb-1">
                {categories.map((cat) => {
                  const icon = CATEGORY_ICONS[cat]
                  const isActive = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      data-testid={`mobile-category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all duration-200 border-2 border-[#1D1C1A] flex-shrink-0 ${
                        isActive
                          ? 'bg-[#E1392A] text-white shadow-md'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      {icon}
                      {cat}
                    </button>
                  )
                })}
              </div>

              {/* Mobile search / sort bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search catalog..."
                    className="w-full pl-9 pr-8 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-3 pr-8 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-xs focus:outline-none font-black uppercase"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div data-testid="product-loading-skeleton" data-loading="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="aspect-square skeleton rounded-2xl" />
                    <div className="skeleton h-5 rounded w-3/4" />
                    <div className="skeleton h-4 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div data-testid="no-products-message" className="text-center py-20 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[4px_4px_0px_0px_#1D1C1A]">
                <Search size={36} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black uppercase text-[#1D1C1A] mb-2">No products found</h3>
                <p className="text-slate-500 text-sm mb-6 font-medium">Try adjusting your filters or search query.</p>
                <button
                  data-testid="clear-filters-btn"
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                  className="btn-secondary px-6 py-2.5 text-xs font-black uppercase shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                data-testid="products-grid"
                data-loading="false"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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
                        className="flex flex-col group relative"
                      >
                        {/* Product Card Image Wrapper (Borderless, Square, High-end) */}
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#FAF6EE] border-2 border-[#1D1C1A]/10 group-hover:border-[#1D1C1A] transition-all duration-300 shadow-xs">
                          <Link to={`/product/${product.id}`} data-testid={`product-link-${product.id}`} title={`View ${product.name}`} className="block w-full h-full">
                            <img
                              src={product.image_url}
                              alt={`Product image of ${product.name}`}
                              data-testid={`product-image-${product.id}`}
                              className="object-cover w-full h-full group-hover:scale-[1.03] transition-all duration-500"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                              }}
                            />
                          </Link>

                          {/* Clean white discount tag in top-left matching screenshot */}
                          {hasDiscount && (
                            <span data-testid={`discount-badge-${product.id}`} className="absolute top-3.5 left-3.5 bg-white text-[#1D1C1A] border border-slate-200/80 shadow-xs px-2.5 py-1 text-[9px] font-black tracking-wide uppercase">
                              %{discount}
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            data-testid={`wishlist-button-${product.id}`}
                            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center border shadow-xs backdrop-blur-xs transition-all duration-200 ${
                              isWishlisted
                                ? 'bg-rose-500 border-rose-500 text-white'
                                : 'bg-white/80 border-slate-200 text-[#1D1C1A]/60 hover:text-rose-500 hover:bg-white'
                            }`}
                          >
                            <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
                          </button>

                          {/* Hover pill DISCOVER overlay matching L'Oiseau style */}
                          <div className="absolute inset-0 bg-[#1D1C1A]/5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none z-10">
                            <span className="bg-[#1D1C1A] text-white text-[10px] font-black tracking-widest px-6 py-2.5 rounded-full shadow-lg border border-white/10 uppercase group-hover:scale-105 transition-transform duration-300">
                              DISCOVER
                            </span>
                          </div>

                          {/* Out of stock overlay */}
                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-[#FAF6EE]/75 backdrop-blur-xs flex items-center justify-center z-15">
                              <span className="px-4 py-2 border-2 border-[#1D1C1A] bg-white text-[#1D1C1A] text-[10px] font-black tracking-widest uppercase shadow-md">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Editorial Details below the card */}
                        <div className="mt-4 flex flex-col gap-2">
                          <div className="space-y-1">
                            <Link to={`/product/${product.id}`} className="block">
                              <h3 data-testid={`product-name-${product.id}`} className="font-black text-[#1D1C1A] text-sm uppercase tracking-wider line-clamp-1 group-hover:text-[#E1392A] transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            
                            <div className="flex items-center justify-between">
                              <StarDisplay rating={rating} count={reviewCount} />
                              
                              <span data-testid={`product-stock-${product.id}`} className={`text-[10px] font-bold ${
                                product.stock === 0 ? 'text-red-500' :
                                product.stock <= 5 ? 'text-orange-500' : 'text-[#3A8E7D]'
                              }`}>
                                {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock'}
                              </span>
                            </div>
                          </div>

                          {/* Price and Cart button row */}
                          <div className="flex items-center justify-between gap-4 border-t border-slate-200/60 pt-3 mt-1">
                            <div className="flex items-baseline gap-1.5">
                              <span data-testid={`product-price-${product.id}`} className="text-base font-black text-[#1D1C1A]">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              {originalPrice && (
                                <span className="text-xs text-slate-400 line-through font-medium">
                                  ₹{Math.round(originalPrice).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Minimalist ADD TO CART + button */}
                            <button
                              onClick={() => handleAddToCart(product.id)}
                              data-testid={`add-to-cart-${product.id}`}
                              aria-label={`Add ${product.name} to cart`}
                              title={product.stock === 0 ? 'Out of stock' : `Add ${product.name} to cart`}
                              disabled={product.stock === 0 || addingId === product.id}
                              className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
                                product.stock === 0
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  : addingId === product.id
                                  ? 'bg-[#1D1C1A]/40 text-[#1D1C1A] cursor-wait'
                                  : 'bg-[#1D1C1A] text-white hover:bg-[#33312D] shadow-xs active:scale-95'
                              }`}
                            >
                              <ShoppingCart size={11} />
                              {addingId === product.id ? 'Adding' : 'Add +'}
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

      {/* Elegant Toast (Light theme) */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            role="status"
            data-testid="toast-notification"
            className={`fixed bottom-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-xl max-w-xs ${
              toastMsg.isError
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {toastMsg.isError ? '⚠️' : '✅'}
            <span className="text-sm font-bold">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
