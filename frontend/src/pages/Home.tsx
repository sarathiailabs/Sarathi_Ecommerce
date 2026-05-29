import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Eye } from 'lucide-react'
import api from '../services/api'
import { useCart, Product } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSearch } from '../context/SearchContext'
import { HeroSlider } from '../components/HeroSlider'

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [loading, setLoading] = useState<boolean>(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { searchQuery } = useSearch()
  const navigate = useNavigate()

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

        // Extract distinct categories
        const distinct = ['All', ...Array.from(new Set(data.map((p: any) => p.category))) as string[]]
        setCategories(distinct)
      } catch (err: any) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      setErrorMsg('Please login to start shopping!')
      setTimeout(() => setErrorMsg(null), 3000)
      return
    }

    setAddingId(productId)

    try {
      await addToCart(productId, 1)

      // Navigate to cart page
      navigate('/cart')

    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to add item')
      setTimeout(() => setErrorMsg(null), 3000)
    } finally {
      setAddingId(null)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery) return true;

      const lowerQuery = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      );
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div>
      {/* ── Hero Slider ── */}
      <HeroSlider />

      <div className="max-w-7xl mx-auto px-6 pb-10 pt-2">

      {/* Toast Alert */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border border-red-500/30 bg-red-950/90 text-red-200 text-sm shadow-xl backdrop-blur-lg flex items-center gap-2 animate-bounce">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-10 pb-2 border-b border-white/5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${selectedCategory === cat
              ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20 scale-[1.02]'
              : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 animate-pulse space-y-4">
              <div className="aspect-square rounded-xl bg-slate-800/40"></div>
              <div className="h-4 bg-slate-800/40 rounded w-2/3"></div>
              <div className="h-3 bg-slate-800/40 rounded w-1/2"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-slate-800/40 rounded w-1/3"></div>
                <div className="h-9 bg-slate-800/40 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/5">
          <p className="text-slate-400 font-medium">
            {searchQuery ? 'No products found matching your search.' : 'No products found in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass rounded-2xl overflow-hidden hover:border-purple-500/30 group transition-all duration-300 flex flex-col"
            >
              {/* Product Image */}
              <Link
                to={`/product/${product.id}`}
                className="relative aspect-square overflow-hidden bg-slate-900 flex items-center justify-center border-b border-white/5 block"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-purple-300 border border-white/10 backdrop-blur-md">
                  {product.category}
                </span>

                {/* Out of Stock overlay */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-950/80 text-red-200 text-xs font-bold tracking-widest uppercase">
                      Sold Out
                    </span>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-1 hover:text-purple-400">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-semibold ${product.stock > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
                  >
                    <Eye size={14} />
                    Details
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0 || addingId === product.id}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 shadow-md shadow-purple-600/5 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 transition-all duration-200"
                  >
                    <ShoppingCart size={14} />
                    {addingId === product.id ? 'Adding...' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
