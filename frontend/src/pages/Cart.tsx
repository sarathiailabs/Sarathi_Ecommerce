import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export const Cart: React.FC = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  const taxRate = 0.08 // 8% tax
  const taxAmount = cartTotal * taxRate
  const grandTotal = cartTotal + taxAmount


  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 text-slate-500 mb-2">
          <ShoppingBag size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
          <p className="text-xs text-slate-400">
            Looks like you haven't added any products to your cart yet. Head back to the store catalog to explore.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/10 hover:shadow-purple-500/25 transition-all duration-200"
        >
          Browse Catalog
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
        Shopping Cart
      </h1>


      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart items list */}
        <div className="w-full lg:w-2/3 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5"
            >
              <div className="flex items-center gap-4">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Title & category */}
                <div className="space-y-1">
                  <Link to={`/product/${item.product_id}`} className="font-bold text-slate-200 hover:text-purple-300 transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
                    {item.product.category}
                  </span>
                </div>
              </div>

              {/* Adjuster & Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 sm:border-0 pt-4 sm:pt-0">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-white/5 rounded-lg bg-slate-900/50 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 text-slate-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold text-white min-w-[70px] text-right">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="p-2 text-slate-450 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                  title="Remove from Cart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Side panel */}
        <div className="w-full lg:w-1/3">
          <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
            <h2 className="font-bold text-slate-200 border-b border-white/5 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200 font-semibold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax (8%)</span>
                <span className="text-slate-200 font-semibold">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-bold uppercase">Free</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-white/5 pt-4">
                <span>Grand Total</span>
                <span className="text-purple-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/10 hover:shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
