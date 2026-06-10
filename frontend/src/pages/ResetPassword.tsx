import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Zap, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Token comes from URL ?token= (as sent in reset email or dev token box)
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Reset failed. The token may be expired or already used.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div data-page="reset-password" className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 py-16 bg-[#FAF6EE]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
            <Zap size={18} fill="white" className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-800">Prathazon</span>
        </Link>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            data-testid="reset-password-success"
            className="bg-white border-2 border-emerald-200 rounded-3xl p-8 text-center space-y-5 shadow-xl"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Password Reset!</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your password has been updated. Redirecting you to sign in...
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-amber-500 text-white font-bold text-sm w-full">
              Sign In Now
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-amber-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Set New Password</h1>
              <p className="text-slate-500 text-sm font-medium">
                Enter your reset token and choose a new password.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  data-testid="reset-password-error-msg"
                  className="flex items-start gap-3 p-4 mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm"
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form data-testid="reset-password-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Token field — pre-filled from URL, but editable */}
              <div className="space-y-1.5">
                <label htmlFor="reset-token" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reset Token
                </label>
                <input
                  id="reset-token"
                  data-testid="reset-password-token-input"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token here"
                  className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-mono text-slate-700 outline-none focus:border-amber-400 transition-colors shadow-sm"
                />
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <label htmlFor="reset-new-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="reset-new-password"
                    data-testid="reset-password-new-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-amber-400 transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    data-testid="reset-show-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="reset-confirm-password"
                    data-testid="reset-password-confirm-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-xl text-sm font-medium text-slate-800 outline-none transition-colors shadow-sm ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-400'
                        : confirmPassword && newPassword === confirmPassword
                        ? 'border-emerald-400'
                        : 'border-slate-200 focus:border-amber-400'
                    }`}
                  />
                </div>
              </div>

              <motion.button
                id="reset-password-submit-btn"
                data-testid="reset-password-submit-btn"
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                <ShieldCheck size={16} />
                {submitting ? 'Updating Password...' : 'Reset Password'}
              </motion.button>
            </form>

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-slate-500 hover:text-amber-600 font-semibold transition-colors">
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
