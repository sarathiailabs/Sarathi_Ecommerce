import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    cartTotal,
    isCartDrawerOpen,
    setCartDrawerOpen,
    updateQuantity,
    removeFromCart,
  } = useCart()

  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isCartDrawerOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node)
      ) {
        // Only close if we didn't click the "Add to Cart" button, which manages its own state
        const target = e.target as HTMLElement
        if (!target.closest('.btn-primary') && !target.closest('.glass-card button')) {
          setCartDrawerOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCartDrawerOpen, setCartDrawerOpen])

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartDrawerOpen])

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1D1C1A] z-45"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            data-testid="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart Drawer"
            className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-[#F1F3F6] border-l border-slate-200 shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#2874F0]/10 text-[#2874F0] flex items-center justify-center">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Shopping Cart</h3>
                  <p data-testid="cart-drawer-item-count" className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors"
                aria-label="Close cart drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart Items List */}
            <div data-testid="cart-drawer-items-list" className="flex-grow p-4 overflow-y-auto space-y-3 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div data-testid="cart-drawer-empty-state" className="text-center py-20 bg-white rounded-sm border border-slate-200 p-6">
                  <ShoppingCart size={36} className="text-slate-300 mx-auto mb-4" />
                  <h4 className="text-sm font-bold uppercase text-slate-700 mb-1">Your cart is empty</h4>
                  <p className="text-xs text-slate-450 mb-6 font-medium">Add premium items to begin shopping.</p>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    data-testid="cart-drawer-close-empty-btn"
                    className="px-5 py-2.5 bg-[#2874F0] hover:bg-[#1e5ecb] text-white text-xs font-bold rounded-sm uppercase tracking-wide transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    data-testid={`cart-drawer-item-${item.product_id}`}
                    className="flex gap-3 p-3 bg-white border border-slate-200/80 rounded-sm hover:shadow-xs transition-shadow relative"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 border border-slate-100 rounded-sm bg-slate-50 flex items-center justify-center p-1 flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="object-contain max-h-full max-w-full"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-grow flex flex-col justify-between min-w-0">
                      <div>
                        <h4 data-testid={`cart-drawer-item-name-${item.product_id}`} className="font-semibold text-xs text-slate-800 line-clamp-2 leading-relaxed pr-4">
                          {item.product.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {item.product.category}
                        </p>
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-slate-300 bg-slate-50 rounded-sm overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-testid={`cart-drawer-qty-decrease-${item.product_id}`}
                            className="p-1 hover:bg-slate-250 disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} className="text-slate-600" />
                          </button>
                          <span data-testid={`cart-drawer-qty-value-${item.product_id}`} className="px-2 text-xs font-bold text-slate-800 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            data-testid={`cart-drawer-qty-increase-${item.product_id}`}
                            className="p-1 hover:bg-slate-250 disabled:opacity-30 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} className="text-slate-600" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold">
                            ₹{item.product.price.toLocaleString('en-IN')} each
                          </span>
                          <div data-testid={`cart-drawer-item-total-${item.product_id}`} className="text-xs font-extrabold text-slate-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      data-testid={`cart-drawer-remove-btn-${item.product_id}`}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2.5">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Subtotal</span>
                  <span data-testid="cart-drawer-subtotal" className="text-base font-extrabold text-slate-900">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <p className="text-[9px] text-slate-400 font-medium text-center mt-1">
                  🔒 Secure checkout processed instantly. Shipping computed at next step.
                </p>

                <div className="flex gap-2.5">
                  <Link
                    to="/cart"
                    onClick={() => setCartDrawerOpen(false)}
                    data-testid="cart-drawer-view-cart-btn"
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-sm uppercase tracking-wide text-center transition-colors flex items-center justify-center"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setCartDrawerOpen(false)}
                    data-testid="cart-drawer-checkout-btn"
                    className="flex-1 py-2.5 bg-[#FB641B] hover:bg-[#e05310] text-white text-xs font-bold rounded-sm uppercase tracking-wide text-center flex items-center justify-center gap-1 transition-colors shadow-xs"
                  >
                    Checkout
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
