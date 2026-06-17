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
  SARATHI10: 10,
  SARATHI20: 20,
  SARATHI15: 15,
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto px-6 py-16 flex flex-col items-center text-center bg-white border border-slate-200 rounded-sm shadow-xs mt-12"
      >
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Your cart is empty</h2>
        <p className="text-slate-500 text-xs mt-1 max-w-xs font-semibold">
          Explore products and add them to your cart to start shopping!
        </p>
        <Link
          to="/"
          data-testid="cart-empty-browse-btn"
          className="mt-6 px-6 py-2.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold rounded-sm uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <ShoppingBag size={14} />
          <span>Browse Catalog</span>
        </Link>
      </motion.div>
    )
  }

  return (
    <div data-page="cart" className="max-w-5xl mx-auto px-4 sm:px-6 py-10 select-none bg-[#F8FAFC] min-h-screen">
      
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs">
        <div>
          <h1 className="text-base font-bold text-slate-800 uppercase">Shopping Cart</h1>
          <p data-testid="cart-item-count" className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} inside your cart
          </p>
        </div>
        <Link
          to="/"
          data-testid="cart-continue-shopping"
          className="flex items-center gap-1 text-xs font-bold text-[#0F6FFF] hover:underline uppercase"
        >
          <span>Continue Shopping</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ===== LEFT: CART ITEMS ===== */}
        <div className="w-full lg:flex-1 space-y-6">
          
          {/* Free Shipping Indicator */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={15} className="text-[#0F6FFF]" />
              {remainingForFreeShipping > 0 ? (
                <span className="text-xs font-bold text-slate-600">
                  Shop for <span className="text-[#0F6FFF]">₹{remainingForFreeShipping.toFixed(0)}</span> more to unlock <span className="text-emerald-600 font-extrabold">FREE shipping</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600">
                  Congratulations! You have unlocked FREE shipping.
                </span>
              )}
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items list container */}
          <div data-testid="cart-items-list" className="bg-white border border-slate-200/50 rounded-2xl shadow-xs divide-y divide-slate-100 overflow-hidden">
            {cartItems.map((item) => (
              <div
                key={item.id}
                data-testid={`cart-item-${item.product_id}`}
                className="p-4 flex gap-4"
              >
                {/* Thumbnail image */}
                <Link to={`/product/${item.product_id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 border border-slate-100 rounded-sm bg-slate-50 flex items-center justify-center p-1">
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
                </Link>

                {/* Details layout */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/product/${item.product_id}`}
                        data-testid={`cart-item-name-${item.product_id}`}
                        className="font-semibold text-xs sm:text-sm text-slate-800 hover:text-[#0F6FFF] transition-colors line-clamp-2 leading-relaxed"
                      >
                        {item.product.name}
                      </Link>
                      <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                        Category: {item.product.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      disabled={removingId === item.product_id}
                      data-testid={`cart-remove-btn-${item.product_id}`}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
                    {/* Quantity Adjustment controls */}
                    <div
                      data-testid={`cart-quantity-control-${item.product_id}`}
                      className="inline-flex items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        data-testid={`cart-qty-decrease-${item.product_id}`}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                      >
                        <Minus size={11} />
                      </button>
                      <span
                        data-testid={`cart-qty-value-${item.product_id}`}
                        className="w-7 text-center text-xs font-bold text-slate-800 select-none"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        data-testid={`cart-qty-increase-${item.product_id}`}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* Costing values */}
                    <div className="text-right">
                      <div
                        data-testid={`cart-item-total-${item.product_id}`}
                        className="text-sm font-extrabold text-slate-900"
                      >
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        ₹{item.product.price.toLocaleString('en-IN')} × {item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon codes box */}
          <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <Gift size={15} className="text-[#0F6FFF]" />
              <span>Have a Promo Coupon?</span>
            </div>

            {appliedPromo ? (
              <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-200 rounded-sm px-3 py-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Tag size={13} />
                  <span>{appliedPromo.code} Applied</span>
                  <span className="text-[10px] font-normal text-emerald-600">({appliedPromo.discount}% OFF)</span>
                </div>
                <button
                  onClick={() => setAppliedPromo(null)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="promo-code-input"
                    data-testid="promo-code-input"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    aria-label="Promo coupon code"
                    aria-describedby={promoError ? 'promo-error-alert' : undefined}
                    placeholder="Enter Promo (e.g. SARATHI10)"
                    className="flex-1 px-3 py-2 border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-[#0F6FFF]"
                  />
                  <button
                    onClick={handleApplyPromo}
                    data-testid="promo-apply-btn"
                    className="px-4 py-2 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p id="promo-error-alert" data-testid="promo-error-msg" className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <Info size={12} />
                    {promoError}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Try Coupons: SARATHI10 · SAVE20 · ELITE15</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT: PRICE BREAKDOWN SUMMARY ===== */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-white border border-slate-200/50 rounded-2xl shadow-xs divide-y divide-slate-100 sticky top-24 overflow-hidden">
            <div className="px-4 py-3.5 bg-slate-50/60">
              <h2 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Price Details</h2>
            </div>

            <div className="p-4 space-y-3.5">
              {/* Row lines */}
              <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                <span>Price ({cartItems.length} items)</span>
                <span className="text-slate-800">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    Coupon Discount ({appliedPromo.code})
                  </span>
                  <span>−₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                <span>Estimated VAT Tax (8%)</span>
                <span className="text-slate-800">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                <span>Logistics Delivery Charges</span>
                <span className={`font-semibold ${cartTotal >= FREE_SHIPPING_THRESHOLD ? 'text-[#10B981]' : 'text-slate-850'}`}>
                  {cartTotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : `₹${(49).toFixed(2)}`}
                </span>
              </div>

              {/* Total amount border */}
              <div className="border-t border-dashed border-slate-200 pt-3.5 flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm uppercase">Total Amount</span>
                <span className="text-lg font-black text-[#0F6FFF]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {appliedPromo && (
                <p className="text-[10px] text-[#10B981] font-bold text-right">
                  Congrats! You saved ₹{discountAmount.toFixed(2)} with coupon {appliedPromo.code}
                </p>
              )}

              {/* Proceed to checkout action */}
              <button
                onClick={() => navigate('/checkout')}
                id="cart-checkout-btn"
                data-testid="cart-checkout-btn"
                className="w-full mt-2 py-3 bg-[#14B8A6] hover:bg-[#e68f00] text-white text-xs font-extrabold rounded-sm uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>

              {/* Security badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                {[
                  { icon: <Shield size={13} />, label: '100% Secure' },
                  { icon: <Truck size={13} />, label: 'Fast Delivery' },
                  { icon: <RefreshCw size={13} />, label: 'Easy Returns' },
                ].map((b) => (
                  <div key={b.label} className="flex flex-col items-center gap-1 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                    <span className="text-[#0F6FFF]">{b.icon}</span>
                    <span>{b.label}</span>
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
