import React, { useState } from 'react'
<<<<<<< HEAD
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Zap, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
=======
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
import api from '../services/api'

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
<<<<<<< HEAD
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
=======
  const token = searchParams.get('token')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!token) {
      setErrorMsg('Invalid or missing reset token. Please request a new link.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
      return
    }

    setSubmitting(true)
<<<<<<< HEAD
    try {
      await api.post('/auth/reset-password', { token, new_password: newPassword })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Reset failed. The token may be expired or already used.')
=======

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      })
      setSuccessMsg(response.data.message || 'Password successfully reset. You can now log in.')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'An error occurred. Please try again or request a new link.')
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
    } finally {
      setSubmitting(false)
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="max-w-md mx-auto px-6 py-20 flex flex-col justify-center min-h-[80vh]">
      <div className="glass rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none"></div>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white">Create New Password</h1>
          <p className="text-xs text-slate-400">
            Enter your new password below.
          </p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-950/40 text-red-200 text-xs">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-green-500/20 bg-green-950/40 text-green-200 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <Link to="/login" className="text-center py-2 bg-green-500/20 rounded-lg font-bold hover:bg-green-500/30 transition-colors">
              Go to Login
            </Link>
          </div>
        )}

        {/* Form */}
        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-355">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-355">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/10 hover:shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
    </div>
  )
}
