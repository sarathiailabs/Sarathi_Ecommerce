import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle2,
  MapPin,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Truck,
  Banknote,
  Smartphone,
  Gift,
  Shield,
  Lock,
  User,
  Phone,
  Home,
  Building2,
  Mail,
  Hash,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ─── Types ───────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3

interface AddressForm {
  full_name: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  pincode: string
}

type PaymentMethod = 'card' | 'cod' | 'upi' | 'wallet'

interface CardDetails {
  number: string
  name: string
  expiry: string
  cvv: string
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ currentStep: Step }> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Address', icon: MapPin },
    { id: 2, label: 'Order Summary', icon: ShoppingBag },
    { id: 3, label: 'Payment', icon: CreditCard },
  ]
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : isActive
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-900 border-white/10 text-slate-500'
                  }`}
              >
                {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-[11px] font-semibold whitespace-nowrap ${isActive ? 'text-purple-300' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 sm:w-24 mx-2 mb-5 transition-all duration-500 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()

  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdOrder, setCreatedOrder] = useState<any>(null)

  // Address form
  const [address, setAddress] = useState<AddressForm>({
    full_name: user?.full_name || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [addressErrors, setAddressErrors] = useState<Partial<AddressForm>>({})

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  })

  const [upiId, setUpiId] = useState('')

  const [paymentErrors, setPaymentErrors] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    upi: '',
  })

  const taxRate = 0.08
  const taxAmount = cartTotal * taxRate
  const codFee = paymentMethod === 'cod' ? 6 : 0
  const grandTotal = cartTotal + taxAmount + codFee

  // ── Redirect if cart empty ──────────────────────────────────────────────────
  if (cartItems.length === 0 && !createdOrder) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 text-slate-500 mb-2">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          Browse Catalog
        </Link>
      </div>
    )
  }

  // ── Order Success Screen ───────────────────────────────────────────────────
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-8">
        {/* Animated check */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/10 animate-bounce-slow">
            <CheckCircle2 size={52} className="text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Order Placed! 🎉</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Your order has been confirmed and is now <span className="text-purple-300 font-semibold">Pending</span>. You'll receive updates soon.
          </p>
        </div>

        {/* Order card */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden text-left max-w-md mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-white/5 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Order Confirmation</span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">#{createdOrder.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Deliver To</p>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-200">{address.full_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{address.phone}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} – {address.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5" />

            {/* Items */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Items Ordered</p>
              {createdOrder.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                    <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5" />

            {/* Payment Method */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Payment Method</span>
              <span className="text-xs font-semibold text-slate-200 capitalize">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'wallet' ? 'Wallet' : 'Credit/Debit Card'}
              </span>
            </div>

            {/* Totals */}
            <div className="bg-slate-900/60 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tax (8%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-xs text-slate-400">
                  <span>COD Handling Fee</span>
                  <span>${codFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white border-t border-white/5 pt-2 mt-2">
                <span>Total Charged</span>
                <span className="text-purple-400">₹{Number(createdOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            to="/orders"
            className="px-7 py-3 rounded-xl text-sm font-bold bg-slate-900 border border-white/10 text-slate-200 hover:text-white hover:bg-slate-800 transition-all duration-200"
          >
            View Order History
          </Link>
          <Link
            to="/"
            className="px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all duration-200 shadow-lg shadow-purple-600/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateAddress = () => {
    const errors: Partial<AddressForm> = {}
    if (!address.full_name.trim()) errors.full_name = 'Full name is required'
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone.trim()))
      errors.phone = 'Enter a valid 10-digit phone number'
    if (!address.address_line1.trim()) errors.address_line1 = 'Address is required'
    if (!address.city.trim()) errors.city = 'City is required'
    if (!address.state.trim()) errors.state = 'State is required'
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode.trim()))
      errors.pincode = 'Enter a valid 6-digit pincode'
    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (validateAddress()) setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  // ─── Place Order ───────────────────────────────────────────────────────────
  const validatePayment = () => {
    const errors = {
      number: '',
      name: '',
      expiry: '',
      cvv: '',
      upi: '',
    }

    // Card Validation
    if (paymentMethod === 'card') {
      if (!cardDetails.number.trim()) {
        errors.number = 'Card number is required'
      } else if (cardDetails.number.replace(/\s/g, '').length !== 16) {
        errors.number = 'Card number must be 16 digits'
      }

      if (!cardDetails.name.trim()) {
        errors.name = 'Card holder name is required'
      }

      if (!cardDetails.expiry.trim()) {
        errors.expiry = 'Expiry date is required'
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
        errors.expiry = 'Invalid expiry date'
      }

      if (!cardDetails.cvv.trim()) {
        errors.cvv = 'CVV is required'
      } else if (cardDetails.cvv.length !== 3) {
        errors.cvv = 'Invalid CVV'
      }
    }

    // UPI Validation
    if (paymentMethod === 'upi') {
      if (!upiId.trim()) {
        errors.upi = 'UPI ID is required'
      } else if (!upiId.includes('@')) {
        errors.upi = 'Enter valid UPI ID'
      }
    }

  



    setPaymentErrors(errors)

    return Object.values(errors).every((e) => e === '')
  }


  const handlePlaceOrder = async () => {
    if (!validatePayment()) {
      return
    }
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const shippingAddress = `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`
      const response = await api.post('/orders', {
        shipping_address: shippingAddress,
        phone: address.phone,
        full_name: address.full_name,
        payment_method: paymentMethod,
      })
      setCreatedOrder(response.data)
      clearCart()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'An error occurred during checkout.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Address Step ──────────────────────────────────────────────────────────
  const renderAddressStep = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <MapPin size={15} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Delivery Address</h2>
          <p className="text-xs text-slate-500">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <User size={11} className="inline mr-1" />Full Name *
          </label>
          <input
            type="text"
            value={address.full_name}
            onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${addressErrors.full_name ? 'border-red-500/60' : 'border-white/8'}`}
          />
          {addressErrors.full_name && <p className="text-red-400 text-[10px] mt-1">{addressErrors.full_name}</p>}
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <Phone size={11} className="inline mr-1" />Phone Number *
          </label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${addressErrors.phone ? 'border-red-500/60' : 'border-white/8'}`}
          />
          {addressErrors.phone && <p className="text-red-400 text-[10px] mt-1">{addressErrors.phone}</p>}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <Home size={11} className="inline mr-1" />House / Flat / Block No. *
          </label>
          <input
            type="text"
            value={address.address_line1}
            onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
            placeholder="e.g. 42, Green Valley Apartments"
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${addressErrors.address_line1 ? 'border-red-500/60' : 'border-white/8'}`}
          />
          {addressErrors.address_line1 && <p className="text-red-400 text-[10px] mt-1">{addressErrors.address_line1}</p>}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <Building2 size={11} className="inline mr-1" />Street / Area / Locality
          </label>
          <input
            type="text"
            value={address.address_line2}
            onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
            placeholder="e.g. Near City Mall, MG Road"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-white/8 text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <Mail size={11} className="inline mr-1" />City / Town *
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            placeholder="e.g. Mumbai"
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${addressErrors.city ? 'border-red-500/60' : 'border-white/8'}`}
          />
          {addressErrors.city && <p className="text-red-400 text-[10px] mt-1">{addressErrors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">State *</label>
          <select
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all appearance-none ${addressErrors.state ? 'border-red-500/60' : 'border-white/8'}`}
          >
            <option value="" className="bg-slate-900">Select State</option>
            {['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map((s) => (
              <option key={s} value={s} className="bg-slate-900">{s}</option>
            ))}
          </select>
          {addressErrors.state && <p className="text-red-400 text-[10px] mt-1">{addressErrors.state}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            <Hash size={11} className="inline mr-1" />Pincode *
          </label>
          <input
            type="text"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            placeholder="6-digit pincode"
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${addressErrors.pincode ? 'border-red-500/60' : 'border-white/8'}`}
          />
          {addressErrors.pincode && <p className="text-red-400 text-[10px] mt-1">{addressErrors.pincode}</p>}
        </div>
      </div>
    </div>
  )

  // ─── Order Summary Step ────────────────────────────────────────────────────
  const renderOrderSummaryStep = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <ShoppingBag size={15} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Order Summary</h2>
          <p className="text-xs text-slate-500">Review your items before placing the order</p>
        </div>
      </div>

      {/* Deliver To */}
      <div className="glass rounded-xl p-4 border border-white/5 flex items-start gap-3">
        <MapPin size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Deliver To</p>
          <p className="text-sm font-bold text-slate-200">{address.full_name} <span className="text-slate-400 font-normal text-xs">· {address.phone}</span></p>
          <p className="text-xs text-slate-400 mt-0.5">
            {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} – {address.pincode}
          </p>
        </div>
        <button onClick={() => setStep(1)} className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors border border-purple-500/30 rounded-lg px-2.5 py-1 hover:bg-purple-500/10">
          Change
        </button>
      </div>

      {/* Cart items */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} className="glass rounded-xl p-4 border border-white/5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
              <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 line-clamp-1">{item.product.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{item.product.category}</p>
              <p className="text-xs text-slate-400 mt-1">Qty: <span className="text-white font-bold">{item.quantity}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              <p className="text-[10px] text-slate-500">₹{Number(item.product.price).toFixed(2)} each</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="glass rounded-xl p-4 border border-white/5 space-y-2.5">
        <div className="flex justify-between text-xs text-slate-400">
          <span>MRP ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
          <span className="text-slate-200">₹{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Estimated Tax (8%)</span>
          <span className="text-slate-200">₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Delivery Charges</span>
          <span className="text-emerald-400 font-semibold">FREE</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white border-t border-white/5 pt-3">
          <span>Total Amount</span>
          <span className="text-purple-400">₹{(cartTotal + taxAmount).toFixed(2)}</span>
        </div>
        <p className="text-[10px] text-emerald-400 font-semibold">✓ Free delivery on this order!</p>
      </div>
    </div>
  )

  // ─── Payment Step ──────────────────────────────────────────────────────────
  const paymentOptions = [
    { id: 'card' as PaymentMethod, label: 'Credit / Debit / ATM Card', icon: CreditCard, badge: 'Up to 5% cashback', available: true },
    { id: 'cod' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote, badge: '+$6 handling fee', available: true },
    { id: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone, badge: '2% cashback', available: true },
    { id: 'wallet' as PaymentMethod, label: 'Gift Card / Wallet', icon: Gift, badge: null, available: false },
  ]

  const renderPaymentStep = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
            <CreditCard size={15} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Complete Payment</h2>
            <p className="text-xs text-slate-500">Choose your preferred payment method</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
          <Lock size={10} />100% Secure
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Payment methods list */}
        <div className="lg:w-2/5 space-y-2">
          {paymentOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected = paymentMethod === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => opt.available && setPaymentMethod(opt.id)}
                disabled={!opt.available}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${!opt.available
                  ? 'opacity-40 cursor-not-allowed border-white/5 bg-slate-900/30'
                  : isSelected
                    ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                    : 'border-white/8 bg-slate-900/40 hover:border-white/15 hover:bg-slate-900/60'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-purple-500' : 'border-slate-600'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                    </div>
                    <Icon size={16} className={isSelected ? 'text-purple-400' : 'text-slate-400'} />
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{opt.label}</span>
                  </div>
                  {!opt.available && (
                    <span className="text-[10px] text-slate-500 bg-slate-900 border border-white/5 rounded px-1.5 py-0.5">Unavailable</span>
                  )}
                </div>
                {opt.badge && opt.available && (
                  <p className={`text-[10px] mt-1.5 ml-7 font-semibold ${opt.id === 'cod' ? 'text-amber-400' : 'text-emerald-400'}`}>{opt.badge}</p>
                )}
              </button>
            )
          })}
        </div>

        {/* Right: Payment details panel */}
        <div className="lg:flex-1">
          {paymentMethod === 'card' && (
            <div className="glass rounded-xl border border-white/8 p-5 space-y-4">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Enter Card Details</p>

              {/* Card preview */}
              <div className="relative h-36 rounded-xl bg-gradient-to-br from-purple-700 via-indigo-700 to-slate-800 p-5 overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent)]" />
                <div className="absolute top-3 right-4 text-slate-300/40 text-5xl font-bold select-none">VISA</div>
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-white font-mono text-sm tracking-[0.2em]">{cardDetails.number ? cardDetails.number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</p>
                  <div className="flex justify-between mt-1.5">
                    <p className="text-slate-300 text-[10px] uppercase">{cardDetails.name || 'Card Holder'}</p>
                    <p className="text-slate-300 text-[10px]">{cardDetails.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 font-mono transition-all ${paymentErrors.number ? 'border-red-500/60' : 'border-white/8'}`}
                  />
                  {paymentErrors.number && <p className="text-red-400 text-[10px] mt-1">{paymentErrors.number}</p>}
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Name on Card</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${paymentErrors.name ? 'border-red-500/60' : 'border-white/8'}`}
                  />
                  {paymentErrors.name && <p className="text-red-400 text-[10px] mt-1">{paymentErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                        setCardDetails({ ...cardDetails, expiry: v })
                      }}
                      placeholder="MM/YY"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 font-mono transition-all ${paymentErrors.expiry ? 'border-red-500/60' : 'border-white/8'}`}
                    />
                    {paymentErrors.expiry && <p className="text-red-400 text-[10px] mt-1">{paymentErrors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-semibold">CVV</label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="•••"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 font-mono transition-all ${paymentErrors.cvv ? 'border-red-500/60' : 'border-white/8'}`}
                    />
                    {paymentErrors.cvv && <p className="text-red-400 text-[10px] mt-1">{paymentErrors.cvv}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="glass rounded-xl border border-amber-500/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Banknote size={18} />
                <span className="font-bold text-sm">Cash on Delivery</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay in cash when your order arrives at your doorstep. Due to handling costs, a nomimal fee of <span className="text-amber-400 font-semibold">₹6.00</span> will be charged for orders using this option. Avoid this fee by paying online now.
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-semibold">COD Handling Fee</span>
                  <span className="text-amber-400 font-bold">+₹6.00</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Truck size={12} />
                <span>Estimated delivery: 3–5 business days</span>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="glass rounded-xl border border-white/8 p-5 space-y-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Smartphone size={18} />
                <span className="font-bold text-sm">Pay via UPI</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5 font-semibold">Enter UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-900/70 border text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all ${paymentErrors.upi ? 'border-red-500/60' : 'border-white/8'}`}
                />
                {paymentErrors.upi && <p className="text-red-400 text-[10px] mt-1">{paymentErrors.upi}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <div key={app} className="text-[11px] font-semibold text-slate-400 bg-slate-900/60 border border-white/8 rounded-lg px-3 py-1.5">
                    {app}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold">✓ Get 2% cashback on UPI payments</p>
            </div>
          )}

          {/* Price summary */}
          <div className="mt-4 glass rounded-xl border border-white/5 p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Price Breakdown</p>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Tax (8%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Delivery</span>
              <span className="text-emerald-400 font-semibold">FREE</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-xs text-amber-400">
                <span>COD Handling Fee</span>
                <span>+₹{codFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white border-t border-white/5 pt-2.5">
              <span>Total</span>
              <span className="text-purple-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secure trust badges */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Shield size={11} className="text-emerald-500" />
          <span>256-bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Lock size={11} className="text-blue-400" />
          <span>PCI DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <CheckCircle2 size={11} className="text-purple-400" />
          <span>100% Money-back Guarantee</span>
        </div>
      </div>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Page heading */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step === 1 ? navigate('/cart') : setStep((step - 1) as Step)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-white/8 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-500">{cartItems.length} item{cartItems.length > 1 ? 's' : ''} · ₹{grandTotal.toFixed(2)} total</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Error */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-950/40 text-red-200 text-xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main card */}
      <div className="glass rounded-2xl border border-white/5 p-6 sm:p-8">
        {step === 1 && renderAddressStep()}
        {step === 2 && renderOrderSummaryStep()}
        {step === 3 && renderPaymentStep()}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
          <button
            onClick={() => step === 1 ? navigate('/cart') : setStep((step - 1) as Step)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-slate-900 border border-white/8 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft size={14} />
            {step === 1 ? 'Back to Cart' : 'Previous'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200"
            >
              {step === 1 ? 'Confirm Address' : 'Proceed to Payment'}
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.99] disabled:scale-100 transition-all duration-200"
            >
              {submitting ? 'Placing Order...' : `Place Order · ₹${grandTotal.toFixed(2)}`}
              {!submitting && <Lock size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
