import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw } from 'lucide-react'
import api from '../services/api'
import { useCart, Product } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [adding, setAdding] = useState<boolean>(false)
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null)

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
      } catch (err: any) {
        console.error('Failed to load product:', err)
        showToast('Product not found. Redirecting to home...', true)
        setTimeout(() => navigate('/'), 2500)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const showToast = (text: string, isError: boolean = false) => {
    setToastMsg({ text, isError })
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to place an order', true)
      return
    }
    if (!product) return

    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      showToast('Successfully added to your shopping cart!')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to add item to cart', true)
    } finally {
      setAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      showToast('Please login to place an order', true)
      return
    }
    if (!product) return

    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      navigate('/checkout')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to add item to cart', true)
    } finally {
      setAdding(false)
    }
  }

  const adjustQuantity = (amount: number) => {
    if (!product) return
    const newQty = quantity + amount
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-8">
        <div className="h-6 bg-slate-800/40 w-24 rounded"></div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2 aspect-square bg-slate-800/40 rounded-3xl"></div>
          <div className="lg:w-1/2 space-y-6">
            <div className="h-10 bg-slate-800/40 w-3/4 rounded"></div>
            <div className="h-6 bg-slate-800/40 w-1/3 rounded"></div>
            <div className="h-20 bg-slate-800/40 rounded"></div>
            <div className="h-12 bg-slate-800/40 w-1/2 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white mb-8 transition-colors duration-250">
        <ArrowLeft size={16} />
        Back to Catalog
      </Link>

      {/* Toast Alert */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-xl backdrop-blur-lg flex items-center gap-2 animate-bounce ${toastMsg.isError
          ? 'border-red-500/30 bg-red-950/90 text-red-200'
          : 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
          }`}>
          <span>{toastMsg.text}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Image Section */}
        <div className="lg:w-1/2 flex items-center justify-center">
          <div className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-2xl relative">
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-950/80 text-purple-300 border border-white/10 backdrop-blur-md">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="lg:w-1/2 flex flex-col justify-between py-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-slate-600">|</span>
                <span className={`text-xs font-semibold ${product.stock > 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {product.stock > 0 ? `${product.stock} items remaining` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-300">Product Overview</h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Select Quantity</h3>
                <div className="inline-flex items-center border border-white/10 rounded-xl bg-slate-900/50 p-1">
                  <button
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || adding}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 shadow-xl shadow-purple-600/10 hover:shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 transition-all duration-200"
              >
                <ShoppingCart size={18} />
                {product.stock === 0
                  ? 'Currently Out of Stock'
                  : adding
                    ? 'Adding...'
                    : `Add to Cart - ₹${(product.price * quantity).toFixed(2)}`}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0 || adding}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold bg-white text-slate-900 hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500 shadow-xl shadow-white/5 hover:shadow-white/10 hover:scale-[1.01] active:scale-[0.99] disabled:scale-100 transition-all duration-200"
              >
                Buy Now - ₹{(product.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>

          {/* Core Trust Badges */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8 mt-8">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Truck size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-200">Express Shipping</span>
              <span className="text-[9px] text-slate-400">Delivery in 2-3 days</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-200">Secure Payments</span>
              <span className="text-[9px] text-slate-400">SSL encrypted processing</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <RefreshCw size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-200">Easy Returns</span>
              <span className="text-[9px] text-slate-400">30-day return policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
