import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Calendar, CreditCard, ChevronRight } from 'lucide-react'
import api from '../services/api'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product: {
    name: string
    image_url: string
  }
}

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  items: OrderItem[]
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders')
        const formatted = response.data.map((order: any) => ({
          ...order,
          total_amount: Number(order.total_amount),
          items: order.items.map((item: any) => ({
            ...item,
            price: Number(item.price),
          }))
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
      case 'shipped':
        return 'text-sky-400 border-sky-500/20 bg-sky-500/10'
      default:
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-800/40 w-48 rounded"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-800/40 rounded-2xl"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/5 space-y-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-white/5 text-slate-500">
            <ShoppingBag size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 font-medium">You haven't placed any orders yet.</p>
            <p className="text-xs text-slate-500">All orders you submit will be tracked and displayed here.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline uppercase tracking-wider"
          >
            Start Shopping
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              {/* Order Header */}
              <div className="bg-slate-900/60 px-6 py-4 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-6 text-xs text-slate-400">
                  <div className="space-y-1">
                    <span>Order Date</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span>Total Amount</span>
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <CreditCard size={14} className="text-slate-400" />
                      ₹{order.total_amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span>Reference ID</span>
                    <div className="font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                      {order.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-white/5">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-250 line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-slate-400">
                          Quantity: <span className="font-semibold text-slate-300">{item.quantity}</span> @ ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
