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
    <div className="flex items-center justify-center gap-0 mb-8 bg-white border border-slate-200 rounded-sm p-4 shadow-xs">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${isCompleted
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : isActive
                    ? 'bg-[#2874F0] border-[#2874F0] text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={14} />}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#2874F0]' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-2 mb-4 transition-all duration-500 rounded-full ${currentStep > step.id ? 'bg-[#2874F0]' : 'bg-slate-200'
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
      <div data-testid="checkout-empty-state" className="max-w-md mx-auto px-6 py-12 flex flex-col items-center text-center bg-white border border-slate-200 rounded-sm shadow-xs mt-12 space-y-5">
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-2 shadow-2xs">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Your cart is empty</h2>
        <Link
          to="/"
          data-testid="checkout-empty-browse-btn"
          className="px-5 py-2.5 bg-[#2874F0] hover:bg-[#1e5ecb] text-white text-xs font-bold rounded-sm uppercase tracking-wide inline-flex items-center gap-1.5 shadow-xs transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    )
  }

  // ── Order Success Screen ───────────────────────────────────────────────────
  if (createdOrder) {
    return (
      <div data-testid="checkout-success-state" className="max-w-2xl mx-auto px-4 py-10 text-center space-y-6 bg-[#F1F3F6] min-h-screen">
        {/* Animated check */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs mx-auto animate-bounce-slow">
            <CheckCircle2 size={32} className="text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Order Placed! 🎉</h1>
          <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed font-semibold">
            Your order has been confirmed and is now <span className="text-[#FB641B] font-bold uppercase">Pending</span>. You'll receive updates soon.
          </p>
        </div>

        {/* Order card */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden text-left max-w-md mx-auto">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Confirmation</span>
            <span data-testid="success-order-id" className="text-[10px] font-mono text-[#2874F0] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm font-semibold">#{createdOrder.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="p-4 space-y-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Deliver To</p>
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#2874F0] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{address.full_name}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{address.phone}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} – {address.pincode}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Items */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Items Ordered</p>
              {createdOrder.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center p-0.5">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 leading-relaxed">{item.product.name}</p>
                    <p className="text-[10px] text-slate-450">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100" />

            {/* Payment Method */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Payment Method</span>
              <span className="text-xs font-bold text-slate-800 capitalize">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'upi' ? 'UPI' : paymentMethod === 'wallet' ? 'Wallet' : 'Credit/Debit Card'}
              </span>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Subtotal</span>
                <span className="text-slate-800 font-bold">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Tax (8%)</span>
                <span className="text-slate-800 font-bold">₹{taxAmount.toFixed(2)}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>COD Handling Fee</span>
                  <span className="text-slate-800 font-bold">₹{codFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold text-slate-800 border-t border-slate-100 pt-2 mt-2">
                <span>Total Charged</span>
                <span className="text-[#FB641B] font-extrabold text-base">₹{Number(createdOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/orders"
            data-testid="success-view-orders-btn"
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-sm uppercase tracking-wide inline-flex items-center justify-center transition-colors shadow-2xs"
          >
            View Order History
          </Link>
          <Link
            to="/"
            data-testid="success-continue-shopping-btn"
            className="px-5 py-2.5 bg-[#2874F0] hover:bg-[#1e5ecb] text-white text-xs font-bold rounded-sm uppercase tracking-wide inline-flex items-center justify-center transition-colors shadow-2xs"
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2.5">
        <div className="w-8 h-8 rounded-full bg-[#2874F0]/10 text-[#2874F0] flex items-center justify-center flex-shrink-0">
          <MapPin size={15} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Delivery Address</h2>
          <p className="text-xs text-slate-400 font-semibold">Where should we deliver your order?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label htmlFor="address-name" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <User size={11} className="inline mr-1" />Full Name *
          </label>
          <input
            id="address-name"
            type="text"
            value={address.full_name}
            onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
            data-testid="address-name-input"
            aria-describedby={addressErrors.full_name ? 'address-name-error' : undefined}
            placeholder="John Doe"
            className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${addressErrors.full_name ? 'border-red-500' : ''}`}
          />
          {addressErrors.full_name && <p id="address-name-error" data-testid="address-name-error" className="text-red-500 text-[10px] font-bold mt-1">{addressErrors.full_name}</p>}
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label htmlFor="address-phone" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <Phone size={11} className="inline mr-1" />Phone Number *
          </label>
          <input
            id="address-phone"
            type="tel"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            data-testid="address-phone-input"
            aria-describedby={addressErrors.phone ? 'address-phone-error' : undefined}
            placeholder="10-digit mobile number"
            className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${addressErrors.phone ? 'border-red-500' : ''}`}
          />
          {addressErrors.phone && <p id="address-phone-error" data-testid="address-phone-error" className="text-red-500 text-[10px] font-bold mt-1">{addressErrors.phone}</p>}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label htmlFor="address-line1" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <HomeIcon size={11} className="inline mr-1" />House / Flat / Block No. *
          </label>
          <input
            id="address-line1"
            type="text"
            value={address.address_line1}
            onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
            data-testid="address-line1-input"
            aria-describedby={addressErrors.address_line1 ? 'address-line1-error' : undefined}
            placeholder="e.g. 42, Green Valley Apartments"
            className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${addressErrors.address_line1 ? 'border-red-500' : ''}`}
          />
          {addressErrors.address_line1 && <p id="address-line1-error" data-testid="address-line1-error" className="text-red-500 text-[10px] font-bold mt-1">{addressErrors.address_line1}</p>}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label htmlFor="address-line2" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <Building2 size={11} className="inline mr-1" />Street / Area / Locality
          </label>
          <input
            id="address-line2"
            type="text"
            value={address.address_line2}
            onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
            data-testid="address-line2-input"
            placeholder="e.g. Near City Mall, MG Road"
            className="w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="address-city" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <Mail size={11} className="inline mr-1" />City / Town *
          </label>
          <input
            id="address-city"
            type="text"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            data-testid="address-city-input"
            aria-describedby={addressErrors.city ? 'address-city-error' : undefined}
            placeholder="e.g. Mumbai"
            className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${addressErrors.city ? 'border-red-500' : ''}`}
          />
          {addressErrors.city && <p id="address-city-error" data-testid="address-city-error" className="text-red-500 text-[10px] font-bold mt-1">{addressErrors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label htmlFor="address-state" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">State *</label>
          <div className="relative">
            <select
              id="address-state"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              data-testid="address-state-select"
              aria-describedby={addressErrors.state ? 'address-state-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all appearance-none cursor-pointer ${addressErrors.state ? 'border-red-500' : ''}`}
            >
              <option value="" className="bg-white">Select State</option>
              {['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'].map((s) => (
                <option key={s} value={s} className="bg-white">{s}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              ▼
            </div>
          </div>
          {addressErrors.state && <p id="address-state-error" data-testid="address-state-error" className="text-red-500 text-[10px] font-bold mt-1">{addressErrors.state}</p>}
        </div>

        {/* Pincode */}
        <div>
          <label htmlFor="address-pincode" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
            <Hash size={11} className="inline mr-1" />Pincode *
          </label>
          <input
            id="address-pincode"
            type="text"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            data-testid="address-pincode-input"
            aria-describedby={addressErrors.pincode ? 'address-pincode-error' : undefined}
            placeholder="6-digit pincode"
            className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${addressErrors.pincode ? 'border-red-500' : ''}`}
          />
          {addressErrors.pincode && <p id="address-pincode-error" data-testid="address-pincode-error" className="text-red-500 text-[10px] font-bold mt-1">{addressErrors.pincode}</p>}
        </div>
      </div>
    </div>
  )

  // ─── Order Summary Step ────────────────────────────────────────────────────
  const renderOrderSummaryStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2.5">
        <div className="w-8 h-8 rounded-full bg-[#2874F0]/10 text-[#2874F0] flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={15} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Order Summary</h2>
          <p className="text-xs text-slate-400 font-semibold">Review your items before placing the order</p>
        </div>
      </div>

      {/* Deliver To */}
      <div className="bg-white border border-slate-200 rounded-sm p-3.5 flex items-start gap-3 shadow-2xs">
        <MapPin size={14} className="text-[#2874F0] mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Deliver To</p>
          <p className="text-xs font-bold text-slate-800">{address.full_name} <span className="text-slate-400 font-medium text-[11px]">· {address.phone}</span></p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}, {address.city}, {address.state} – {address.pincode}
          </p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="text-[10px] font-bold uppercase tracking-wider text-[#2874F0] border border-slate-200 hover:bg-slate-50 rounded-sm px-2.5 py-1.5 transition-colors bg-white shadow-2xs"
        >
          Change
        </button>
      </div>

      {/* Cart items */}
      <div data-testid="checkout-items-list" className="space-y-2.5">
        {cartItems.map((item) => (
          <div key={item.id} data-testid={`checkout-item-${item.product_id}`} className="bg-white border border-slate-200 rounded-sm p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-12 h-12 rounded-sm overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center p-1">
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
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1 leading-relaxed">{item.product.name}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.product.category}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Qty: <span className="text-slate-800 font-bold">{item.quantity}</span></p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold text-slate-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">₹{Number(item.product.price).toLocaleString('en-IN')} each</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-2 shadow-2xs">
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>MRP ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
          <span className="text-slate-800 font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Estimated Tax (8%)</span>
          <span className="text-slate-800 font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Delivery Charges</span>
          <span className="text-emerald-600 font-bold uppercase">FREE</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-100 pt-2.5 mt-2.5">
          <span>Total Amount</span>
          <span className="text-[#FB641B] font-extrabold text-base">
            ₹{(cartTotal + taxAmount).toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">✓ Free delivery on this order!</p>
      </div>
    </div>
  )

  // ─── Payment Step ──────────────────────────────────────────────────────────
  const paymentOptions = [
    { id: 'card' as PaymentMethod, label: 'Credit / Debit Card', icon: CreditCard, badge: 'Up to 5% cashback', available: true },
    { id: 'cod' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote, badge: '+₹6 handling fee', available: true },
    { id: 'upi' as PaymentMethod, label: 'UPI (GPay / PhonePe / Paytm)', icon: Smartphone, badge: '2% cashback', available: true },
    { id: 'wallet' as PaymentMethod, label: 'Gift Card / Wallet', icon: Gift, badge: null, available: false },
  ]

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2874F0]/10 text-[#2874F0] flex items-center justify-center flex-shrink-0">
            <CreditCard size={15} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Complete Payment</h2>
            <p className="text-xs text-slate-400 font-semibold">Choose your preferred payment method</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-sm px-2.5 py-1.5 font-bold uppercase tracking-wider shadow-2xs">
          <Lock size={10} />100% Secure
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
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
                className={`w-full text-left p-3.5 rounded-sm border transition-all duration-150 ${
                  !opt.available
                    ? 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
                    : isSelected
                    ? 'border-[#2874F0] bg-blue-50/20 font-semibold text-slate-800 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-slate-350 bg-white flex items-center justify-center flex-shrink-0">
                      {isSelected && <div className="w-2 h-2 rounded-full bg-[#2874F0]" />}
                    </div>
                    <Icon size={15} className={isSelected ? 'text-[#2874F0]' : 'text-slate-400'} />
                    <span className="text-xs uppercase font-bold tracking-wider">{opt.label}</span>
                  </div>
                  {!opt.available && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 border border-slate-200 rounded-sm px-1.5 py-0.5">Soon</span>
                  )}
                </div>
                {opt.badge && opt.available && (
                  <p className="text-[10px] mt-1 ml-7 font-bold uppercase tracking-wider text-[#FB641B]">{opt.badge}</p>
                )}
              </button>
            )
          })}
        </div>

        {/* Right: Payment details panel */}
        <div className="lg:flex-1">
          {paymentMethod === 'card' && (
            <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-4 shadow-2xs">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Enter Card Details</p>

              {/* Card preview */}
              <div className="relative h-36 rounded-sm bg-gradient-to-br from-[#2874F0] to-[#1e5ecb] p-5 overflow-hidden shadow-md border border-slate-350">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent)]" />
                <div className="absolute top-3 right-4 text-white/20 text-4xl font-black select-none tracking-widest">VISA</div>
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-white font-mono text-sm tracking-[0.2em]">{cardDetails.number ? cardDetails.number.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}</p>
                  <div className="flex justify-between mt-2.5">
                    <p className="text-white font-bold uppercase text-[9px] tracking-wider">{cardDetails.name || 'Card Holder'}</p>
                    <p className="text-white font-mono text-[9px]">{cardDetails.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="card-number" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Card Number</label>
                  <input
                    id="card-number"
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    data-testid="card-number-input"
                    aria-describedby={paymentErrors.number ? 'card-number-error' : undefined}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] font-mono transition-all ${paymentErrors.number ? 'border-red-500' : ''}`}
                  />
                  {paymentErrors.number && <p id="card-number-error" data-testid="card-number-error" className="text-red-500 text-[10px] font-bold mt-1">{paymentErrors.number}</p>}
                </div>
                <div>
                  <label htmlFor="card-name" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Name on Card</label>
                  <input
                    id="card-name"
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    data-testid="card-name-input"
                    aria-describedby={paymentErrors.name ? 'card-name-error' : undefined}
                    placeholder="John Doe"
                    className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${paymentErrors.name ? 'border-red-500' : ''}`}
                  />
                  {paymentErrors.name && <p id="card-name-error" data-testid="card-name-error" className="text-red-500 text-[10px] font-bold mt-1">{paymentErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="card-expiry" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Expiry Date</label>
                    <input
                      id="card-expiry"
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
                        setCardDetails({ ...cardDetails, expiry: v })
                      }}
                      data-testid="card-expiry-input"
                      aria-describedby={paymentErrors.expiry ? 'card-expiry-error' : undefined}
                      placeholder="MM/YY"
                      className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] font-mono transition-all ${paymentErrors.expiry ? 'border-red-500' : ''}`}
                    />
                    {paymentErrors.expiry && <p id="card-expiry-error" data-testid="card-expiry-error" className="text-red-500 text-[10px] font-bold mt-1">{paymentErrors.expiry}</p>}
                  </div>
                  <div>
                    <label htmlFor="card-cvv" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">CVV</label>
                    <input
                      id="card-cvv"
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      data-testid="card-cvv-input"
                      aria-describedby={paymentErrors.cvv ? 'card-cvv-error' : undefined}
                      placeholder="•••"
                      className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] font-mono transition-all ${paymentErrors.cvv ? 'border-red-500' : ''}`}
                    />
                    {paymentErrors.cvv && <p id="card-cvv-error" data-testid="card-cvv-error" className="text-red-500 text-[10px] font-bold mt-1">{paymentErrors.cvv}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2874F0]">
                <Banknote size={18} />
                <span className="font-bold text-xs uppercase tracking-wide">Cash on Delivery</span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Pay in cash when your order arrives. Due to handling costs, a nominal fee of <span className="text-[#FB641B] font-bold">₹6.00</span> will be added. Complete your payment online to avoid this fee.
              </p>
              <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-2xs">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">COD Handling Fee</span>
                  <span className="text-[#FB641B]">+₹6.00</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                <Truck size={12} className="text-[#2874F0]" />
                <span>Delivery: 3–5 business days</span>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div className="bg-white border border-slate-200 rounded-sm p-4 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[#2874F0]">
                <Smartphone size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">Pay via UPI</span>
              </div>
              <div>
                <label htmlFor="upi-id" className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Enter UPI ID</label>
                <input
                  id="upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  data-testid="upi-id-input"
                  aria-describedby={paymentErrors.upi ? 'upi-error' : undefined}
                  placeholder="yourname@upi"
                  className={`w-full px-3.5 py-2.5 rounded-sm bg-white border border-slate-300 text-sm text-slate-800 font-medium placeholder-slate-400 outline-none focus:border-[#2874F0] focus:ring-1 focus:ring-[#2874F0] transition-all ${paymentErrors.upi ? 'border-red-500' : ''}`}
                />
                {paymentErrors.upi && <p id="upi-error" data-testid="upi-error" className="text-red-500 text-[10px] font-bold mt-1">{paymentErrors.upi}</p>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <div key={app} className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 rounded-sm px-3 py-1.5 shadow-2xs">
                    {app}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✓ Get 2% cashback on UPI payments</p>
            </div>
          )}

          {/* Price summary */}
          <div className="mt-4 bg-white border border-slate-200 rounded-sm p-4 space-y-2 shadow-2xs">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-2 border-b border-slate-100 pb-1">Price Breakdown</p>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800 font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Tax (8%)</span>
              <span className="text-slate-800 font-semibold">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Delivery</span>
              <span className="text-emerald-600 font-bold uppercase">FREE</span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-xs text-[#FB641B] font-bold uppercase">
                <span>COD Handling Fee</span>
                <span>+₹{codFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-800 border-t border-slate-100 pt-2.5 mt-1">
              <span>Total</span>
              <span className="text-[#FB641B] font-extrabold text-base">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secure trust badges */}
      <div className="flex flex-wrap items-center gap-4 pt-2.5 border-t border-slate-200/80 mt-4">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <Shield size={12} className="text-[#2874F0]" />
          <span>256-bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <Lock size={12} className="text-[#2874F0]" />
          <span>PCI DSS Compliant</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <CheckCircle2 size={12} className="text-[#2874F0]" />
          <span>100% Safe Payments</span>
        </div>
      </div>
    </div>
  )

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div data-testid="checkout-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 select-none bg-[#F1F3F6] min-h-screen">
      {/* Page heading */}
      <div className="flex items-center gap-2.5 mb-6 bg-white p-4 rounded-sm border border-slate-200 shadow-xs">
        <button
          onClick={() => step === 1 ? navigate('/cart') : setStep((step - 1) as Step)}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-white border border-slate-250 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-800 uppercase">Checkout</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{cartItems.length} item{cartItems.length > 1 ? 's' : ''} · ₹{grandTotal.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Error */}
      {errorMsg && (
        <div data-testid="checkout-error-msg" className="mb-6 p-4 rounded-sm border border-red-200 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wide shadow-2xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-sm p-5 sm:p-6 shadow-xs">
        {step === 1 && renderAddressStep()}
        {step === 2 && renderOrderSummaryStep()}
        {step === 3 && renderPaymentStep()}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-250/60">
          <button
            data-testid="checkout-back-btn"
            onClick={() => step === 1 ? navigate('/cart') : setStep((step - 1) as Step)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-sm uppercase tracking-wide transition-colors"
          >
            <ArrowLeft size={13} />
            {step === 1 ? 'Back to Cart' : 'Previous'}
          </button>

          {step < 3 ? (
            <button
              data-testid="checkout-next-btn"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2874F0] hover:bg-[#1e5ecb] text-white text-xs font-bold rounded-sm uppercase tracking-wide transition-colors shadow-xs"
            >
              {step === 1 ? 'Confirm Address' : 'Proceed to Payment'}
              <ChevronRight size={13} />
            </button>
          ) : (
            <button
              id="place-order-btn"
              data-testid="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#FB641B] hover:bg-[#e05310] text-white text-xs font-bold rounded-sm uppercase tracking-wide transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : `Place Order · ₹${grandTotal.toLocaleString('en-IN')}`}
              {!submitting && <Lock size={12} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
