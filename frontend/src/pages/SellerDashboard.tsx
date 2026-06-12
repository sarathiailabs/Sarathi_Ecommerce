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
    <div className="min-h-screen bg-[#F1F3F6] pb-24 pt-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-6">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#2874F0] text-white tracking-wider mb-2.5 uppercase">
              <Store size={12} />
              Vendor Operations Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 uppercase tracking-tight leading-none">
              Seller Console
            </h1>
            <p className="text-xs font-semibold text-slate-500 mt-2">
              Merchant: <span className="text-[#2874F0] font-bold">{user?.full_name || user?.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowShopModal(true)}
              data-testid="seller-open-shop-btn"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FF9F00] hover:bg-[#ff9100] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              <Plus size={14} />
              Open New Shop
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              data-testid="seller-reload-btn"
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Reload Logs
            </button>
          </div>
        </div>

        {/* SHOP REGISTER EMPTY STATE */}
        {!loading && shops.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-sm shadow-sm max-w-2xl mx-auto px-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-[#2874F0] mb-6 shadow-xs">
              <Store size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight mb-2">
              Launch Your Digital Flagship
            </h2>
            <p className="text-slate-400 font-semibold text-xs mb-6 max-w-md mx-auto leading-relaxed">
              Open your vendor store on Sarathi Store today. Upload premium catalog items, monitor orders, and connect with elite members.
            </p>
            <button
              onClick={() => setShowShopModal(true)}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#FF9F00] hover:bg-[#ff9100] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm transition-colors"
            >
              Open Your Shop Now
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Active Shop Selector Dropdown for multiseller support */}
            {shops.length > 1 && (
              <div className="flex items-center gap-3 mb-6 bg-white border border-slate-200 p-3 rounded-sm shadow-xs max-w-md">
                <span className="text-xs font-bold uppercase text-slate-400">Active Shop:</span>
                <select
                  value={activeShop?.id || ''}
                  data-testid="seller-active-shop-select"
                  onChange={(e) => {
                    const shop = shops.find(s => s.id === e.target.value)
                    if (shop) handleShopChange(shop)
                  }}
                  className="flex-1 px-3 py-1.5 bg-transparent text-xs font-bold text-slate-700 border border-slate-300 rounded-sm focus:outline-none focus:border-[#2874F0] cursor-pointer"
                >
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Shop Billboard Profile */}
            {activeShop && (
              <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-sm border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0 shadow-xs flex items-center justify-center">
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
                    <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight leading-none">{activeShop.name}</h2>
                    <p className="text-xs text-[#2874F0] font-bold mt-2 uppercase">{activeShop.description || 'Premium Certified Merchant Partner'}</p>
                    <span className="inline-block text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 mt-2 rounded-sm border border-slate-200">SHOP ID: {activeShop.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowProductModal(true)}
                  data-testid="seller-add-product-btn"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2874F0] hover:bg-[#1264e3] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm self-start md:self-center transition-colors"
                >
                  <Plus size={16} />
                  Add Catalog Listing
                </button>
              </div>
            )}

            {/* Modern Key Metrics Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              
              <div data-testid="seller-stat-listings" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Listings</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#2874F0]">
                    <Package size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-850">{totalListings} items</div>
                <p className="text-[10px] text-slate-455 font-semibold mt-1">Live in store catalog</p>
              </div>

              <div data-testid="seller-stat-inventory" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inventory Value</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <DollarSign size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-850">₹{totalInventoryValue.toLocaleString('en-IN')}</div>
                <p className="text-[10px] text-slate-455 font-semibold mt-1">Cumulative product value</p>
              </div>

              <div data-testid="seller-stat-restock" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Restock Alerts</span>
                  <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-550">
                    <AlertCircle size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-rose-600">{lowStockCount}</div>
                <p className="text-[10px] text-slate-455 font-semibold mt-1">Items at or below 5 units</p>
              </div>

              <div data-testid="seller-stat-rating" className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Store Rating</span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-[#FF9F00]">
                    <BarChart2 size={14} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-850">{avgRating} ★</div>
                <p className="text-[10px] text-slate-455 font-semibold mt-1">Avg customer evaluation</p>
              </div>

            </div>

            {/* Catalog Grid Section */}
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-extrabold text-slate-800 uppercase">Active Catalog</h3>
                <span className="text-xs text-slate-450 font-bold uppercase">{products.length} live units</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white border border-slate-200 rounded-sm" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-sm shadow-xs max-w-lg mx-auto">
                  <Package size={36} className="text-slate-300 mx-auto mb-4" />
                  <h4 className="text-xs font-bold uppercase text-slate-750 mb-1">Catalog Empty</h4>
                  <p className="text-slate-400 text-xs mb-5 font-semibold">List your first premium tech artifact now.</p>
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="px-4 py-2 bg-[#2874F0] hover:bg-[#1264e3] text-white text-[11px] font-bold uppercase rounded-sm transition-colors"
                  >
                    Add Product Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        {/* Square image aspect */}
                        <div className="aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden relative">
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
                        
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-1.5 py-0.5 border border-slate-150 bg-slate-50 rounded-sm text-[9px] font-bold uppercase text-slate-500">
                              {product.category}
                            </span>
                            <span className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-red-500 font-extrabold' : 'text-emerald-600'}`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide truncate mb-1">
                            {product.name}
                          </h4>
                          
                          <p className="text-[10px] text-slate-450 font-semibold line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                        <span className="text-sm font-extrabold text-slate-850">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-amber-500 flex items-center">
                          {product.rating} ★ <span className="text-slate-400 font-semibold ml-0.5">({product.review_count})</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              data-testid="seller-shop-modal"
              role="dialog"
              aria-modal="true"
              className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 max-w-md w-full shadow-xl relative"
            >
              <button
                onClick={() => setShowShopModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-all"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2874F0]">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 uppercase leading-none">Register Store</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">Establish your certified marketplace</p>
                </div>
              </div>

              <form onSubmit={handleCreateShop} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="shop-name-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Shop Name *</label>
                  <input
                    type="text"
                    required
                    id="shop-name-input"
                    data-testid="shop-name-input"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex Tech Deck"
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shop-desc-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description</label>
                  <textarea
                    rows={3}
                    id="shop-desc-input"
                    data-testid="shop-desc-input"
                    value={shopDesc}
                    onChange={(e) => setShopDesc(e.target.value)}
                    placeholder="Describe your premium items..."
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="shop-logo-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Logo URL</label>
                  <input
                    type="url"
                    id="shop-logo-input"
                    data-testid="shop-logo-input"
                    value={shopLogo}
                    onChange={(e) => setShopLogo(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                  />
                  <p className="text-[9px] text-slate-400 font-semibold">Leave empty for a cool default logo.</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  data-testid="shop-submit-btn"
                  className="w-full bg-[#FF9F00] hover:bg-[#ff9100] text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors mt-2"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              data-testid="seller-product-modal"
              role="dialog"
              aria-modal="true"
              className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 max-w-lg w-full shadow-xl relative my-8"
            >
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-all"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2874F0]">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 uppercase leading-none">Add Product</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">Add listing to {activeShop?.name}</p>
                </div>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor="prod-name-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Product Title *</label>
                    <input
                      type="text"
                      required
                      id="prod-name-input"
                      data-testid="prod-name-input"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. Tactile Wireless Headset"
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="prod-cat-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category *</label>
                    <select
                      id="prod-cat-select"
                      data-testid="prod-cat-select"
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2874F0] cursor-pointer"
                    >
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="prod-stock-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      id="prod-stock-input"
                      data-testid="prod-stock-input"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor="prod-price-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      id="prod-price-input"
                      data-testid="prod-price-input"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      placeholder="e.g. 1999"
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor="prod-desc-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Description *</label>
                    <textarea
                      rows={3}
                      required
                      id="prod-desc-input"
                      data-testid="prod-desc-input"
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Provide rich specifications or features..."
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor="prod-image-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Image URL</label>
                    <input
                      type="url"
                      id="prod-image-input"
                      data-testid="prod-image-input"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-sm text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2874F0]"
                    />
                    
                    {/* Preset Picker */}
                    <div className="mt-2.5 space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Or select a high-end preset image:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {IMAGE_PRESETS.map(preset => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setProdImage(preset.url)}
                            data-testid={`prod-preset-${preset.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                            className={`px-2 py-0.5 border text-[9px] font-bold rounded-sm transition-all ${
                              prodImage === preset.url
                                ? 'bg-blue-50 border-[#2874F0] text-[#2874F0]'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
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
                  data-testid="product-submit-btn"
                  className="w-full bg-[#FF9F00] hover:bg-[#ff9100] text-white py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors mt-3"
                >
                  {submitting ? 'Uploading Listing...' : 'Publish Product Listing'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Toast alerts */}
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

