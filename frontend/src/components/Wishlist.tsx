import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Link } from 'react-router-dom'
import { Trash2, Heart, ShoppingBag } from 'lucide-react'

interface WishlistItem {
  id: string
  product_id: string
  product: {
    id: string
    name: string
    price: number
    image_url: string
    rating: number
  }
  created_at: string
}

export const Wishlist: React.FC = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist')
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`)
      setItems(items.filter(item => item.product_id !== productId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await api.delete('/wishlist')
        setItems([])
      } catch (error) {
        console.error('Error clearing wishlist:', error)
      }
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200/50 mt-6 shadow-xs">
        <p className="text-slate-500 font-semibold text-sm">Please log in to view your wishlist</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-12 text-xs font-bold text-slate-500">Loading wishlist...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none bg-[#F8FAFC] min-h-[60vh]">
      <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-800 uppercase">My Wishlist</h1>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} saved in your wishlist
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold rounded-xl uppercase transition-all shadow-2xs"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/50 rounded-2xl shadow-xs max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-450 mx-auto mb-4">
            <Heart size={24} />
          </div>
          <p className="text-slate-650 font-bold text-sm mb-4">Your wishlist is empty</p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold rounded-xl uppercase tracking-wide inline-flex items-center gap-1.5 shadow-xs transition-all"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 bg-transparent">
          {items.map((item) => (
            <div key={item.id} className="border border-slate-200/50 rounded-2xl hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between group relative bg-white shadow-2xs">
              {/* Product link container */}
              <div>
                <div className="aspect-square bg-slate-50/50 flex items-center justify-center rounded-xl overflow-hidden p-2 relative border border-slate-100">
                  <Link to={`/product/${item.product_id}`} className="block w-full h-full">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="object-contain w-full h-full group-hover:scale-102 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                  </Link>

                  {/* Remove hover button */}
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-semibold text-xs text-slate-800 hover:text-[#0F6FFF] line-clamp-2 leading-relaxed">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="rating-badge text-[10px]">
                      {item.product.rating.toFixed(1)} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{item.product.price.toLocaleString('en-IN')}
                </span>
                <Link
                  to={`/product/${item.product_id}`}
                  className="px-3.5 py-1.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all shadow-xs"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
