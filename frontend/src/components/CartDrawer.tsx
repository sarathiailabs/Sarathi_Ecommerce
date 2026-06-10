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
            className="fixed top-0 right-0 h-screen w-full sm:w-[460px] bg-[#FAF6EE] border-l-3 border-[#1D1C1A] shadow-2xl z-50 flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b-3 border-[#1D1C1A] bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E1392A] text-white border-2 border-[#1D1C1A] flex items-center justify-center shadow-xs">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-[#1D1C1A]">Shopping Cart</h3>
                  <p className="text-[10px] text-[#615E59] font-bold uppercase tracking-wider mt-0.5">
                    {cartItems.length} unique artifact{cartItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 rounded-xl border-2 border-[#1D1C1A] bg-white hover:bg-slate-50 transition-colors shadow-xs"
                aria-label="Close cart drawer"
              >
                <X size={16} className="text-[#1D1C1A]" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow p-6 overflow-y-auto space-y-5 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart size={42} className="text-slate-350 mx-auto mb-4" />
                  <h4 className="text-sm font-black uppercase text-[#1D1C1A] mb-1">Your cart is empty</h4>
                  <p className="text-xs text-[#615E59] mb-6 font-medium">Add premium tech items to begin your collection.</p>
                  <button
                    onClick={() => setCartDrawerOpen(false)}
                    className="btn-secondary text-xs uppercase px-6 py-3"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[3px_3px_0px_0px_#1D1C1A] relative"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#1D1C1A] flex-shrink-0 bg-[#FAF6EE]">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-xs uppercase tracking-wider text-[#1D1C1A] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-[#615E59] font-bold uppercase tracking-wider mt-0.5">
                          {item.product.category}
                        </p>
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border-2 border-[#1D1C1A] rounded-lg bg-[#FAF6EE] overflow-hidden shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1.5 hover:bg-[#F3ECE0] border-r-2 border-[#1D1C1A] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={10} className="text-[#1D1C1A]" />
                          </button>
                          <span className="px-3 text-xs font-black text-[#1D1C1A] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1.5 hover:bg-[#F3ECE0] border-l-2 border-[#1D1C1A] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={10} className="text-[#1D1C1A]" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs text-[#615E59] font-bold">
                            ₹{item.product.price.toLocaleString('en-IN')} each
                          </span>
                          <div className="text-sm font-black text-[#1D1C1A]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="absolute top-3 right-3 p-1 text-slate-400 hover:text-[#E1392A] transition-colors"
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
              <div className="p-6 border-t-3 border-[#1D1C1A] bg-white space-y-4">
                <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-3">
                  <span className="text-xs text-[#615E59] font-black uppercase tracking-wider">Subtotal</span>
                  <span className="text-lg font-black text-[#1D1C1A]">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <p className="text-[10px] text-[#615E59] font-semibold text-center mt-1">
                  🔒 Secure checkout processed instantly. Shipping computed at next step.
                </p>

                <div className="flex gap-3">
                  <Link
                    to="/cart"
                    onClick={() => setCartDrawerOpen(false)}
                    className="flex-1 btn-secondary text-xs uppercase py-3.5 text-center font-black tracking-wider flex items-center justify-center gap-1.5"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setCartDrawerOpen(false)}
                    className="flex-1 btn-primary text-xs uppercase py-3.5 text-center font-black tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
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
