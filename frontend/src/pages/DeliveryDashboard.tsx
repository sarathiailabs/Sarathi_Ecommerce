import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Package, CheckCircle2, Clock, AlertCircle,
  TrendingUp, MapPin, Calendar, ClipboardList, RefreshCw, User
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface DeliveryItem {
  id: string
  order_id: string
  partner_id: string | null
  status: string
  tracking_number: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  created_at: string
  updated_at: string
}

export const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth()
  const [unassigned, setUnassigned] = useState<DeliveryItem[]>([])
  const [myDeliveries, setMyDeliveries] = useState<DeliveryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'available' | 'my_active' | 'my_history'>('my_active')
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null)

  const showToast = useCallback((text: string, isError = false) => {
    setToastMsg({ text, isError })
    setTimeout(() => setToastMsg(null), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [unassignedRes, myRes] = await Promise.all([
        api.get('/deliveries/unassigned'),
        api.get('/deliveries/my')
      ])
      setUnassigned(unassignedRes.data)
      setMyDeliveries(myRes.data)
    } catch (err: any) {
      console.error('Failed to fetch logistics data:', err)
      showToast('Error loading logistics information', true)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleClaim = useCallback(async (deliveryId: string) => {
    setClaimingId(deliveryId)
    try {
      await api.post(`/deliveries/${deliveryId}/claim`)
      showToast('Shipment claimed successfully! 🚚')
      fetchData()
      setActiveTab('my_active')
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to claim shipment', true)
    } finally {
      setClaimingId(null)
    }
  }, [fetchData, showToast])

  const handleStatusUpdate = useCallback(async (deliveryId: string, nextStatus: string) => {
    setUpdatingId(deliveryId)
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status: nextStatus })
      showToast(`Status updated to ${nextStatus.replace('_', ' ')}! ✨`)
      fetchData()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update status', true)
    } finally {
      setUpdatingId(null)
    }
  }, [fetchData, showToast])

  // Filter claimed deliveries into active and history
  const activeShipments = myDeliveries.filter(d => d.status !== 'delivered' && d.status !== 'failed')
  const completedShipments = myDeliveries.filter(d => d.status === 'delivered')

  // Calculate stats
  const estimatedEarnings = completedShipments.length * 150 // ₹150 base payout per delivery
  const totalKmTravelled = myDeliveries.length * 4.8

  const mockAddress = (orderId: string) => {
    const num = orderId.charCodeAt(0) + orderId.charCodeAt(orderId.length - 1)
    const sectors = ['Sector 62, Noida', 'Indiranagar, Bangalore', 'Andheri West, Mumbai', 'Salt Lake, Kolkata', 'DLF Phase 3, Gurgaon']
    const hubs = ['Sarathi Central Hub', 'North Logistics Center', 'South Dispatch Wing', 'East Express Gateway', 'West Transit Port']
    return {
      destination: sectors[num % sectors.length],
      pickup: hubs[(num + 2) % hubs.length],
      recipient: `Customer #${orderId.slice(-4).toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#14B8A6] text-white tracking-wider mb-2.5 uppercase">
              <Truck size={12} className="animate-bounce" />
              Carrier Operations Gate
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 uppercase tracking-tight leading-none">
              Carrier Dashboard
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-2">
              Authorized Delivery Partner: <span className="text-[#0F6FFF] font-bold">{user?.full_name || user?.email}</span>
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            data-testid="delivery-refresh-btn"
            className="self-start md:self-center flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-350 text-slate-700 rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Logistics Deck
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div data-testid="delivery-stat-active" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Runs</span>
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Truck size={14} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-855">{activeShipments.length}</div>
            <p className="text-[10px] text-slate-450 font-semibold mt-1">Assignments in route</p>
          </div>

          <div data-testid="delivery-stat-available" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Loads</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#0F6FFF]">
                <ClipboardList size={14} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-855">{unassigned.length}</div>
            <p className="text-[10px] text-slate-455 font-semibold mt-1">Pending dispatch orders</p>
          </div>

          <div data-testid="delivery-stat-earnings" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Earnings</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-855">₹{estimatedEarnings}</div>
            <p className="text-[10px] text-slate-455 font-semibold mt-1">Based on ₹150 / delivery</p>
          </div>

          <div data-testid="delivery-stat-distance" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logistics Hubs</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <MapPin size={14} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-855">{totalKmTravelled.toFixed(1)} km</div>
            <p className="text-[10px] text-slate-455 font-semibold mt-1">Distance covered</p>
          </div>

        </div>

        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2" role="tablist">
          
          <button
            onClick={() => setActiveTab('my_active')}
            role="tab"
            aria-selected={activeTab === 'my_active'}
            data-testid="delivery-tab-active"
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'my_active'
                ? 'border-[#0F6FFF] text-[#0F6FFF] font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            My Active Shipments ({activeShipments.length})
          </button>

          <button
            onClick={() => setActiveTab('available')}
            role="tab"
            aria-selected={activeTab === 'available'}
            data-testid="delivery-tab-available"
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'available'
                ? 'border-[#0F6FFF] text-[#0F6FFF] font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Available Jobs Pool ({unassigned.length})
          </button>

          <button
            onClick={() => setActiveTab('my_history')}
            role="tab"
            aria-selected={activeTab === 'my_history'}
            data-testid="delivery-tab-completed"
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'my_history'
                ? 'border-[#0F6FFF] text-[#0F6FFF] font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Completed Shipments ({completedShipments.length})
          </button>
        </div>

        {loading ? (
          <div data-testid="delivery-loading-skeleton" className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-sm p-6 h-32" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {activeTab === 'my_active' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {activeShipments.length === 0 ? (
                  <div data-testid="delivery-empty-active" className="text-center py-16 bg-white border border-slate-200 rounded-sm shadow-xs">
                    <Truck size={42} className="text-slate-250 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase text-slate-755 mb-1">No Active Dispatches</h3>
                    <p className="text-slate-400 text-xs mb-6 font-semibold">Head over to the Available Jobs Pool to claim some delivery tasks!</p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="px-5 py-2.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold uppercase rounded-sm shadow-xs transition-colors"
                    >
                      Browse Available Jobs
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {activeShipments.map((delivery) => {
                      const { destination, pickup, recipient } = mockAddress(delivery.order_id)
                      const isPickedUp = delivery.status !== 'assigned' && delivery.status !== 'pending'
                      const isInTransit = delivery.status === 'in_transit'

                      return (
                        <div key={delivery.id} data-testid={`delivery-active-card-${delivery.id}`} className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs hover:shadow-sm transition-all">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                                  Delivery ID: #{delivery.id.slice(-6).toUpperCase()}
                                </span>
                                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
                                  delivery.status === 'picked_up' ? 'bg-orange-50 text-orange-700' :
                                  delivery.status === 'in_transit' ? 'bg-blue-50 text-blue-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {delivery.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                Assigned Order ID: {delivery.order_id}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {!isPickedUp && (
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'picked_up')}
                                  disabled={updatingId === delivery.id}
                                  data-testid={`delivery-btn-pickup-${delivery.id}`}
                                  className="px-4 py-2 bg-[#14B8A6] hover:bg-[#ff9100] text-white text-[10px] font-bold uppercase rounded-sm shadow-xs transition-colors"
                                >
                                  Mark as Picked Up
                                </button>
                              )}
                              
                              {isPickedUp && !isInTransit && (
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'in_transit')}
                                  disabled={updatingId === delivery.id}
                                  data-testid={`delivery-btn-transit-${delivery.id}`}
                                  className="px-4 py-2 bg-[#14B8A6] hover:bg-[#ff9100] text-white text-[10px] font-bold uppercase rounded-sm shadow-xs transition-colors"
                                >
                                  Mark as In Transit
                                </button>
                              )}

                              {isInTransit && (
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                                  disabled={updatingId === delivery.id}
                                  data-testid={`delivery-btn-deliver-${delivery.id}`}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-sm shadow-xs transition-colors"
                                >
                                  Confirm Delivered ✓
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-rose-500 mt-0.5 border border-slate-100 flex-shrink-0">
                                <MapPin size={13} />
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Pickup Facility</span>
                                <span data-testid={`delivery-pickup-text-${delivery.id}`} className="text-xs font-bold text-slate-750 uppercase">{pickup}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#0F6FFF] mt-0.5 border border-slate-100 flex-shrink-0">
                                <User size={13} />
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Recipient</span>
                                <span data-testid={`delivery-recipient-text-${delivery.id}`} className="text-xs font-bold text-slate-750 uppercase">{recipient}</span>
                                <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">{destination}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-emerald-600 mt-0.5 border border-slate-100 flex-shrink-0">
                                <Calendar size={13} />
                              </div>
                              <div>
                                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Est. Completion</span>
                                <span data-testid={`delivery-est-completion-${delivery.id}`} className="text-xs font-bold text-slate-750">
                                  {delivery.estimated_delivery ? new Date(delivery.estimated_delivery).toLocaleString() : 'As soon as possible'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'available' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {unassigned.length === 0 ? (
                  <div data-testid="delivery-empty-available" className="text-center py-16 bg-white border border-slate-200 rounded-sm shadow-xs">
                    <CheckCircle2 size={42} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-sm font-bold uppercase text-slate-755 mb-1">Logistics Clean Sheet</h3>
                    <p className="text-slate-400 text-xs font-semibold">All dispatch orders are currently claimed. Excellent work!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {unassigned.map((delivery) => {
                      const { destination, pickup, recipient } = mockAddress(delivery.order_id)
                      
                      return (
                        <div key={delivery.id} data-testid={`delivery-available-card-${delivery.id}`} className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs hover:shadow-sm transition-all">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 pb-3 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">
                                  Logistics Assignment #{delivery.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-100">
                                  Awaiting Partner
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                Est. Dispatch Hub: {pickup}
                              </p>
                            </div>

                            <button
                              onClick={() => handleClaim(delivery.id)}
                              disabled={claimingId === delivery.id}
                              data-testid={`delivery-btn-claim-${delivery.id}`}
                              className="px-4 py-2 bg-[#14B8A6] hover:bg-[#ff9100] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-xs flex items-center gap-1.5 self-start lg:self-center transition-colors"
                            >
                              <Truck size={14} />
                              {claimingId === delivery.id ? 'Claiming Load...' : 'Claim Job (₹150)'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
                              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Pickup From</span>
                              <p data-testid={`delivery-available-pickup-${delivery.id}`} className="text-xs font-bold text-slate-700 uppercase">{pickup}</p>
                              <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Warehoused order: {delivery.order_id}</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
                              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block mb-1">Delivery Destination</span>
                              <p className="text-xs font-bold text-slate-700 uppercase">{recipient}</p>
                              <p data-testid={`delivery-available-dest-${delivery.id}`} className="text-xs font-bold text-[#0F6FFF] mt-0.5">{destination}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'my_history' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {completedShipments.length === 0 ? (
                  <div data-testid="delivery-empty-completed" className="text-center py-16 bg-white border border-slate-200 rounded-sm shadow-xs">
                    <Clock size={42} className="text-slate-250 mx-auto mb-4" />
                    <h3 className="text-sm font-bold uppercase text-slate-755 mb-1">No Completed Shipments</h3>
                    <p className="text-slate-400 text-xs font-semibold">Claim your active shipments and complete delivery runs to build your history!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {completedShipments.map((delivery) => {
                      const { destination, pickup, recipient } = mockAddress(delivery.order_id)
                      
                      return (
                        <div key={delivery.id} data-testid={`delivery-completed-card-${delivery.id}`} className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs opacity-90 hover:opacity-100 transition-opacity">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                            <div>
                              <span className="font-bold text-slate-600 text-xs uppercase tracking-wide">
                                Delivery #{delivery.id.slice(-6).toUpperCase()}
                              </span>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Order ID: {delivery.order_id}</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm text-[9px] font-bold uppercase border border-emerald-150">
                              ✓ Completed
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Transit Details</p>
                              <p data-testid={`delivery-completed-details-${delivery.id}`} className="font-bold text-slate-700 mt-1 uppercase text-xs">{pickup} → {destination}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider font-semibold">Completion Timestamp</p>
                              <p data-testid={`delivery-completed-time-${delivery.id}`} className="font-bold text-slate-600 mt-1 text-xs">
                                {delivery.actual_delivery ? new Date(delivery.actual_delivery).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-sm border shadow-lg bg-white max-w-xs ${
              toastMsg.isError
                ? 'border-red-200 text-red-800'
                : 'border-emerald-250 text-emerald-800'
            }`}
          >
            {toastMsg.isError ? '⚠️' : '✅'}
            <span className="text-xs font-bold">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
