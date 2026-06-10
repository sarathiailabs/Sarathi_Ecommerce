import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Link } from 'react-router-dom'

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
      <div className="container mx-auto py-8 text-center">
        <p className="text-gray-600">Please log in to view your wishlist</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading wishlist...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {items.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your wishlist is empty</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <Link to={`/product/${item.product_id}`}>
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-48 object-cover hover:opacity-75 transition"
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${item.product_id}`} className="hover:text-blue-600">
                  <h3 className="font-semibold truncate">{item.product.name}</h3>
                </Link>
                <div className="flex items-center gap-2 my-2">
                  <span className="text-yellow-400">
                    {'★'.repeat(Math.floor(item.product.rating))}
                  </span>
                  <span className="text-sm text-gray-600">({item.product.rating.toFixed(1)})</span>
                </div>
                <p className="text-xl font-bold text-blue-600 mb-3">
                  ${item.product.price.toFixed(2)}
                </p>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="w-full bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
