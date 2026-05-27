import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Package, ShoppingCart as OrderIcon, X, RefreshCw } from 'lucide-react'
import api from '../services/api'

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
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory')
  
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
      if (activeTab === 'inventory') {
        const response = await api.get('/products')
        setProducts(response.data.map((p: any) => ({
          ...p,
          price: Number(p.price),
          stock: Number(p.stock)
        })))
      } else {
        const response = await api.get('/admin/orders')
        setOrders(response.data.map((o: any) => ({
          ...o,
          total_amount: Number(o.total_amount)
        })))
      }
    } catch (error: any) {
      showNotification('Failed to fetch data: ' + (error.response?.data?.detail || error.message), true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

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
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-xl backdrop-blur-lg flex items-center gap-2 ${
          notification.isError
            ? 'border-red-500/30 bg-red-950/90 text-red-200'
            : 'border-purple-500/30 bg-purple-950/90 text-purple-200'
        }`}>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-400">Manage catalog inventory, prices, stock levels and customer orders.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 bg-slate-900 border border-white/5 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'inventory'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <OrderIcon size={14} />
            Global Orders
          </button>
        </div>
      </div>

      {/* Main Section */}
      {loading ? (
        <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[300px]">
          <RefreshCw className="animate-spin text-purple-500" size={32} />
        </div>
      ) : activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package size={18} className="text-purple-400" />
              Products List ({products.length})
            </h2>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/10 transition-all duration-200"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>

          {/* Inventory Table */}
          <div className="glass rounded-2xl overflow-hidden border border-white/5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-900/60 text-xs font-bold text-slate-400 uppercase border-b border-white/5">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                        <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 line-clamp-1">{product.name}</div>
                        <div className="text-[10px] text-slate-450 line-clamp-1">{product.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-white/5 text-slate-400">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${product.stock > 10 ? 'text-emerald-450' : 'text-amber-400'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <OrderIcon size={18} className="text-purple-400" />
            Global Customer Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl border border-white/5">
              <p className="text-slate-400 font-medium">No customer orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="glass rounded-2xl border border-white/5 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-slate-900/60 px-6 py-4 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-6 text-xs text-slate-400">
                      <div>
                        <span>Order ID:</span>
                        <div className="font-mono text-slate-200 font-bold mt-1">{order.id}</div>
                      </div>
                      <div>
                        <span>User Profile:</span>
                        <div className="text-slate-200 font-semibold mt-1">{order.user?.email || 'Customer'}</div>
                      </div>
                      <div>
                        <span>Amount Charged:</span>
                        <div className="text-purple-400 font-bold mt-1">₹{order.total_amount.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Order Status Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-450 font-medium">Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="bg-slate-900 text-xs font-bold border border-white/10 rounded-lg py-1.5 px-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 bg-slate-950/20 divide-y divide-white/5">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">{item.product?.name || 'Deleted Product'}</span>
                        <span className="text-slate-400">
                          Qty: <span className="font-bold text-slate-200">{item.quantity}</span> @ ₹{item.price.toFixed(2)}
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
          <div className="glass rounded-3xl w-full max-w-lg border border-white/10 p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-extrabold text-white">Create New Product</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Wireless Headset"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product features and specs..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Electronics, Home, etc."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Image URL</label>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="Unsplash image link..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-650/10 transition-all duration-200"
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
          <div className="glass rounded-3xl w-full max-w-lg border border-white/10 p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-extrabold text-white">Edit Product</h3>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description</label>
                <textarea
                  required
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Category</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Image URL</label>
                  <input
                    type="url"
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-650/10 transition-all duration-200"
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
