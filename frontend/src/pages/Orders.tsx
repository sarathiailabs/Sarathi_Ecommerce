import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Calendar, ChevronRight,
  Package, Truck, CheckCircle, Clock, XCircle,
  ChevronDown, ArrowRight, Search, Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product: { name: string; image_url: string }
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  items: OrderItem[]
}

type StatusKey = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_CONFIG: Record<StatusKey, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock size={14} />,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200 border',
  },
  processing: {
    label: 'Processing',
    icon: <Package size={14} />,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200 border',
  },
  shipped: {
    label: 'Shipped',
    icon: <Truck size={14} />,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200 border',
  },
  delivered: {
    label: 'Delivered',
    icon: <CheckCircle size={14} />,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 border',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle size={14} />,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200 border',
  },
}

const TIMELINE_STEPS: StatusKey[] = ['pending', 'processing', 'shipped', 'delivered']

function getStatusConfig(status: string) {
  const key = status.toLowerCase() as StatusKey
  return STATUS_CONFIG[key] || STATUS_CONFIG.pending
}

function getTimelineProgress(status: string): number {
  const idx = TIMELINE_STEPS.indexOf(status.toLowerCase() as StatusKey)
  return idx === -1 ? 0 : idx
}

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false)
  const config = getStatusConfig(order.status)
  const progress = getTimelineProgress(order.status)
  const date = new Date(order.created_at)

  return (
    <motion.div
      layout
      data-testid={`order-card-${order.id}`}
      className="bg-white border border-slate-200/50 rounded-2xl shadow-xs overflow-hidden hover:shadow-sm transition-all duration-200"
    >
      {/* Header */}
      <div
        data-testid={`order-header-${order.id}`}
        className="px-6 py-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span
                  data-testid={`order-status-badge-${order.id}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.bg} ${config.color} ${config.border}`}
                >
                  {config.icon}
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-[#14B8A6]" />
                  {date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span>·</span>
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Order Total</div>
              <div className="text-base font-bold text-slate-800">
                ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className={`text-slate-650 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Timeline progress */}
        {order.status.toLowerCase() !== 'cancelled' && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              {TIMELINE_STEPS.map((step, i) => {
                const stepConfig = STATUS_CONFIG[step]
                const isActive = i <= progress
                const isCurrent = i === progress
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 border ${
                        isActive
                          ? `${stepConfig.bg} ${stepConfig.color} ${isCurrent ? 'scale-110 shadow-sm border-[#0F6FFF]' : 'border-slate-350'}`
                          : 'bg-white text-slate-300 border-slate-200'
                      }`}>
                        {stepConfig.icon}
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-widest hidden sm:block ${isActive ? 'text-slate-700' : 'text-slate-300'}`}>
                        {stepConfig.label}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-slate-100 border border-slate-200/55">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-[#0F6FFF]"
                          style={{ width: i < progress ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expandable items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200 divide-y divide-slate-100 bg-white">
              {order.items.map((item) => (
                <div key={item.id} data-testid={`order-item-row-${item.id}`} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center shadow-xs">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="object-contain max-h-full max-w-full p-1"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=500&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <h4 data-testid={`order-item-name-${item.id}`} className="text-sm font-bold text-slate-800 uppercase tracking-tight line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-555 font-bold uppercase tracking-wider mt-0.5">
                        Qty: <span className="text-slate-700 font-bold">{item.quantity}</span>
                        {' '}× ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div data-testid={`order-item-subtotal-${item.id}`} className="text-sm font-bold text-slate-850 flex-shrink-0">
                    ₹{(item.quantity * Number(item.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="px-6 py-3.5 flex items-center justify-between gap-4 bg-slate-50 border-t border-slate-200">
                <span className="text-[9px] text-slate-400 font-mono tracking-wider font-bold truncate max-w-[160px]">
                  {order.id}
                </span>
                <div className="flex gap-4 flex-shrink-0">
                  {order.status.toLowerCase() === 'delivered' && (
                    <button className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] hover:text-[#e68f00] hover:underline flex items-center gap-1 transition-colors">
                      <Star size={12} className="fill-[#14B8A6] text-[#14B8A6]" />
                      Review
                    </button>
                  )}
                  <Link
                    to="/"
                    className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] hover:text-[#e05310] hover:underline flex items-center gap-1 transition-colors"
                  >
                    Reorder
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders')
        const formatted = response.data.map((order: any) => ({
          ...order,
          total_amount: Number(order.total_amount),
          items: order.items.map((item: any) => ({ ...item, price: Number(item.price) }))
        }))
        setOrders(formatted)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filtered = orders
    .filter(o => filterStatus === 'all' || o.status.toLowerCase() === filterStatus)
    .filter(o =>
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const s = o.status.toLowerCase()
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4 animate-pulse">
        <div className="skeleton h-8 w-48 rounded-xl" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div data-testid="orders-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">My Orders</h1>
        <p data-testid="orders-total-count" className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1.5">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed in total
        </p>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white border border-slate-200/50 rounded-2xl shadow-xs space-y-6 max-w-lg mx-auto mt-10 px-6"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center mx-auto text-[#0F6FFF] shadow-xs">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-800">No orders yet</h3>
            <p className="text-slate-500 text-xs font-semibold max-w-xs mx-auto leading-relaxed">
              You haven't placed any orders. Start exploring our catalog!
            </p>
          </div>
          <Link to="/" className="btn-primary inline-flex text-xs px-6 py-2.5 font-bold uppercase tracking-wider gap-1.5 rounded-xl shadow-xs">
            Browse Catalog
            <ChevronRight size={14} />
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 bg-white border border-slate-200/50 rounded-xl shadow-xs overflow-hidden focus-within:border-[#0F6FFF] transition-all">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                id="orders-search-input"
                data-testid="orders-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or product..."
                className="pl-10 pr-4 py-2.5 bg-transparent w-full text-xs text-slate-700 font-semibold placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div data-testid="orders-filter-tabs" className="flex gap-2 scrollable-tabs flex-shrink-0">
              {['all', ...Object.keys(statusCounts)].map((status) => {
                const isSelected = filterStatus === status
                return (
                  <button
                    key={status}
                    data-testid={`orders-filter-${status}`}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#0F6FFF] text-white border-[#0F6FFF] shadow-xs'
                        : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all'
                      ? `All (${orders.length})`
                      : `${status.charAt(0).toUpperCase() + status.slice(1)} (${statusCounts[status]})`}
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div layout data-testid="orders-list" className="space-y-4">
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div data-testid="orders-empty-filter" className="text-center py-12 text-slate-450 text-xs font-bold uppercase tracking-wider">
                  No orders match your filter.
                </div>
              ) : (
                filtered.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  )
}
