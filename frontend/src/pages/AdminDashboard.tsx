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
        <div data-testid="admin-notification" className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-sm border shadow-md flex items-center gap-2 font-bold uppercase tracking-wider text-xs ${
          notification.isError
            ? 'bg-red-500 text-white border-red-600'
            : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">Manage catalog inventory, prices, stock levels and customer orders.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-sm p-1 shadow-xs" role="tablist">
          <button
            onClick={() => setActiveTab('analytics')}
            role="tab"
            aria-selected={activeTab === 'analytics'}
            data-testid="admin-tab-analytics"
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'analytics'
                ? 'bg-[#0F6FFF] text-white'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <BarChart2 size={14} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            role="tab"
            aria-selected={activeTab === 'inventory'}
            data-testid="admin-tab-inventory"
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'inventory'
                ? 'bg-[#0F6FFF] text-white'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Package size={14} />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            role="tab"
            aria-selected={activeTab === 'orders'}
            data-testid="admin-tab-orders"
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeTab === 'orders'
                ? 'bg-[#0F6FFF] text-white'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <OrderIcon size={14} />
            Global Orders
          </button>
        </div>
      </div>

      {/* Main Section */}
      {loading ? (
        <div data-testid="admin-loading-indicator" className="bg-white border border-slate-200 rounded-sm p-8 flex items-center justify-center min-h-[300px] shadow-xs">
          <RefreshCw className="animate-spin text-[#0F6FFF]" size={32} />
        </div>
      ) : activeTab === 'analytics' ? (
        <AdminAnalytics orders={orders} products={products} />
      ) : activeTab === 'inventory' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Package size={18} className="text-[#0F6FFF]" />
              Products List ({products.length})
            </h2>
            <button
              onClick={() => setIsCreateOpen(true)}
              data-testid="admin-add-product-btn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm btn-primary text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {products.map((product) => (
                  <tr key={product.id} data-testid={`admin-product-row-${product.id}`} className="hover:bg-slate-55/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm overflow-hidden bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                        <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-1 uppercase tracking-tight">{product.name}</div>
                        <div className="text-[9px] font-mono text-slate-450 tracking-wider">{product.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold uppercase text-xs ${product.stock > 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        data-testid={`admin-edit-btn-${product.id}`}
                        className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-sm transition-all"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        data-testid={`admin-delete-btn-${product.id}`}
                        className="p-2 border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-500 rounded-sm transition-all"
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
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <OrderIcon size={18} className="text-[#0F6FFF]" />
            Global Customer Orders ({orders.length})
          </h2>

          {orders.length === 0 ? (
            <div data-testid="admin-orders-empty" className="text-center py-20 bg-white border border-slate-200 rounded-sm shadow-xs">
              <p className="text-slate-550 font-bold uppercase text-sm">No customer orders found.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div key={order.id} data-testid={`admin-order-card-${order.id}`} className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden hover:shadow-sm transition-all">
                  {/* Order Header */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-6 text-xs text-slate-500">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID:</span>
                        <div className="font-mono text-slate-700 font-bold mt-1 text-xs">{order.id}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">User Profile:</span>
                        <div className="text-slate-700 font-bold mt-1 text-xs">{order.user?.email || 'Customer'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Charged:</span>
                        <div className="text-[#14B8A6] font-bold mt-1 text-sm">₹{order.total_amount.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Order Status Selector */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
                      <div className="relative">
                        <select
                           value={order.status}
                           data-testid={`admin-order-status-select-${order.id}`}
                           onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                           className="bg-white text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-sm py-1.5 px-3 text-slate-700 focus:outline-none focus:border-[#0F6FFF] appearance-none cursor-pointer pr-8 shadow-xs"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 bg-white divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 uppercase tracking-tight">{item.product?.name || 'Deleted Product'}</span>
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          Qty: <span className="font-bold text-slate-750">{item.quantity}</span> @ ₹{item.price.toFixed(2)}
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
          <div
            className="bg-white border border-slate-200 rounded-sm w-full max-w-lg p-8 shadow-md relative space-y-6 animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-title"
          >
            <button
              onClick={() => setIsCreateOpen(false)}
              data-testid="admin-create-close-btn"
              className="absolute top-4 right-4 p-1.5 border border-slate-200 hover:bg-slate-55 rounded-sm text-slate-500 bg-white transition-all"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <h3 id="create-product-title" className="text-xl font-bold uppercase tracking-tight text-slate-800">Create New Product</h3>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="new-product-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  id="new-product-name"
                  data-testid="new-product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Wireless Headset"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="new-product-description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  id="new-product-description"
                  data-testid="new-product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product features and specs..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="new-product-price" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    id="new-product-price"
                    data-testid="new-product-price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="new-product-stock" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Count</label>
                  <input
                    type="number"
                    required
                    id="new-product-stock"
                    data-testid="new-product-stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="new-product-category" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    id="new-product-category"
                    data-testid="new-product-category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Electronics, Home, etc."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="new-product-image" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                  <input
                    type="url"
                    id="new-product-image"
                    data-testid="new-product-image"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="Unsplash image link..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                data-testid="admin-create-submit-btn"
                className="w-full py-3 rounded-sm btn-primary text-xs font-bold uppercase tracking-widest disabled:opacity-60"
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
          <div
            className="bg-white border border-slate-200 rounded-sm w-full max-w-lg p-8 shadow-md relative space-y-6 animate-scale-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
          >
            <button
              onClick={() => setEditingProduct(null)}
              data-testid="admin-edit-close-btn"
              className="absolute top-4 right-4 p-1.5 border border-slate-200 hover:bg-slate-55 rounded-sm text-slate-500 bg-white transition-all"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <h3 id="edit-product-title" className="text-xl font-bold uppercase tracking-tight text-slate-800">Edit Product</h3>

            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="edit-product-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  required
                  id="edit-product-name"
                  data-testid="edit-product-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-product-description" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  id="edit-product-description"
                  data-testid="edit-product-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="edit-product-price" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    id="edit-product-price"
                    data-testid="edit-product-price"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-product-stock" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Count</label>
                  <input
                    type="number"
                    required
                    id="edit-product-stock"
                    data-testid="edit-product-stock"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="edit-product-category" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    required
                    id="edit-product-category"
                    data-testid="edit-product-category"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-product-image" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</label>
                  <input
                    type="url"
                    id="edit-product-image"
                    data-testid="edit-product-image"
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm text-slate-700 font-semibold focus:outline-none focus:border-[#0F6FFF] focus:ring-1 focus:ring-[#0F6FFF] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                data-testid="admin-edit-submit-btn"
                className="w-full py-3 rounded-sm btn-primary text-xs font-bold uppercase tracking-widest disabled:opacity-60"
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
