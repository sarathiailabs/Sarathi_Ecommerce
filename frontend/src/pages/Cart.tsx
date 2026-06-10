import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, ArrowRight, Tag, Gift,
  ChevronRight, Shield, Truck, RefreshCw, Info,
  Minus, Plus, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const PROMO_CODES: Record<string, number> = {
  NOVA10: 10,
  SAVE20: 20,
  ELITE15: 15,
}

const FREE_SHIPPING_THRESHOLD = 999

export const Cart: React.FC = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  const taxRate = 0.08
  const discountAmount = appliedPromo ? (cartTotal * appliedPromo.discount) / 100 : 0
  const discountedSubtotal = cartTotal - discountAmount
  const taxAmount = discountedSubtotal * taxRate
  const grandTotal = discountedSubtotal + taxAmount
  const shippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal)

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Please enter a promo code'); return }
    if (appliedPromo) { setPromoError('Only one promo code can be applied'); return }
    const discount = PROMO_CODES[code]
    if (discount) {
      setAppliedPromo({ code, discount })
      setPromoInput('')
      setPromoError('')
    } else {
      setPromoError('Invalid or expired promo code')
    }
  }

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)
    await removeFromCart(productId)
    setRemovingId(null)
  }

  if (cartItems.length === 0) {
    return (
      <motion.div
        data-testid="cart-empty-state"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto px-6 py-20 flex flex-col items-center text-center space-y-6 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[5px_5px_0px_0px_#1D1C1A] mt-12"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-[#FAF6EE] border-3 border-[#1D1C1A] flex items-center justify-center text-[#1D1C1A] shadow-[4px_4px_0px_0px_#1D1C1A]">
            <ShoppingBag size={44} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#1D1C1A]">Your cart is empty</h2>
          <p className="text-[#615E59] text-sm leading-relaxed max-w-sm">
            Looks like you haven't added anything yet. Browse our catalog to find something you'll love.
          </p>
        </div>
        <Link
          to="/"
          data-testid="cart-empty-browse-btn"
          className="btn-primary text-xs px-7 py-3.5 flex items-center gap-2 font-black uppercase tracking-widest"
        >
          <ShoppingBag size={16} />
          Browse Catalog
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    )
  }

  return (
    <div data-testid="cart-page" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1D1C1A] uppercase tracking-tight">Shopping Cart</h1>
          <p data-testid="cart-item-count" className="text-[#615E59] text-xs font-black uppercase tracking-wider mt-1">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        <Link
          to="/"
          data-testid="cart-continue-shopping"
          className="flex items-center gap-1.5 text-xs font-black text-[#E1392A] hover:text-[#C92F22] uppercase tracking-wider transition-colors"
        >
          Continue Shopping
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ===== CART ITEMS ===== */}
        <div className="w-full lg:flex-1 space-y-5">
          {/* Free shipping progress */}
          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-4.5 space-y-3 shadow-[4px_4px_0px_0px_#1D1C1A]">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-[#E1392A]" />
              {remainingForFreeShipping > 0 ? (
                <span className="text-xs font-black uppercase tracking-wider text-[#1D1C1A]">
                  Add <span className="text-[#E1392A]">₹{remainingForFreeShipping.toFixed(0)}</span> more for <span className="text-[#E1392A]">FREE shipping</span>
                </span>
              ) : (
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  🎉 You've unlocked FREE shipping!
                </span>
              )}
            </div>
            <div className="h-3 bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#F5B025] rounded-full"
              />
            </div>
          </div>

          {/* Items list */}
          <div data-testid="cart-items-list">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                data-testid={`cart-item-${item.product_id}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-[2px] transition-all duration-200 overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex gap-4 sm:gap-5">
                  {/* Thumbnail */}
                  <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#FAF6EE] border-2 border-[#1D1C1A] shadow-sm flex-shrink-0 flex items-center justify-center">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/product/${item.product_id}`}
                          data-testid={`cart-item-name-${item.product_id}`}
                          className="font-black text-[#1D1C1A] hover:text-[#E1392A] transition-colors line-clamp-1 text-sm sm:text-base uppercase tracking-tight"
                        >
                          {item.product.name}
                        </Link>
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-[#1D1C1A] bg-[#F5B025]/20 border border-[#1D1C1A] px-2 py-0.5 rounded-md mt-1 shadow-xs">
                          {item.product.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        disabled={removingId === item.product_id}
                        data-testid={`cart-remove-btn-${item.product_id}`}
                        className="p-2 border-2 border-transparent hover:border-[#1D1C1A] hover:bg-[#E1392A]/10 text-[#1D1C1A]/60 hover:text-[#E1392A] rounded-xl transition-all flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      {/* Quantity adjuster */}
                      <div
                        data-testid={`cart-quantity-control-${item.product_id}`}
                        className="inline-flex items-center bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_#1D1C1A]"
                      >
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid={`cart-qty-decrease-${item.product_id}`}
                          className="w-8 h-8 flex items-center justify-center text-[#1D1C1A] hover:bg-[#F5B025] hover:text-[#1D1C1A] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black"
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          data-testid={`cart-qty-value-${item.product_id}`}
                          className="w-8 text-center text-xs font-black text-[#1D1C1A] select-none"
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          data-testid={`cart-qty-increase-${item.product_id}`}
                          className="w-8 h-8 flex items-center justify-center text-[#1D1C1A] hover:bg-[#F5B025] hover:text-[#1D1C1A] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Pricing */}
                      <div className="text-right">
                        <div
                          data-testid={`cart-item-total-${item.product_id}`}
                          className="text-base font-black text-[#1D1C1A]"
                        >
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#615E59] font-black uppercase tracking-wider">
                          ₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>

          {/* Promo Code */}
          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1D1C1A] tracking-wider">
              <Gift size={16} className="text-[#E1392A]" />
              Promo Code
            </div>

            {appliedPromo ? (
              <div className="flex items-center justify-between bg-[#FAF6EE] border-2 border-emerald-500 rounded-xl px-4 py-3 shadow-[2px_2px_0px_0px_#1D1C1A]">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-emerald-600" />
                  <span className="font-black text-emerald-700 text-xs uppercase tracking-wider">{appliedPromo.code}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">— {appliedPromo.discount}% off applied!</span>
                </div>
                <button
                  onClick={() => setAppliedPromo(null)}
                  className="text-[#1D1C1A] hover:text-[#E1392A] transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    id="promo-code-input"
                    data-testid="promo-code-input"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    placeholder="NOVA10, SAVE20, ELITE15..."
                    className="flex-1 w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#1D1C1A] text-xs text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    onClick={handleApplyPromo}
                    data-testid="promo-apply-btn"
                    className="px-6 py-2.5 rounded-xl bg-[#F5B025] text-[#1D1C1A] border-2 border-[#1D1C1A] text-xs font-black uppercase tracking-wider hover:bg-[#df9f20] active:scale-95 transition-all shadow-[2px_2px_0px_0px_#1D1C1A] hover:shadow-[1px_1px_0px_0px_#1D1C1A] hover:translate-x-[1px] hover:translate-y-[1px]"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p data-testid="promo-error-msg" className="text-xs text-[#E1392A] font-bold flex items-center gap-1">
                    <Info size={12} />
                    {promoError}
                  </p>
                )}
                <p className="text-[10px] text-[#615E59] font-black uppercase tracking-wider mt-1">Try: NOVA10 · SAVE20 · ELITE15</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== ORDER SUMMARY ===== */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[4px_4px_0px_0px_#1D1C1A] overflow-hidden sticky top-24">
            <div className="px-6 py-4.5 border-b-3 border-[#1D1C1A] bg-[#FAF6EE]">
              <h2 className="font-black text-[#1D1C1A] text-xs uppercase tracking-widest">Order Summary</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Line items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#615E59] font-black uppercase tracking-wider">Subtotal ({cartItems.length} items)</span>
                  <span className="text-[#1D1C1A] font-black text-sm">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1">
                      <Tag size={12} />
                      Promo ({appliedPromo.code})
                    </span>
                    <span className="text-emerald-600 font-black text-sm">−₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#615E59] font-black uppercase tracking-wider">Estimated Tax (8%)</span>
                  <span className="text-[#1D1C1A] font-black text-sm">₹{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#615E59] font-black uppercase tracking-wider">Shipping</span>
                  <span className={`font-black text-sm ${cartTotal >= FREE_SHIPPING_THRESHOLD ? 'text-emerald-600' : 'text-[#1D1C1A]'}`}>
                    {cartTotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : `₹${(49).toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t-3 border-[#1D1C1A] pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[#1D1C1A] text-xs uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-[#E1392A]">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-emerald-600 font-bold mt-1 text-right">
                    You save ₹{discountAmount.toFixed(2)} with {appliedPromo.code}!
                  </p>
                )}
              </div>

              {/* Checkout button */}
              <button
                onClick={() => navigate('/checkout')}
                id="cart-checkout-btn"
                data-testid="cart-checkout-btn"
                className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </button>

              {/* Security badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-[#1D1C1A]/10 mt-2">
                {[
                  { icon: <Shield size={13} />, label: 'Secure' },
                  { icon: <Truck size={13} />, label: 'Fast Ship' },
                  { icon: <RefreshCw size={13} />, label: '30-Day Return' },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-1.5 text-[#615E59] hover:text-[#1D1C1A] text-[9px] font-black uppercase tracking-widest transition-colors text-center">
                    <span className="text-[#E1392A]">{b.icon}</span>
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
