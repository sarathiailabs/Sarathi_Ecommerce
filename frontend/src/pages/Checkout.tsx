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
  Home as HomeIcon,
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
    <div className="flex items-center justify-center gap-0 mb-10 bg-white border-3 border-[#1D1C1A] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1D1C1A]">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                  ? 'bg-emerald-500 border-[#1D1C1A] text-[#1D1C1A]'
                  : isActive
                    ? 'bg-[#F5B025] border-[#1D1C1A] text-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A]'
                    : 'bg-[#FAF6EE] border-[#1D1C1A]/10 text-[#1D1C1A]/40'
                  }`}
              >
                {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-[#E1392A]' : isCompleted ? 'text-emerald-700' : 'text-[#1D1C1A]/40'
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 w-12 sm:w-20 mx-2 mb-5 transition-all duration-500 border-2 border-[#1D1C1A] rounded-full ${currentStep > step.id ? 'bg-[#E1392A]' : 'bg-[#FAF6EE]'
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
      <div className="max-w-md mx-auto px-6 py-16 text-center bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[5px_5px_0px_0px_#1D1C1A] mt-12 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FAF6EE] border-3 border-[#1D1C1A] text-[#1D1C1A] shadow-[3px_3px_0px_0px_#1D1C1A]">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-xl font-black uppercase text-[#1D1C1A]">Your cart is empty</h2>
        <Link
          to="/"
          className="btn-primary text-xs px-6 py-3 font-black uppercase tracking-widest inline-flex items-center"
        >
          Browse Catalog
        </Link>
      </div>
    )
  }

  // ── Order Success Screen ───────────────────────────────────────────────────
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center space-y-8 bg-[#FAF6EE]">
        {/* Animated check */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500 border-4 border-[#1D1C1A] flex items-center justify-center shadow-[6px_6px_0px_0px_#1D1C1A] animate-bounce-slow">
            <CheckCircle2 size={52} className="text-[#1D1C1A]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#1D1C1A] uppercase tracking-tight">Order Placed! 🎉</h1>
          <p className="text-[#615E59] text-sm max-w-sm mx-auto leading-relaxed font-bold">
            Your order has been confirmed and is now <span className="text-[#E1392A] font-black uppercase">Pending</span>. You'll receive updates soon.
          </p>
        </div>

        {/* Order card */}
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[5px_5px_0px_0px_#1D1C1A] overflow-hidden text-left max-w-md mx-auto">
          {/* Header */}
          <div className="bg-[#FAF6EE] border-b-3 border-[#1D1C1A] px-5 py-3.5 flex items-center justify-between">
            <span className="text-xs font-black text-[#1D1C1A] uppercase tracking-widest">Order Confirmation</span>
            <span className="text-[10px] font-mono text-[#1D1C1A] bg-[#F5B025]/20 border border-[#1D1C1A] px-2 py-0.5 rounded">#{createdOrder.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-[#615E59] font-black">Deliver To</p>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#E1392A] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-black text-[#1D1C1A]">{address.full_name}</p>
                  <p className="text-xs text-[#615E59] font-bold mt-0.5">{address.phone}</p>
                  <p className="text-xs text-[#615E59] font-bold mt-0.5 leading-relaxed">
                    {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} – {address.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#1D1C1A]/10" />

            {/* Items */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-[#615E59] font-black">Items Ordered</p>
              {createdOrder.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#FAF6EE] border-2 border-[#1D1C1A] flex-shrink-0 flex items-center justify-center">
                    <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#1D1C1A] line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-[#615E59] font-bold">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-[#1D1C1A]">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1D1C1A]/10" />

            {/* Payment Method */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#615E59] font-bold">Payment Method</span>
              <span className="text-xs font-black text-[#1D1C1A] capitalize">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'wallet' ? 'Wallet' : 'Credit/Debit Card'}
              </span>
            </div>

            {/* Totals */}
            <div className="bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-[#615E59] font-semibold">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#615E59] font-semibold">
                <span>Tax (8%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-xs text-[#615E59] font-semibold">
                  <span>COD Handling Fee</span>
                  <span>₹{codFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#1D1C1A] border-t border-[#1D1C1A]/10 pt-2 mt-2">
                <span>Total Charged</span>
                <span className="text-[#E1392A] font-black text-base">₹{Number(createdOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            to="/orders"
            className="btn-secondary text-xs px-6 py-3.5 font-black uppercase tracking-wider inline-flex items-center justify-center"
          >
            View Order History
          </Link>
          <Link
            to="/"
            className="btn-primary text-xs px-6 py-3.5 font-black uppercase tracking-wider inline-flex items-center justify-center"
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

<<<<<<< HEAD
=======




>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
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
      <div className="flex items-center gap-2 mb-6 border-b-2 border-[#1D1C1A]/10 pb-3">
        <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center">
          <MapPin size={15} className="text-[#E1392A]" />
        </div>
        <div>
          <h2 className="text-base font-black uppercase tracking-tight text-[#1D1C1A]">Delivery Address</h2>
          <p className="text-xs text-[#615E59] font-medium">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">
            <User size={11} className="inline mr-1" />Full Name *
          </label>
          <input
            type="text"
            value={address.full_name}
            onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${addressErrors.full_name ? 'border-[#E1392A]' : ''}`}
          />
          {addressErrors.full_name && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{addressErrors.full_name}</p>}
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">
            <Phone size={11} className="inline mr-1" />Phone Number *
          </label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${addressErrors.phone ? 'border-[#E1392A]' : ''}`}
          />
          {addressErrors.phone && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{addressErrors.phone}</p>}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">
            <HomeIcon size={11} className="inline mr-1" />House / Flat / Block No. *
          </label>
          <input
            type="text"
            value={address.address_line1}
            onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
            placeholder="e.g. 42, Green Valley Apartments"
            className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${addressErrors.address_line1 ? 'border-[#E1392A]' : ''}`}
          />
          {addressErrors.address_line1 && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{addressErrors.address_line1}</p>}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">
            <Building2 size={11} className="inline mr-1" />Street / Area / Locality
          </label>
          <input
            type="text"
            value={address.address_line2}
            onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
            placeholder="e.g. Near City Mall, MG Road"
            className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">
            <Mail size={11} className="inline mr-1" />City / Town *
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            placeholder="e.g. Mumbai"
            className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${addressErrors.city ? 'border-[#E1392A]' : ''}`}
          />
          {addressErrors.city && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{addressErrors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">State *</label>
          <div className="relative">
            <select
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all appearance-none cursor-pointer ${addressErrors.state ? 'border-[#E1392A]' : ''}`}
            >
              <option value="" className="bg-white">Select State</option>
              {['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map((s) => (
                <option key={s} value={s} className="bg-white">{s}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1D1C1A]">
              ▼
            </div>
          </div>
          {addressErrors.state && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{addressErrors.state}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider mb-1.5">
            <Hash size={11} className="inline mr-1" />Pincode *
          </label>
          <input
            type="text"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            placeholder="6-digit pincode"
            className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${addressErrors.pincode ? 'border-[#E1392A]' : ''}`}
          />
          {addressErrors.pincode && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{addressErrors.pincode}</p>}
        </div>
      </div>
    </div>
  )

  // ─── Order Summary Step ────────────────────────────────────────────────────
  const renderOrderSummaryStep = () => (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-[#1D1C1A]/10 pb-3">
        <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center">
          <ShoppingBag size={15} className="text-[#E1392A]" />
        </div>
        <div>
          <h2 className="text-base font-black uppercase tracking-tight text-[#1D1C1A]">Order Summary</h2>
          <p className="text-xs text-[#615E59] font-medium">Review your items before placing the order</p>
        </div>
      </div>

      {/* Deliver To */}
      <div className="bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl p-4 flex items-start gap-3 shadow-[2px_2px_0px_0px_#1D1C1A]">
        <MapPin size={14} className="text-[#E1392A] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-[#615E59] font-black mb-1">Deliver To</p>
          <p className="text-sm font-black text-[#1D1C1A]">{address.full_name} <span className="text-[#615E59] font-bold text-xs">· {address.phone}</span></p>
          <p className="text-xs text-[#615E59] font-bold mt-0.5">
            {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} – {address.pincode}
          </p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="text-[10px] font-black uppercase tracking-wider text-[#E1392A] border border-[#1D1C1A] hover:bg-[#E1392A]/10 rounded-lg px-2.5 py-1.5 transition-colors bg-white shadow-xs"
        >
          Change
        </button>
      </div>

      {/* Cart items */}
      <div data-testid="checkout-items-list" className="space-y-3">
        {cartItems.map((item) => (
          <div key={item.id} data-testid={`checkout-item-${item.product_id}`} className="bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl p-4 flex items-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border-2 border-[#1D1C1A] flex-shrink-0 flex items-center justify-center">
              <img src={item.product.image_url} alt={item.product.name} className="object-cover w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-[#1D1C1A] line-clamp-1">{item.product.name}</p>
              <p className="text-[9px] text-[#615E59] font-bold mt-0.5 uppercase tracking-widest">{item.product.category}</p>
              <p className="text-xs text-[#615E59] font-bold mt-1">Qty: <span className="text-[#1D1C1A] font-black">{item.quantity}</span></p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black text-[#1D1C1A]">₹{(item.product.price * item.quantity).toFixed(2)}</p>
              <p className="text-[9px] text-[#615E59] font-black uppercase tracking-wider mt-0.5">₹{Number(item.product.price).toFixed(2)} each</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-white border-2 border-[#1D1C1A] rounded-xl p-4 space-y-2.5 shadow-[2px_2px_0px_0px_#1D1C1A]">
        <div className="flex justify-between text-xs text-[#615E59] font-semibold">
          <span>MRP ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
          <span className="text-[#1D1C1A] font-black">₹{cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#615E59] font-semibold">
          <span>Estimated Tax (8%)</span>
          <span className="text-[#1D1C1A] font-black">₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#615E59] font-semibold">
          <span>Delivery Charges</span>
          <span className="text-emerald-600 font-black uppercase">FREE</span>
        </div>
        <div className="flex justify-between text-sm font-black text-[#1D1C1A] border-t border-[#1D1C1A]/10 pt-3">
          <span>Total Amount</span>
          <span className="text-[#E1392A] font-black text-base">
            ₹{(cartTotal + taxAmount).toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Free delivery on this order!</p>
      </div>
    </div>
  )

  // ─── Payment Step ──────────────────────────────────────────────────────────
  const paymentOptions = [
<<<<<<< HEAD
    { id: 'card' as PaymentMethod, label: 'Credit / Debit Card', icon: CreditCard, badge: 'Up to 5% cashback', available: true },
    { id: 'cod' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote, badge: '+$6 handling fee', available: true },
    { id: 'upi' as PaymentMethod, label: 'UPI (GPay / PhonePe / PayTM)', icon: Smartphone, badge: '2% cashback', available: true },
=======
    { id: 'card' as PaymentMethod, label: 'Credit / Debit / ATM Card', icon: CreditCard, badge: 'Up to 5% cashback', available: true },
    { id: 'cod' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote, badge: '+₹6 handling fee', available: true },
    { id: 'upi' as PaymentMethod, label: 'UPI', icon: Smartphone, badge: '2% cashback', available: true },
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
    { id: 'wallet' as PaymentMethod, label: 'Gift Card / Wallet', icon: Gift, badge: null, available: false },
  ]

  const renderPaymentStep = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-2 border-b-2 border-[#1D1C1A]/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center">
            <CreditCard size={15} className="text-[#E1392A]" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-[#1D1C1A]">Complete Payment</h2>
            <p className="text-xs text-[#615E59] font-medium">Choose your preferred payment method</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 font-bold uppercase tracking-wider">
          <Lock size={10} />100% Secure
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Payment methods list */}
        <div data-testid="checkout-payment-methods" className="lg:w-2/5 space-y-2">
          {paymentOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected = paymentMethod === opt.id
            return (
              <button
                key={opt.id}
                data-testid={`payment-method-${opt.id}`}
                onClick={() => opt.available && setPaymentMethod(opt.id)}
                disabled={!opt.available}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${!opt.available}
                  ? 'opacity-40 cursor-not-allowed border-[#1D1C1A]/10 bg-[#FAF6EE]'
                  : isSelected
                    ? 'border-[#1D1C1A] bg-[#FAF6EE] shadow-[3px_3px_0px_0px_#1D1C1A] font-black'
                    : 'border-[#1D1C1A] bg-white hover:bg-[#FAF6EE]/50 text-[#1D1C1A]'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 border-[#1D1C1A] flex items-center justify-center flex-shrink-0 bg-white`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#E1392A]" />}
                    </div>
                    <Icon size={16} className={isSelected ? 'text-[#E1392A]' : 'text-[#1D1C1A]/60'} />
                    <span className={`text-xs uppercase font-black tracking-wider ${isSelected ? 'text-[#1D1C1A]' : 'text-[#1D1C1A]/70'}`}>{opt.label}</span>
                  </div>
                  {!opt.available && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#615E59] bg-[#FAF6EE] border border-[#1D1C1A]/10 rounded px-1.5 py-0.5">Soon</span>
                  )}
                </div>
                {opt.badge && opt.available && (
                  <p className={`text-[10px] mt-1.5 ml-7 font-black uppercase tracking-wider text-[#E1392A]`}>{opt.badge}</p>
                )}
              </button>
            )
          })}
        </div>

        {/* Right: Payment details panel */}
        <div className="lg:flex-1">
          {paymentMethod === 'card' && (
            <div className="bg-white border-2 border-[#1D1C1A] rounded-xl p-5 space-y-4 shadow-[2px_2px_0px_0px_#1D1C1A]">
              <p className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Enter Card Details</p>

              {/* Card preview */}
              <div className="relative h-36 rounded-xl bg-gradient-to-br from-[#E1392A] via-[#df3121] to-[#F5B025] p-5 overflow-hidden shadow-xl border-2 border-[#1D1C1A]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent)]" />
                <div className="absolute top-3 right-4 text-[#1D1C1A]/20 text-5xl font-black select-none tracking-widest">VISA</div>
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-white font-mono text-sm tracking-[0.2em]">{cardDetails.number ? cardDetails.number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</p>
                  <div className="flex justify-between mt-2.5">
                    <p className="text-white font-black uppercase text-[9px] tracking-wider">{cardDetails.name || 'Card Holder'}</p>
                    <p className="text-white font-mono text-[9px]">{cardDetails.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-[#1D1C1A] font-black uppercase tracking-wider mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] font-mono transition-all ${paymentErrors.number ? 'border-[#E1392A]' : ''}`}
                  />
                  {paymentErrors.number && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{paymentErrors.number}</p>}
                </div>
                <div>
                  <label className="block text-[10px] text-[#1D1C1A] font-black uppercase tracking-wider mb-1">Name on Card</label>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${paymentErrors.name ? 'border-[#E1392A]' : ''}`}
                  />
                  {paymentErrors.name && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{paymentErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#1D1C1A] font-black uppercase tracking-wider mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                        setCardDetails({ ...cardDetails, expiry: v })
                      }}
                      placeholder="MM/YY"
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] font-mono transition-all ${paymentErrors.expiry ? 'border-[#E1392A]' : ''}`}
                    />
                    {paymentErrors.expiry && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{paymentErrors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#1D1C1A] font-black uppercase tracking-wider mb-1">CVV</label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="•••"
                      className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] font-mono transition-all ${paymentErrors.cvv ? 'border-[#E1392A]' : ''}`}
                    />
                    {paymentErrors.cvv && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{paymentErrors.cvv}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl p-5 space-y-3 shadow-[2px_2px_0px_0px_#1D1C1A]">
              <div className="flex items-center gap-2 text-[#E1392A]">
                <Banknote size={18} />
                <span className="font-black text-xs uppercase tracking-wider">Cash on Delivery</span>
              </div>
              <p className="text-xs text-[#615E59] font-semibold leading-relaxed">
                Pay in cash when your order arrives. Due to handling costs, a nominal fee of <span className="text-[#E1392A] font-black">₹6.00</span> will be added. Complete your payment online to avoid this fee.
              </p>
              <div className="bg-white border-2 border-[#1D1C1A] rounded-xl p-4 shadow-xs">
                <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                  <span className="text-[#615E59]">COD Handling Fee</span>
                  <span className="text-[#E1392A]">+₹6.00</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#615E59] font-black uppercase tracking-wider">
                <Truck size={12} className="text-[#E1392A]" />
                <span>Delivery: 3–5 business days</span>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="bg-white border-2 border-[#1D1C1A] rounded-xl p-5 space-y-4 shadow-[2px_2px_0px_0px_#1D1C1A]">
              <div className="flex items-center gap-2 text-[#E1392A]">
                <Smartphone size={18} />
                <span className="font-black text-xs uppercase tracking-wider">Pay via UPI</span>
              </div>
              <div>
                <label className="block text-[10px] text-[#1D1C1A] font-black uppercase tracking-wider mb-1.5">Enter UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className={`w-full px-4 py-3 rounded-xl bg-white border-2 border-[#1D1C1A] text-sm text-[#1D1C1A] font-bold placeholder-slate-400 outline-none focus:bg-[#FAF6EE] transition-all ${paymentErrors.upi ? 'border-[#E1392A]' : ''}`}
                />
                {paymentErrors.upi && <p className="text-[#E1392A] text-[10px] font-bold mt-1">{paymentErrors.upi}</p>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <div key={app} className="text-[10px] font-black uppercase tracking-wider text-[#1D1C1A] bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-lg px-3 py-1.5 shadow-xs">
                    {app}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Get 2% cashback on UPI payments</p>
            </div>
          )}

          {/* Price summary */}
          <div className="mt-4 bg-white border-2 border-[#1D1C1A] rounded-xl p-4 space-y-2 shadow-xs">
            <p className="text-[9px] uppercase tracking-widest text-[#615E59] font-black mb-2 border-b border-[#1D1C1A]/10 pb-1">Price Breakdown</p>
            <div className="flex justify-between text-xs text-[#615E59] font-semibold">
              <span>Subtotal</span>
              <span className="text-[#1D1C1A] font-black">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#615E59] font-semibold">
              <span>Tax (8%)</span>
              <span className="text-[#1D1C1A] font-black">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#615E59] font-semibold">
              <span>Delivery</span>
              <span className="text-emerald-600 font-black uppercase">FREE</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-xs text-[#E1392A] font-black uppercase">
                <span>COD Handling Fee</span>
                <span>+₹{codFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-[#1D1C1A] border-t border-[#1D1C1A]/10 pt-2.5">
              <span>Total</span>
              <span className="text-[#E1392A] font-black text-base">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secure trust badges */}
      <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-[#1D1C1A]/10 mt-4">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-[#615E59]">
          <Shield size={12} className="text-[#E1392A]" />
          <span>256-bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-[#615E59]">
          <Lock size={12} className="text-[#E1392A]" />
          <span>PCI DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-[#615E59]">
          <CheckCircle2 size={12} className="text-[#E1392A]" />
          <span>100% Safe Payments</span>
        </div>
      </div>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div data-testid="checkout-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Page heading */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step === 1 ? navigate('/cart') : setStep((step - 1) as Step)}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border-2 border-[#1D1C1A] text-[#1D1C1A] hover:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1D1C1A] transition-all"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[#1D1C1A] uppercase tracking-tight">Checkout</h1>
          <p className="text-xs text-[#615E59] font-black uppercase tracking-wider mt-1">{cartItems.length} item{cartItems.length > 1 ? 's' : ''} · ₹{grandTotal.toFixed(2)} total</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Error */}
      {errorMsg && (
        <div data-testid="checkout-error-msg" className="mb-6 p-4 rounded-xl border-2 border-[#E1392A] bg-[#FAF6EE] text-[#E1392A] text-xs font-black uppercase tracking-wider shadow-xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1D1C1A]">
        {step === 1 && renderAddressStep()}
        {step === 2 && renderOrderSummaryStep()}
        {step === 3 && renderPaymentStep()}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-[#1D1C1A]/10">
          <button
            data-testid="checkout-back-btn"
            onClick={() => step === 1 ? navigate('/cart') : setStep((step - 1) as Step)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl btn-secondary text-xs font-black uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            {step === 1 ? 'Back to Cart' : 'Previous'}
          </button>

          {step < 3 ? (
            <button
              data-testid="checkout-next-btn"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-7 py-3 rounded-xl btn-primary text-xs font-black uppercase tracking-wider"
            >
              {step === 1 ? 'Confirm Address' : 'Proceed to Payment'}
              <ChevronRight size={15} />
            </button>
          ) : (
            <button
              id="place-order-btn"
              data-testid="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="flex items-center gap-2 px-7 py-3 rounded-xl btn-primary text-xs font-black uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
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
