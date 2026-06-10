import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

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

  const categories = ['Electronics', 'Home & Living', 'Fashion & Accessories', 'Sports & Fitness']

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
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value
    setSortBy(sort)
    fetchProducts(searchQuery, selectedCategory, sort)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(searchQuery, selectedCategory, sortBy)
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    if (type === 'min') {
      setPriceRange([Math.min(value, priceRange[1]), priceRange[1]])
    } else {
      setPriceRange([priceRange[0], Math.max(value, priceRange[0])])
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Search Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-gray-100 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Category</h3>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm text-gray-600">Min: ${priceRange[0]}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max: ${priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Minimum Rating</h3>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value={0}>All Ratings</option>
              <option value={3}>3★ & Up</option>
              <option value={4}>4★ & Up</option>
              <option value={4.5}>4.5★ & Up</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="font-semibold mb-2">Sort By</h3>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
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
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No products found matching your criteria
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover hover:opacity-75 transition"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {product.brand && (
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      )}
                      <div className="flex items-center gap-2 my-2">
                        <span className="text-yellow-400">
                          {'★'.repeat(Math.floor(product.rating))}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({product.review_count})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.original_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button className="w-full bg-blue-100 text-blue-600 px-3 py-2 rounded hover:bg-blue-200 transition text-sm">
                        View Details
                      </button>
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
