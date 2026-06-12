import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface ReturnRequest {
  id: string
  order_id: string
  product_id: string
  quantity: number
  reason: string
  status: string
  refund_amount: number
  requested_at: string
  processed_at: string | null
}

export const Returns: React.FC = () => {
  const { user } = useAuth()
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReturns()
    }
  }, [user])

  const fetchReturns = async () => {
    try {
      const response = await api.get('/returns')
      setReturns(response.data)
    } catch (error) {
      console.error('Error fetching returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)
    try {
      await api.post('/returns', {
        order_id: orderId,
        product_id: productId,
        quantity,
        reason,
        description
      })
      setOrderId('')
      setProductId('')
      setQuantity(1)
      setReason('')
      setDescription('')
      setShowForm(false)
      fetchReturns()
      alert('Return request submitted successfully!')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error submitting return')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Refunded': 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center" data-testid="returns-unauthorized">
        <p className="text-gray-600">Please log in to view your returns</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8" data-testid="returns-loading-indicator">Loading returns...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Returns & Refunds</h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          data-testid="returns-request-btn"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700"
        >
          Request Return
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReturn} data-testid="returns-form" className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Return Request</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="return-order-id" className="block text-sm font-medium mb-2">Order ID</label>
              <input
                type="text"
                id="return-order-id"
                data-testid="return-order-id-input"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter order ID"
                required
              />
            </div>
            <div>
              <label htmlFor="return-product-id" className="block text-sm font-medium mb-2">Product ID</label>
              <input
                type="text"
                id="return-product-id"
                data-testid="return-product-id-input"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter product ID"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="return-quantity" className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              id="return-quantity"
              data-testid="return-quantity-input"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              min="1"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="return-reason" className="block text-sm font-medium mb-2">Reason for Return</label>
            <select
              id="return-reason"
              data-testid="return-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="">Select a reason</option>
              <option value="Defective">Defective</option>
              <option value="Not as described">Not as described</option>
              <option value="Size/Fit issue">Size/Fit issue</option>
              <option value="Changed mind">Changed mind</option>
              <option value="Found better price">Found better price</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="return-description" className="block text-sm font-medium mb-2">Additional Details</label>
            <textarea
              id="return-description"
              data-testid="return-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-20"
              placeholder="Provide any additional details about the return..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              data-testid="return-submit-btn"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              data-testid="return-cancel-btn"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Return Requests</h2>

        {returns.length === 0 ? (
          <p className="text-gray-600" data-testid="returns-empty-state">No return requests yet</p>
        ) : (
          <div className="space-y-4">
            {returns.map((returnReq) => (
              <div key={returnReq.id} data-testid={`returns-card-${returnReq.id}`} className="border border-gray-200 p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">Return Request #{returnReq.id.substring(0, 8)}</h3>
                    <p className="text-sm text-gray-600">Order: {returnReq.order_id.substring(0, 8)}</p>
                  </div>
                  <span data-testid={`returns-status-${returnReq.id}`} className={`px-3 py-1 rounded text-sm font-medium ${getStatusBadge(returnReq.status)}`}>
                    {returnReq.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-600">Quantity</p>
                    <p className="font-semibold">{returnReq.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Refund Amount</p>
                    <p className="font-semibold text-green-600" data-testid={`returns-refund-${returnReq.id}`}>${returnReq.refund_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Reason</p>
                    <p className="font-semibold">{returnReq.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Requested</p>
                    <p className="font-semibold text-sm">{new Date(returnReq.requested_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
