import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { scrollToElementWithOffset } from '../utils/scroll'


interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  image_url: string
  category: string
  brand?: string
  rating: number
  review_count: number
}

export const ProductSearch: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('newest')

  const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports & Fitness', 'Beauty', 'Books']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async (query = '', category = '', sort = 'newest') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (category) params.append('category', category)
      params.append('sort', sort)

      const response = await api.get(`/products?${params.toString()}`)
      let filteredProducts = response.data

      // Filter by price
      filteredProducts = filteredProducts.filter(
        (p: Product) => p.price >= priceRange[0] && p.price <= priceRange[1]
      )

      // Filter by rating
      filteredProducts = filteredProducts.filter((p: Product) => p.rating >= minRating)

      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value
    setSelectedCategory(category)
    fetchProducts(searchQuery, category, sortBy)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value
    setSortBy(sort)
    fetchProducts(searchQuery, selectedCategory, sort)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(searchQuery, selectedCategory, sortBy)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setPriceRange([Math.min(value, priceRange[1]), priceRange[1]])
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0])])
    }
  }

  const handlePriceMouseUp = () => {
    scrollToElementWithOffset('search-results-section', 95)
  }

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinRating(Number(e.target.value))
    scrollToElementWithOffset('search-results-section', 95)
  }

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <h1 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">Search Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-200/50 p-6 rounded-2xl shadow-2xs h-fit">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-5">Filters</h2>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              data-testid="search-page-input"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0F6FFF] focus:bg-white transition-all mb-2"
            />
            <button
              type="submit"
              data-testid="search-page-submit-btn"
              className="w-full bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Category</h3>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              data-testid="search-page-category-select"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0F6FFF] focus:bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Price Range</h3>
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase">Min: ₹{priceRange[0]}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                  onMouseUp={handlePriceMouseUp}
                  onTouchEnd={handlePriceMouseUp}
                  data-testid="search-page-price-min"
                  className="w-full accent-[#0F6FFF] cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase">Max: ₹{priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                  onMouseUp={handlePriceMouseUp}
                  onTouchEnd={handlePriceMouseUp}
                  data-testid="search-page-price-max"
                  className="w-full accent-[#0F6FFF] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Minimum Rating</h3>
            <select
              value={minRating}
              onChange={handleRatingChange}
              data-testid="search-page-rating-select"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0F6FFF] focus:bg-white transition-all"
            >
              <option value={0}>All Ratings</option>
              <option value={3}>3★ & Up</option>
              <option value={4}>4★ & Up</option>
              <option value={4.5}>4.5★ & Up</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sort By</h3>
            <select
              value={sortBy}
              onChange={handleSortChange}
              data-testid="search-page-sort-select"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#0F6FFF] focus:bg-white transition-all"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div id="search-results-section" className="lg:col-span-3">
          {loading ? (
            <div data-testid="search-loading-state" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/60 rounded-3xl p-3 md:p-4 flex flex-col justify-between h-full">
                  <div className="w-full h-48 skeleton rounded-2xl mb-4" />
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="skeleton h-4 rounded w-3/4 mb-2" />
                      <div className="skeleton h-3 rounded w-1/3 mb-2" />
                      <div className="skeleton h-3 rounded w-1/4" />
                    </div>
                    <div className="mt-4">
                      <div className="skeleton h-5 rounded w-1/2 mb-4" />
                      <div className="w-full skeleton h-9 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div data-testid="search-empty-state" className="text-center py-16 bg-white border border-slate-200/50 rounded-2xl shadow-xs">
              <Search size={32} className="text-slate-350 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 mb-1">No products found</h3>
              <p className="text-slate-400 text-xs">No products found matching your criteria.</p>
            </div>
          ) : (
            <div data-testid="search-results-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <div data-testid={`search-product-card-${product.id}`} className="bg-white border border-slate-200/60 rounded-3xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-3 md:p-4 flex flex-col justify-between h-full group relative">
                    <div className="relative w-full h-48 bg-slate-50/50 flex items-center justify-center rounded-2xl overflow-hidden p-2 border border-slate-100/55 mb-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="object-contain max-h-full max-w-full group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm hover:text-[#0F6FFF] transition-colors line-clamp-2 leading-snug">{product.name}</h3>
                        {product.brand && (
                          <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-1">{product.brand}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="rating-badge text-[10px]">
                            {product.rating.toFixed(1)} ★
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            ({product.review_count})
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-baseline gap-1.5 mb-4">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.original_price && (
                            <span className="text-[10px] text-slate-400 line-through font-medium">
                              ₹{Math.round(product.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <button className="w-full bg-[#0F6FFF]/10 hover:bg-[#0F6FFF]/20 text-[#0F6FFF] py-2.5 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center justify-center active:scale-[0.99]">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

