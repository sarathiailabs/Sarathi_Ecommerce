import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, CreditCard, Phone, ChevronRight, AlertTriangle
} from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product?: {
    id: string
    name: string
    image_url: string
    category: string
  }
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  shipping_address?: string
  customer_name?: string
  customer_phone?: string
  payment_method?: string
  items: OrderItem[]
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  Pending:    { icon: <Clock size={16} />,        color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   label: 'Pending' },
  Processing: { icon: <Package size={16} />,      color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',     label: 'Processing' },
  Shipped:    { icon: <Truck size={16} />,         color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', label: 'Shipped' },
  Delivered:  { icon: <CheckCircle size={16} />,  color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-200',label: 'Delivered' },
  Cancelled:  { icon: <XCircle size={16} />,      color: 'text-red-600',    bg: 'bg-red-50 border-red-200',       label: 'Cancelled' },
}

const TIMELINE_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered']

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Order not found')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, isAuthenticated, navigate])

  const handleCancel = async () => {
    if (!order || !window.confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      await api.post(`/orders/${id}/cancel`, { reason: 'Customer requested cancellation' })
      setOrder((prev) => prev ? { ...prev, status: 'Cancelled' } : prev)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div data-page="order-detail" data-loading="true" className="max-w-4xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-xl" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-60 bg-slate-100 rounded-3xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div data-page="order-detail" data-testid="order-detail-error" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <Link to="/orders" className="text-amber-600 font-bold text-sm hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    )
  }

  if (!order) return null

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending']
  const stepIndex = TIMELINE_STEPS.indexOf(order.status)
  const canCancel = ['Pending', 'Processing'].includes(order.status)

  return (
    <div data-page="order-detail" data-testid="order-detail-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link to="/orders" data-testid="order-detail-back-link" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 transition-colors font-semibold mb-2">
            <ArrowLeft size={14} /> All Orders
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Order Detail</h1>
          <p data-testid="order-detail-id" className="text-xs text-slate-400 font-mono mt-1">{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            data-testid="order-detail-status-badge"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusConfig.color} ${statusConfig.bg}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
          {canCancel && (
            <button
              data-testid="order-detail-cancel-btn"
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-60"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      {order.status !== 'Cancelled' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="order-timeline"
          className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Order Progress</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-amber-400 z-0 transition-all duration-700"
              style={{ width: `${Math.max(0, (stepIndex / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
            />
            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= stepIndex
              const active = i === stepIndex
              return (
                <div
                  key={step}
                  data-testid={`order-timeline-step-${step.toLowerCase()}`}
                  className="flex flex-col items-center gap-2 z-10"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? 'bg-amber-400 border-amber-400 text-white' : 'bg-white border-slate-200 text-slate-300'
                  } ${active ? 'ring-4 ring-amber-400/20 scale-110' : ''}`}>
                    {STATUS_CONFIG[step]?.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-amber-600' : 'text-slate-300'}`}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Shipping Info */}
        {order.shipping_address && (
          <div data-testid="order-detail-shipping" className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shipping Address</h3>
            </div>
            <p data-testid="order-detail-customer-name" className="text-sm font-bold text-slate-800">{order.customer_name}</p>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{order.shipping_address}</p>
            {order.customer_phone && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <Phone size={12} /> {order.customer_phone}
              </div>
            )}
          </div>
        )}

        {/* Payment Info */}
        <div data-testid="order-detail-payment" className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-amber-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payment</h3>
          </div>
          <p className="text-sm font-bold text-slate-800 capitalize">{order.payment_method || 'Card'}</p>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p data-testid="order-detail-total" className="text-lg font-black text-amber-600 mt-3">
            ₹{Number(order.total_amount).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Items */}
      <div data-testid="order-detail-items-list" className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">
          Items ({order.items.length})
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              data-testid={`order-detail-item-${item.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              {item.product?.image_url && (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                {item.product ? (
                  <Link
                    to={`/product/${item.product_id}`}
                    data-testid={`order-detail-item-name-${item.id}`}
                    className="text-sm font-bold text-slate-800 hover:text-amber-600 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                ) : (
                  <p data-testid={`order-detail-item-name-${item.id}`} className="text-sm font-bold text-slate-800">
                    Product #{item.product_id.slice(0, 8)}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
              </div>
              <p data-testid={`order-detail-item-subtotal-${item.id}`} className="text-sm font-black text-slate-800 flex-shrink-0">
                ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
