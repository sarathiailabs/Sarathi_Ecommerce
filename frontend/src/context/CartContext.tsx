import React, { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category: string
  subcategory?: string | null
  brand?: string | null
  weight?: number | null
  dimensions?: string | null
  original_price?: number
  is_featured?: boolean
  specifications?: { key: string; value: string }[] | null
}


export interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: Product
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  loading: boolean
  isCartDrawerOpen: boolean
  setCartDrawerOpen: (isOpen: boolean) => void
  addToCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => void
  loadCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [isCartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false)

  const loadCart = async () => {
    if (!isAuthenticated) {
      setCartItems([])
      return
    }
    setLoading(true)
    try {
      const response = await api.get('/cart')
      // Make sure the response has numerical values
      const items = response.data.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity),
        product: {
          ...item.product,
          price: Number(item.product.price),
          stock: Number(item.product.stock)
        }
      }))
      setCartItems(items)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load cart when authentication status changes
  useEffect(() => {
    loadCart()
  }, [isAuthenticated])

  const addToCart = async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to cart')
    }
    await api.post('/cart/items', {
      product_id: productId,
      quantity,
    })
    await loadCart()
    setCartDrawerOpen(true)
  }

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return
    await api.delete(`/cart/items/${productId}`)
    await loadCart()
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }
    await api.post('/cart/items', {
      product_id: productId,
      quantity,
    })
    await loadCart()
  }

  const clearCart = () => {
    setCartItems([])
  }

  // Derived properties
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        isCartDrawerOpen,
        setCartDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
