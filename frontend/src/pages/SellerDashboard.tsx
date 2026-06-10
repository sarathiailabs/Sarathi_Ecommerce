import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Plus, Sparkles, Package, TrendingUp, AlertCircle,
  X, Image as ImageIcon, DollarSign, List, RefreshCw, BarChart2
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

interface Shop {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  owner_id: string
  created_at: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category: string
  shop_id: string | null
  rating: number
  review_count: number
}

const PRODUCT_CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Audio',
  'Wearables',
  'Gaming',
  'Cameras',
  'Smart Home',
  'Electronics',
  'Accessories'
]

const IMAGE_PRESETS = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80' },
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1496181130204-7552cc1454b4?auto=format&fit=crop&w=500&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80' },
  { label: 'Gaming Mouse', url: 'https://images.unsplash.com/photo-1527698266440-12104a498b76?auto=format&fit=crop&w=500&q=80' },
]

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth()
  
  // States
  const [shops, setShops] = useState<Shop[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeShop, setActiveShop] = useState<Shop | null>(null)
  
  // Modal & Form States
  const [showShopModal, setShowShopModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ text: string; isError: boolean } | null>(null)

  // Shop Form
  const [shopName, setShopName] = useState('')
  const [shopDesc, setShopDesc] = useState('')
  const [shopLogo, setShopLogo] = useState('')

  // Product Form
  const [prodName, setProdName] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodStock, setProdStock] = useState('')
  const [prodImage, setProdImage] = useState('')
  const [prodCat, setProdCat] = useState('Accessories')
  const [submitting, setSubmitting] = useState(false)

  const showToast = useCallback((text: string, isError = false) => {
    setToastMsg({ text, isError })
    setTimeout(() => setToastMsg(null), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch user's shops
      const shopRes = await api.get('/shops/my')
      const shopList = shopRes.data
      setShops(shopList)
      
      if (shopList.length > 0) {
        // Set first shop as active if none selected
        const selected = activeShop ? shopList.find((s: Shop) => s.id === activeShop.id) || shopList[0] : shopList[0]
        setActiveShop(selected)
        
        // 2. Fetch all products to filter by this shop's ID
        const prodRes = await api.get('/products')
        const allProducts = prodRes.data.map((p: any) => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock)
        }))
        
        const filtered = allProducts.filter((p: Product) => p.shop_id === selected.id)
        setProducts(filtered)
      } else {
        setActiveShop(null)
        setProducts([])
      }
    } catch (err: any) {
      console.error('Failed to load seller panel metrics:', err)
      showToast('Error syncing vendor logs', true)
    } finally {
      setLoading(false)
    }
  }, [activeShop, showToast])

  useEffect(() => {
    fetchData()
  }, [])

  // Auto reload products when active shop changes
  const handleShopChange = async (shop: Shop) => {
    setActiveShop(shop)
    setLoading(true)
    try {
      const prodRes = await api.get('/products')
      const allProducts = prodRes.data.map((p: any) => ({
        ...p,
        price: Number(p.price),
        stock: Number(p.stock)
      }))
      const filtered = allProducts.filter((p: Product) => p.shop_id === shop.id)
      setProducts(filtered)
    } catch (err) {
      showToast('Error loading shop catalog', true)
    } finally {
      setLoading(false)
    }
  }

  // Create Shop
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName.trim()) return
    setSubmitting(true)
    try {
      const logoUrl = shopLogo.trim() || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80'
      const response = await api.post('/shops', {
        name: shopName,
        description: shopDesc || 'Certified Premium Electronics Vendor',
        logo_url: logoUrl
      })
      showToast('Vendor store registered successfully! 🏪')
      setShopName('')
      setShopDesc('')
      setShopLogo('')
      setShowShopModal(false)
      
      // Select the newly created shop
      setActiveShop(response.data)
      await fetchData()
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to open store', true)
    } finally {
      setSubmitting(false)
    }
  }

  // Add Product to Shop
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeShop) return
    if (!prodName.trim() || !prodPrice || !prodStock) return
    setSubmitting(true)
    try {
      const finalImage = prodImage.trim() || IMAGE_PRESETS[0].url
      await api.post(`/shops/${activeShop.id}/products`, {
        name: prodName,
        description: prodDesc || 'Elite premium living essential hardware and design.',
        price: Number(prodPrice),
        stock: Number(prodStock),
        image_url: finalImage,
        category: prodCat
      })
      showToast('Catalog listing active! 📦')
      
      // Reset Form
      setProdName('')
      setProdDesc('')
      setProdPrice('')
      setProdStock('')
      setProdImage('')
      setProdCat('Accessories')
      setShowProductModal(false)
      
      // Refresh list
      await handleShopChange(activeShop)
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to upload item', true)
    } finally {
      setSubmitting(false)
    }
  }

  // Stats calculation
  const totalListings = products.length
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0)
  const lowStockCount = products.filter(p => p.stock <= 5).length
  const avgRating = products.length > 0 
    ? (products.reduce((acc, p) => acc + p.rating, 0) / products.length).toFixed(1)
    : '4.8'

  return (
    <div className="min-h-screen bg-[#FAF6EE] pb-24 pt-8">
      {/* Dots Grid background */}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-[#E1392A] text-white border-2 border-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A] uppercase tracking-wider mb-3">
              <Store size={12} />
              Vendor Operations gate
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#1D1C1A] tracking-tight uppercase leading-none">
              SELLER CONSOLE
            </h1>
            <p className="text-sm font-bold text-[#615E59] mt-2">
              Merchant: <span className="text-[#E1392A]">{user?.full_name || user?.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowShopModal(true)}
              className="btn-secondary flex items-center gap-2 px-5 py-3 uppercase text-xs font-black tracking-wider"
            >
              <Plus size={14} />
              Open New Shop
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary flex items-center gap-2 px-5 py-3 uppercase text-xs font-black tracking-wider bg-white"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Reload Logs
            </button>
          </div>
        </div>

        {/* SHOP REGISTER EMPTY STATE */}
        {!loading && shops.length === 0 ? (
          <div className="text-center py-20 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[5px_5px_0px_0px_#1D1C1A] max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-3 border-[#1D1C1A] flex items-center justify-center mx-auto text-[#E1392A] mb-6 shadow-[2px_2px_0px_0px_#1D1C1A]">
              <Store size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1D1C1A] uppercase tracking-tight mb-2">
              LAUNCh YOUR DIGITAL FLAGSHIp
            </h2>
            <p className="text-slate-500 font-bold text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Open your vendor store on Prathazon today. Upload premium catalog items, monitor orders, and connect with elite members.
            </p>
            <button
              onClick={() => setShowShopModal(true)}
              className="btn-primary px-8 py-4 uppercase text-xs font-black tracking-wider shadow-md"
            >
              Open Your Shop Now
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Active Shop Selector Dropdown for multiseller support */}
            {shops.length > 1 && (
              <div className="flex items-center gap-3 mb-8 bg-white border-3 border-[#1D1C1A] p-4 rounded-2xl shadow-[3px_3px_0px_0px_#1D1C1A] max-w-md">
                <span className="text-xs font-black uppercase text-slate-500">Active Shop:</span>
                <select
                  value={activeShop?.id || ''}
                  onChange={(e) => {
                    const shop = shops.find(s => s.id === e.target.value)
                    if (shop) handleShopChange(shop)
                  }}
                  className="flex-1 px-3 py-2 bg-transparent text-sm font-black text-[#1D1C1A] border-2 border-[#1D1C1A] rounded-xl focus:outline-none appearance-none cursor-pointer"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Shop Billboard Profile */}
            {activeShop && (
              <div className="bg-white border-3 border-[#1D1C1A] rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1D1C1A] mb-12 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl border-3 border-[#1D1C1A] bg-amber-50 overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_#1D1C1A]">
                    <img
                      src={activeShop.logo_url || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&q=80'}
                      alt={activeShop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=150&q=80'
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1D1C1A] uppercase tracking-tight leading-none">{activeShop.name}</h2>
                    <p className="text-xs text-slate-500 font-bold mt-2 uppercase">{activeShop.description || 'Premium Certified Merchant Partner'}</p>
                    <span className="inline-block text-[9px] font-black text-[#615E59] bg-slate-100 px-2 py-0.5 border border-slate-200 mt-2 rounded">SHOP ID: {activeShop.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowProductModal(true)}
                  className="btn-primary flex items-center gap-2 px-6 py-4 uppercase text-xs font-black tracking-wider self-start md:self-center"
                >
                  <Plus size={16} />
                  Add Catalog Listing
                </button>
              </div>
            )}

            {/* Tactile Key Metrics Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              
              <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Active Listings</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border-2 border-[#1D1C1A] flex items-center justify-center text-[#E1392A]">
                    <Package size={14} />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#1D1C1A]">{totalListings} items</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Live in store catalog</p>
              </div>

              <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Inventory Value</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border-2 border-[#1D1C1A] flex items-center justify-center text-emerald-600">
                    <DollarSign size={14} />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#1D1C1A]">₹{totalInventoryValue.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Cumulative product value</p>
              </div>

              <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Restock Alerts</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border-2 border-[#1D1C1A] flex items-center justify-center text-rose-500">
                    <AlertCircle size={14} />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#E1392A]">{lowStockCount}</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Items at or below 5 units</p>
              </div>

              <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-[#615E59] font-black uppercase tracking-widest">Store Rating</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border-2 border-[#1D1C1A] flex items-center justify-center text-purple-600">
                    <BarChart2 size={14} />
                  </div>
                </div>
                <div className="text-3xl font-black text-[#1D1C1A]">{avgRating} ★</div>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Avg customer evaluation</p>
              </div>

            </div>

            {/* Catalog Grid Section */}
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <h3 className="text-xl font-black text-[#1D1C1A] uppercase">Active Catalog</h3>
                <span className="text-xs text-[#615E59] font-bold uppercase">{products.length} live units</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white border-3 border-[#1D1C1A] rounded-2xl skeleton" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[3px_3px_0px_0px_#1D1C1A] max-w-lg mx-auto">
                  <Package size={36} className="text-slate-300 mx-auto mb-4" />
                  <h4 className="text-sm font-black uppercase text-[#1D1C1A] mb-1">Catalog Empty</h4>
                  <p className="text-slate-500 text-xs mb-5 font-bold">List your first premium tech artifact now.</p>
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="btn-primary px-5 py-2.5 text-[10px] font-black uppercase tracking-wider"
                  >
                    Add Product Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(product => (
                    <div key={product.id} className="bg-white border-3 border-[#1D1C1A] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[6px_6px_0px_0px_#1D1C1A] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                      <div>
                        {/* Square image aspect */}
                        <div className="aspect-square bg-[#FAF6EE] border-b-2 border-[#1D1C1A] overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = IMAGE_PRESETS[0].url
                            }}
                          />
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 border border-slate-200 bg-slate-50 rounded text-[9px] font-black uppercase text-slate-500">
                              {product.category}
                            </span>
                            <span className={`text-[10px] font-black uppercase ${product.stock <= 5 ? 'text-red-500' : 'text-[#3A8E7D]'}`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                          
                          <h4 className="font-black text-sm text-[#1D1C1A] uppercase tracking-wide truncate mb-1">
                            {product.name}
                          </h4>
                          
                          <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                        <span className="text-base font-black text-[#1D1C1A]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-amber-500">
                          {product.rating} ★ ({product.review_count})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Modal 1: Open Shop Form */}
      <AnimatePresence>
        {showShopModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1C1A]/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF6EE] border-3 border-[#1D1C1A] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_0px_#1D1C1A] relative"
            >
              <button
                onClick={() => setShowShopModal(false)}
                className="absolute top-4 right-4 p-1.5 border-2 border-transparent hover:border-[#1D1C1A] rounded-xl text-[#1D1C1A] transition-all"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-[#1D1C1A] flex items-center justify-center text-[#E1392A]">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1D1C1A] uppercase leading-none">Register Store</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Establish your certified marketplace</p>
                </div>
              </div>

              <form onSubmit={handleCreateShop} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Shop Name *</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Tech Deck"
                    className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={3}
                    value={shopDesc}
                    onChange={(e) => setShopDesc(e.target.value)}
                    placeholder="Describe your premium items..."
                    className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Logo URL</label>
                  <input
                    type="url"
                    value={shopLogo}
                    onChange={(e) => setShopLogo(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                  />
                  <p className="text-[9px] text-slate-400 font-bold">Leave empty for a cool default logo.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-4 uppercase text-xs font-black tracking-wider shadow-sm mt-3"
                >
                  {submitting ? 'Registering...' : 'Open Vendor Store'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Add Product Listing Form */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1C1A]/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF6EE] border-3 border-[#1D1C1A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[6px_6px_0px_0px_#1D1C1A] relative my-8"
            >
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-4 right-4 p-1.5 border-2 border-transparent hover:border-[#1D1C1A] rounded-xl text-[#1D1C1A] transition-all"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-[#1D1C1A] flex items-center justify-center text-[#E1392A]">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1D1C1A] uppercase leading-none">Add Product</h3>
                  <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Add listing to {activeShop?.name}</p>
                </div>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. Tactile Wireless Headset"
                      className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Category *</label>
                    <select
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-black text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A] appearance-none"
                    >
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 1999"
                      className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Provide rich specifications or features..."
                      className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wide">Image URL</label>
                    <input
                      type="url"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm font-bold text-[#1D1C1A] focus:outline-none focus:bg-[#FAF6EE] shadow-[2px_2px_0px_0px_#1D1C1A]"
                    />
                    
                    {/* Preset Picker */}
                    <div className="mt-2.5 space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Or select a high-end preset image:</span>
                      <div className="flex flex-wrap gap-2">
                        {IMAGE_PRESETS.map(preset => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setProdImage(preset.url)}
                            className={`px-3 py-1 border-2 text-[9px] font-black rounded-lg transition-all ${
                              prodImage === preset.url
                                ? 'bg-amber-100 border-[#1D1C1A] text-[#1D1C1A]'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary py-4 uppercase text-xs font-black tracking-wider shadow-sm mt-4"
                >
                  {submitting ? 'Uploading Listing...' : 'Publish Product Listing'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
