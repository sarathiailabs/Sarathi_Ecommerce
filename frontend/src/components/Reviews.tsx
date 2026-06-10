import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  user_id: string
  created_at: string
  helpful_count: number
  verified_purchase: boolean
}

interface ReviewsProps {
  productId: string
}

export const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Please log in to leave a review')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/reviews/' + productId, {
        product_id: productId,
        rating,
        title,
        comment
      })
      setTitle('')
      setComment('')
      setRating(5)
      setShowForm(false)
      fetchReviews()
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`)
      fetchReviews()
    } catch (error) {
      console.error('Error marking review as helpful:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6 hover:bg-blue-700"
        >
          Write a Review
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-100 p-6 rounded-lg mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} Stars</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Summary of your review"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-24"
              placeholder="Share your experience..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold mt-1">{review.title}</h4>
                </div>
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              <div className="text-sm text-gray-500">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="text-blue-600 hover:underline"
                >
                  👍 Helpful ({review.helpful_count})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
