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
  const totalKmTravelled = myDeliveries.length * 4.8 // 4.8km average

  // Deterministic address helper for elegant visuals
  const mockAddress = (orderId: string) => {
    const num = orderId.charCodeAt(0) + orderId.charCodeAt(orderId.length - 1)
    const sectors = ['Sector 62, Noida', 'Indiranagar, Bangalore', 'Andheri West, Mumbai', 'Salt Lake, Kolkata', 'DLF Phase 3, Gurgaon']
    const hubs = ['Prathazon Central Hub', 'North Logistics Center', 'South Dispatch Wing', 'East Express Gateway', 'West Transit Port']
    return {
      destination: sectors[num % sectors.length],
      pickup: hubs[(num + 2) % hubs.length],
      recipient: `Customer #${orderId.slice(-4).toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24 pt-8">
      {/* Background Dots */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#1D1C1A 2px, transparent 2px)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b-3 border-[#1D1C1A] pb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#F5B025] text-[#1D1C1A] border-2 border-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A] uppercase tracking-wider mb-3">
              <Truck size={12} className="animate-bounce" />
              Carrier Operations Gate
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#1D1C1A] tracking-tight uppercase leading-none">
              CARRIER DASHBOARD
            </h1>
            <p className="text-sm font-bold text-[#615E59] mt-2">
              Authorized Delivery Partner: <span className="text-[#E1392A]">{user?.full_name || user?.email}</span>
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="self-start md:self-center btn-secondary flex items-center gap-2 px-5 py-3 uppercase text-xs font-black tracking-wider"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh Logistics Deck
          </button>
        </div>

        {/* Tactile Key Metrics Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Active Runs</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 border-2 border-[#1D1C1A] flex items-center justify-center text-orange-600">
                <Truck size={14} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1D1C1A]">{activeShipments.length}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Assignments in route</p>
          </div>

          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Available Loads</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 border-2 border-[#1D1C1A] flex items-center justify-center text-blue-600">
                <ClipboardList size={14} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1D1C1A]">{unassigned.length}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Pending dispatch orders</p>
          </div>

          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Total Earnings</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border-2 border-[#1D1C1A] flex items-center justify-center text-emerald-600">
                <TrendingUp size={14} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#E1392A]">₹{estimatedEarnings}</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Based on ₹150 / delivery</p>
          </div>

          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Logistics Hubs</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 border-2 border-[#1D1C1A] flex items-center justify-center text-purple-600">
                <MapPin size={14} />
              </div>
            </div>
            <div className="text-3xl font-black text-[#1D1C1A]">{totalKmTravelled.toFixed(1)} km</div>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Distance covered</p>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex border-b-3 border-[#1D1C1A] mb-8 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          
          <button
            onClick={() => setActiveTab('my_active')}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider border-t-3 border-x-3 border-[#1D1C1A] rounded-t-xl transition-all ${
              activeTab === 'my_active'
                ? 'bg-white text-[#E1392A] -mb-[3px] border-b-3 border-white translate-y-[1px]'
                : 'bg-slate-100/60 text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-black'
            }`}
          >
            My Active Shipments ({activeShipments.length})
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider border-t-3 border-x-3 border-[#1D1C1A] rounded-t-xl transition-all ${
              activeTab === 'available'
                ? 'bg-white text-[#E1392A] -mb-[3px] border-b-3 border-white translate-y-[1px]'
                : 'bg-slate-100/60 text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-black'
            }`}
          >
            Available Jobs Pool ({unassigned.length})
          </button>

          <button
            onClick={() => setActiveTab('my_history')}
            className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider border-t-3 border-x-3 border-[#1D1C1A] rounded-t-xl transition-all ${
              activeTab === 'my_history'
                ? 'bg-white text-[#E1392A] -mb-[3px] border-b-3 border-white translate-y-[1px]'
                : 'bg-slate-100/60 text-slate-500 border-transparent hover:bg-slate-200/50 hover:text-black'
            }`}
          >
            Completed Shipments ({completedShipments.length})
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 h-40 skeleton" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* 1. MY ACTIVE SHIPMENTS TAB */}
            {activeTab === 'my_active' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {activeShipments.length === 0 ? (
                  <div className="text-center py-16 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[4px_4px_0px_0px_#1D1C1A]">
                    <Truck size={42} className="text-slate-300 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-black uppercase text-[#1D1C1A] mb-1">No Active Dispatches</h3>
                    <p className="text-slate-500 text-sm mb-6 font-medium">Head over to the Available Jobs Pool to claim some delivery tasks!</p>
                    <button
                      onClick={() => setActiveTab('available')}
                      className="btn-primary px-6 py-3 text-xs font-black uppercase shadow-sm"
                    >
                      Browse Available Jobs
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {activeShipments.map((delivery) => {
                      const { destination, pickup, recipient } = mockAddress(delivery.order_id)
                      const isPickedUp = delivery.status !== 'assigned' && delivery.status !== 'pending'
                      const isInTransit = delivery.status === 'in_transit'

                      return (
                        <div key={delivery.id} className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#1D1C1A] hover:shadow-[7px_7px_0px_0px_#1D1C1A] transition-all">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 pb-4 border-b border-slate-200">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
                                  Delivery ID: #{delivery.id.slice(-6).toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 border-2 border-[#1D1C1A] rounded-md text-[9px] font-black uppercase ${
                                  delivery.status === 'picked_up' ? 'bg-orange-100 text-orange-800' :
                                  delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {delivery.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                Assigned Order ID: {delivery.order_id}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {!isPickedUp && (
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'picked_up')}
                                  disabled={updatingId === delivery.id}
                                  className="btn-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-wider shadow-sm"
                                >
                                  Mark as Picked Up
                                </button>
                              )}
                              
                              {isPickedUp && !isInTransit && (
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'in_transit')}
                                  disabled={updatingId === delivery.id}
                                  className="btn-primary px-4 py-2.5 text-[10px] font-black uppercase tracking-wider shadow-sm"
                                >
                                  Mark as In Transit
                                </button>
                              )}

                              {isInTransit && (
                                <button
                                  onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                                  disabled={updatingId === delivery.id}
                                  className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white-force px-4 py-2.5 text-[10px] font-black uppercase tracking-wider shadow-sm"
                                >
                                  Confirm Delivered ✓
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Route tracking details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center text-[#E1392A] mt-0.5">
                                <MapPin size={14} />
                              </div>
                              <div>
                                <span className="text-[9px] font-black uppercase text-[#615E59] tracking-wider block">Pickup Facility</span>
                                <span className="text-xs font-black text-[#1D1C1A] uppercase">{pickup}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center text-[#F5B025] mt-0.5">
                                <User size={14} />
                              </div>
                              <div>
                                <span className="text-[9px] font-black uppercase text-[#615E59] tracking-wider block">Recipient</span>
                                <span className="text-xs font-black text-[#1D1C1A] uppercase">{recipient}</span>
                                <span className="text-[10px] text-[#615E59] font-bold block mt-0.5">{destination}</span>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] border-2 border-[#1D1C1A] flex items-center justify-center text-blue-500 mt-0.5">
                                <Calendar size={14} />
                              </div>
                              <div>
                                <span className="text-[9px] font-black uppercase text-[#615E59] tracking-wider block">Est. Completion</span>
                                <span className="text-xs font-black text-[#1D1C1A]">
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

            {/* 2. AVAILABLE JOBS TAB */}
            {activeTab === 'available' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {unassigned.length === 0 ? (
                  <div className="text-center py-16 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[4px_4px_0px_0px_#1D1C1A]">
                    <CheckCircle2 size={42} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-black uppercase text-[#1D1C1A] mb-1">Logistics Clean Sheet</h3>
                    <p className="text-slate-500 text-sm font-medium">All dispatch orders are currently claimed. Excellent work!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {unassigned.map((delivery) => {
                      const { destination, pickup, recipient } = mockAddress(delivery.order_id)
                      
                      return (
                        <div key={delivery.id} className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#1D1C1A] hover:shadow-[7px_7px_0px_0px_#1D1C1A] hover:-translate-y-0.5 transition-all">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-5 pb-4 border-b border-slate-200">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-slate-800 text-sm uppercase tracking-wide">
                                  Logistics Assignment #{delivery.id.slice(-6).toUpperCase()}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                                  Awaiting Partner
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                Est. Dispatch Hub: {pickup}
                              </p>
                            </div>

                            <button
                              onClick={() => handleClaim(delivery.id)}
                              disabled={claimingId === delivery.id}
                              className="btn-primary px-6 py-3 text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-2 self-start lg:self-center"
                            >
                              <Truck size={14} />
                              {claimingId === delivery.id ? 'Claiming Load...' : 'Claim Shipment task (₹150)'}
                            </button>
                          </div>

                          {/* Address Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl p-4">
                              <span className="text-[9px] font-black uppercase text-[#615E59] tracking-wider block mb-1">Pickup From</span>
                              <p className="text-xs font-black text-[#1D1C1A] uppercase">{pickup}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Warehoused order: {delivery.order_id}</p>
                            </div>

                            <div className="bg-[#FAF6EE] border-2 border-[#1D1C1A] rounded-xl p-4">
                              <span className="text-[9px] font-black uppercase text-[#615E59] tracking-wider block mb-1">Delivery Destination</span>
                              <p className="text-xs font-black text-[#1D1C1A] uppercase">{recipient}</p>
                              <p className="text-xs font-bold text-[#E1392A] mt-0.5">{destination}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. COMPLETED SHIPMENTS TAB */}
            {activeTab === 'my_history' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {completedShipments.length === 0 ? (
                  <div className="text-center py-16 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[4px_4px_0px_0px_#1D1C1A]">
                    <Clock size={42} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black uppercase text-[#1D1C1A] mb-1">No Completed Shipments</h3>
                    <p className="text-slate-500 text-sm font-medium">Claim your active shipments and complete delivery runs to build your history!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {completedShipments.map((delivery) => {
                      const { destination, pickup, recipient } = mockAddress(delivery.order_id)
                      
                      return (
                        <div key={delivery.id} className="bg-white border-3 border-[#1D1C1A]/60 rounded-2xl p-6 shadow-sm opacity-85 hover:opacity-100 transition-opacity">
                          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-black text-slate-600 text-xs uppercase tracking-wide">
                                Delivery #{delivery.id.slice(-6).toUpperCase()}
                              </span>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Order ID: {delivery.order_id}</p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-emerald-600 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase">
                              ✓ Completed
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Transit Details</p>
                              <p className="font-black text-[#1D1C1A] mt-1">{pickup} → {destination}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-500 uppercase text-[9px] tracking-wider">Completion Timestamp</p>
                              <p className="font-black text-slate-800 mt-1">
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

      {/* Retro Toast alerts */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className={`fixed bottom-12 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl backdrop-blur-xl max-w-xs ${
              toastMsg.isError
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            {toastMsg.isError ? '⚠️' : '✅'}
            <span className="text-sm font-bold">{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
