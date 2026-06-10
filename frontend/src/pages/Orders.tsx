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
    color: 'text-[#1D1C1A]',
    bg: 'bg-[#F5B025]/20',
    border: 'border-[#1D1C1A] border-2',
  },
  processing: {
    label: 'Processing',
    icon: <Package size={14} />,
    color: 'text-[#1D1C1A]',
    bg: 'bg-blue-500/20',
    border: 'border-[#1D1C1A] border-2',
  },
  shipped: {
    label: 'Shipped',
    icon: <Truck size={14} />,
    color: 'text-[#1D1C1A]',
    bg: 'bg-violet-500/20',
    border: 'border-[#1D1C1A] border-2',
  },
  delivered: {
    label: 'Delivered',
    icon: <CheckCircle size={14} />,
    color: 'text-[#1D1C1A]',
    bg: 'bg-emerald-500/20',
    border: 'border-[#1D1C1A] border-2',
  },
  cancelled: {
    label: 'Cancelled',
    icon: <XCircle size={14} />,
    color: 'text-[#1D1C1A]',
    bg: 'bg-[#E1392A]/20',
    border: 'border-[#1D1C1A] border-2',
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
      className="bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[4px_4px_0px_0px_#1D1C1A] overflow-hidden hover:shadow-[6px_6px_0px_0px_#1D1C1A] transition-all"
    >
      {/* Header */}
      <div
        data-testid={`order-header-${order.id}`}
        className="px-6 py-5 cursor-pointer hover:bg-[#FAF6EE]/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} flex items-center justify-center text-[#1D1C1A]`}>
              {config.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-[#1D1C1A] text-sm uppercase tracking-wider">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span
                  data-testid={`order-status-badge-${order.id}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md text-[10px] font-black uppercase ${config.bg} ${config.color} ${config.border}`}
                >
                  {config.icon}
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-black uppercase tracking-wider text-[#615E59]">
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-[#E1392A]" />
                  {date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span>·</span>
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-[#615E59] font-black uppercase tracking-wider mb-0.5">Order Total</div>
              <div className="text-base font-black text-[#1D1C1A]">
                ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className={`text-[#1D1C1A] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Timeline progress */}
        {order.status.toLowerCase() !== 'cancelled' && (
          <div className="mt-5 border-t border-[#1D1C1A]/10 pt-4">
            <div className="flex items-center justify-between mb-2">
              {TIMELINE_STEPS.map((step, i) => {
                const stepConfig = STATUS_CONFIG[step]
                const isActive = i <= progress
                const isCurrent = i === progress
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 border-2 border-[#1D1C1A] ${
                        isActive
                          ? `${stepConfig.bg} ${stepConfig.color} ${isCurrent ? 'scale-110 shadow-md shadow-[#F5B025]/20 font-black' : ''}`
                          : 'bg-white text-[#1D1C1A]/20'
                      }`}>
                        {stepConfig.icon}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest hidden sm:block ${isActive ? 'text-[#1D1C1A]' : 'text-[#1D1C1A]/20'}`}>
                        {stepConfig.label}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className="flex-1 h-1.5 mx-2 rounded-full overflow-hidden bg-[#FAF6EE] border border-[#1D1C1A]/20">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-[#E1392A]"
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
            <div className="border-t-3 border-[#1D1C1A] divide-y-2 divide-[#1D1C1A]/10 bg-white">
              {order.items.map((item) => (
                <div key={item.id} data-testid={`order-item-row-${item.id}`} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6EE] border-2 border-[#1D1C1A] flex-shrink-0 flex items-center justify-center shadow-xs">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 data-testid={`order-item-name-${item.id}`} className="text-sm font-black text-[#1D1C1A] uppercase tracking-tight line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-[#615E59] font-black uppercase tracking-wider mt-0.5">
                        Qty: <span className="text-[#1D1C1A] font-black">{item.quantity}</span>
                        {' '}× ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div data-testid={`order-item-subtotal-${item.id}`} className="text-sm font-black text-[#1D1C1A] flex-shrink-0">
                    ₹{(item.quantity * Number(item.price)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="px-6 py-3.5 flex items-center justify-between gap-4 bg-[#FAF6EE] border-t-2 border-[#1D1C1A]">
                <span className="text-[9px] text-[#615E59] font-mono tracking-wider font-bold truncate max-w-[160px]">
                  {order.id}
                </span>
                <div className="flex gap-4 flex-shrink-0">
                  {order.status.toLowerCase() === 'delivered' && (
                    <button className="text-xs font-black uppercase tracking-wider text-[#F5B025] hover:text-[#df9f20] hover:underline flex items-center gap-1 transition-colors">
                      <Star size={12} className="text-[#F5B025]" />
                      Review
                    </button>
                  )}
                  <Link
                    to="/"
                    className="text-xs font-black uppercase tracking-wider text-[#E1392A] hover:text-[#C92F22] hover:underline flex items-center gap-1 transition-colors"
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
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#1D1C1A] uppercase tracking-tight">My Orders</h1>
        <p data-testid="orders-total-count" className="text-[#615E59] text-xs font-black uppercase tracking-wider mt-1">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed in total
        </p>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[5px_5px_0px_0px_#1D1C1A] space-y-6 max-w-lg mx-auto mt-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#FAF6EE] border-3 border-[#1D1C1A] flex items-center justify-center mx-auto text-[#1D1C1A] shadow-[4px_4px_0px_0px_#1D1C1A]">
            <ShoppingBag size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#1D1C1A]">No orders yet</h3>
            <p className="text-[#615E59] text-sm max-w-xs mx-auto leading-relaxed">
              You haven't placed any orders. Start exploring our catalog!
            </p>
          </div>
          <Link to="/" className="btn-primary inline-flex text-xs px-6 py-3 font-black uppercase tracking-wider gap-1.5">
            Browse Catalog
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 bg-white border-2 border-[#1D1C1A] rounded-xl shadow-[2px_2px_0px_0px_#1D1C1A] overflow-hidden">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D1C1A]/60 pointer-events-none" />
              <input
                type="text"
                id="orders-search-input"
                data-testid="orders-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or product..."
                className="pl-10 pr-4 py-2.5 bg-transparent w-full text-xs text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none"
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
                    className={`px-3.5 py-2.5 rounded-xl border-2 border-[#1D1C1A] text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#F5B025] text-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A]'
                        : 'bg-white text-[#1D1C1A] hover:bg-[#FAF6EE]'
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
                <div data-testid="orders-empty-filter" className="text-center py-12 text-[#615E59] text-xs font-black uppercase tracking-wider">
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
