import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Package, ShoppingCart as OrderIcon, X, RefreshCw, BarChart2 } from 'lucide-react'
import api from '../services/api'
import { AdminAnalytics } from '../components/AdminAnalytics'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category: string
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
  items: OrderItem[]
  user?: {
    email: string
  }
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders'>('analytics')
  
  // Inventory state
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: ''
  })
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null)

  const showNotification = (text: string, isError: boolean = false) => {
    setNotification({ text, isError })
    setTimeout(() => setNotification(null), 3000)
  }

  // Fetch all data
  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, orderRes] = await Promise.all([
        api.get('/products'),
        api.get('/admin/orders')
      ])
      
      setProducts(prodRes.data.map((p: any) => ({
        ...p,
        price: Number(p.price),
        stock: Number(p.stock)
      })))
      
      setOrders(orderRes.data.map((o: any) => ({
        ...o,
        total_amount: Number(o.total_amount)
      })))
    } catch (error: any) {
      showNotification('Failed to fetch data: ' + (error.response?.data?.detail || error.message), true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Create Product handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const response = await api.post('/admin/products', {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        category: newProduct.category || 'General'
      })
      
      setProducts([response.data, ...products])
      setIsCreateOpen(false)
      setNewProduct({ name: '', description: '', price: '', stock: '', image_url: '', category: '' })
      showNotification('Product created successfully!')
    } catch (error: any) {
      showNotification('Failed to create product: ' + (error.response?.data?.detail || error.message), true)
    } finally {
      setActionLoading(false)
    }
  }

  // Update Product handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setActionLoading(true)
    try {
      const response = await api.put(`/admin/products/${editingProduct.id}`, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        image_url: editingProduct.image_url,
        category: editingProduct.category
      })
      
      setProducts(products.map(p => p.id === editingProduct.id ? {
        ...response.data,
        price: Number(response.data.price),
        stock: Number(response.data.stock)
      } : p))
      setEditingProduct(null)
      showNotification('Product updated successfully!')
    } catch (error: any) {
      showNotification('Failed to update product: ' + (error.response?.data?.detail || error.message), true)
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Product handler
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      showNotification('Product deleted successfully.')
    } catch (error: any) {
      showNotification('Failed to delete product: ' + (error.response?.data?.detail || error.message), true)
    }
  }

  // Update Order Status handler
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, { status })
      setOrders(orders.map(o => o.id === orderId ? {
        ...response.data,
        total_amount: Number(response.data.total_amount)
      } : o))
      showNotification(`Order status updated to ${status}.`)
    } catch (error: any) {
      showNotification('Failed to update status: ' + (error.response?.data?.detail || error.message), true)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border-3 border-[#1D1C1A] shadow-[4px_4px_0px_0px_#1D1C1A] flex items-center gap-2 font-black uppercase tracking-wider text-xs ${
          notification.isError
            ? 'bg-[#E1392A] text-white'
            : 'bg-[#FAF6EE] text-[#1D1C1A]'
        }`}>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1D1C1A] uppercase tracking-tight">Admin Console</h1>
          <p className="text-xs text-[#615E59] font-black uppercase tracking-wider mt-1">Manage catalog inventory, prices, stock levels and customer orders.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 bg-white border-3 border-[#1D1C1A] rounded-2xl p-1.5 shadow-[3px_3px_0px_0px_#1D1C1A]">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-[#F5B025] text-[#1D1C1A] border-2 border-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A]'
                : 'text-[#1D1C1A]/60 hover:text-[#1D1C1A] hover:bg-[#FAF6EE]'
            }`}
          >
            <BarChart2 size={14} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'inventory'
                ? 'bg-[#F5B025] text-[#1D1C1A] border-2 border-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A]'
                : 'text-[#1D1C1A]/60 hover:text-[#1D1C1A] hover:bg-[#FAF6EE]'
            }`}
          >
            <Package size={14} />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-[#F5B025] text-[#1D1C1A] border-2 border-[#1D1C1A] shadow-[2px_2px_0px_0px_#1D1C1A]'
                : 'text-[#1D1C1A]/60 hover:text-[#1D1C1A] hover:bg-[#FAF6EE]'
            }`}
          >
            <OrderIcon size={14} />
            Global Orders
          </button>
        </div>
      </div>

      {/* Main Section */}
      {loading ? (
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-8 flex items-center justify-center min-h-[300px] shadow-[4px_4px_0px_0px_#1D1C1A]">
          <RefreshCw className="animate-spin text-[#E1392A]" size={32} />
        </div>
      ) : activeTab === 'analytics' ? (
        <AdminAnalytics orders={orders} products={products} />
      ) : activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-[#1D1C1A] uppercase tracking-tight flex items-center gap-2">
              <Package size={18} className="text-[#E1392A]" />
              Products List ({products.length})
            </h2>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-primary text-xs font-black uppercase tracking-wider"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[4px_4px_0px_0px_#1D1C1A] overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF6EE] text-xs font-black text-[#1D1C1A] uppercase border-b-3 border-[#1D1C1A]">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1C1A]/10 text-sm text-[#1D1C1A]">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF6EE] border-2 border-[#1D1C1A] flex-shrink-0 flex items-center justify-center">
                        <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <div className="font-black text-[#1D1C1A] line-clamp-1 uppercase tracking-tight">{product.name}</div>
                        <div className="text-[9px] font-mono text-[#615E59] tracking-wider">{product.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#FAF6EE] text-[#1D1C1A] border-2 border-[#1D1C1A]">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-[#1D1C1A]">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-black uppercase text-xs ${product.stock > 10 ? 'text-emerald-600' : 'text-[#E1392A]'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 border-2 border-transparent hover:border-[#1D1C1A] hover:bg-[#F5B025]/20 text-[#1D1C1A] rounded-xl transition-all"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 border-2 border-transparent hover:border-[#1D1C1A] hover:bg-[#E1392A]/10 text-[#E1392A] rounded-xl transition-all"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#1D1C1A] uppercase tracking-tight flex items-center gap-2">
            <OrderIcon size={18} className="text-[#E1392A]" />
            Global Customer Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white border-3 border-[#1D1C1A] rounded-3xl shadow-[4px_4px_0px_0px_#1D1C1A]">
              <p className="text-[#615E59] font-black uppercase text-sm">No customer orders found.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border-3 border-[#1D1C1A] rounded-2xl shadow-[4px_4px_0px_0px_#1D1C1A] overflow-hidden hover:shadow-[5px_5px_0px_0px_#1D1C1A] transition-all">
                  {/* Order Header */}
                  <div className="bg-[#FAF6EE] px-6 py-4 border-b-3 border-[#1D1C1A] flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-6 text-xs text-[#615E59]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider">Order ID:</span>
                        <div className="font-mono text-[#1D1C1A] font-black mt-1 text-xs">{order.id}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider">User Profile:</span>
                        <div className="text-[#1D1C1A] font-black mt-1 text-xs">{order.user?.email || 'Customer'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider">Amount Charged:</span>
                        <div className="text-[#E1392A] font-black mt-1 text-sm">₹{order.total_amount.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Order Status Selector */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#615E59]">Status:</span>
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white text-xs font-black uppercase tracking-wider border-2 border-[#1D1C1A] rounded-xl py-1.5 px-3 text-[#1D1C1A] focus:outline-none appearance-none cursor-pointer pr-8 shadow-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#1D1C1A]">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 bg-white divide-y-2 divide-[#1D1C1A]/10">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <span className="font-black text-[#1D1C1A] uppercase tracking-tight">{item.product?.name || 'Deleted Product'}</span>
                        <span className="text-[#615E59] font-black uppercase tracking-wider text-[10px]">
                          Qty: <span className="font-black text-[#1D1C1A]">{item.quantity}</span> @ ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- CREATE PRODUCT MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#1D1C1A] rounded-3xl w-full max-w-lg p-8 shadow-[6px_6px_0px_0px_#1D1C1A] relative space-y-6 animate-scale-in">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-transparent hover:border-[#1D1C1A] rounded-lg text-[#1D1C1A] bg-[#FAF6EE] transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black uppercase tracking-tight text-[#1D1C1A]">Create New Product</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Wireless Headset"
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none focus:bg-[#FAF6EE] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product features and specs..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none focus:bg-[#FAF6EE] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Electronics, Home, etc."
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="Unsplash image link..."
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-slate-400 focus:outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-xl btn-primary text-xs font-black uppercase tracking-widest disabled:opacity-60"
              >
                {actionLoading ? 'Creating Product...' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#1D1C1A] rounded-3xl w-full max-w-lg p-8 shadow-[6px_6px_0px_0px_#1D1C1A] relative space-y-6 animate-scale-in">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 border-2 border-transparent hover:border-[#1D1C1A] rounded-lg text-[#1D1C1A] bg-[#FAF6EE] transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black uppercase tracking-tight text-[#1D1C1A]">Edit Product</h3>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold outline-none focus:bg-[#FAF6EE] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 rounded-xl btn-primary text-xs font-black uppercase tracking-widest disabled:opacity-60"
              >
                {actionLoading ? 'Updating Product...' : 'Update Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
