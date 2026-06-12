import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Zap, ShieldCheck, Shield, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const FEATURES = [
  { icon: <Shield size={16} />, text: 'Bank-grade security on all transactions' },
  { icon: <Star size={16} />, text: 'Access exclusive member-only deals' },
  { icon: <Zap size={16} />, text: 'Lightning-fast checkout experience' },
]

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
    <div data-page="reset-password" className="min-h-[calc(100vh-130px)] flex bg-[#F1F3F6] py-12 select-none justify-center items-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-sm border border-slate-200 shadow-md flex overflow-hidden min-h-[500px]">
        {/* LEFT: Branding Panel (Blue Flipkart-like side panel) */}
        <div className="brand-panel hidden md:flex flex-col w-[40%] bg-[#2874F0] text-white p-10 justify-between relative overflow-hidden">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/sarathi-logo.jpg"
                alt="Sarathi Logo"
                className="h-10 w-10 object-contain rounded-full border border-white/35 bg-white shadow-md"
              />
              <span className="text-lg font-bold text-white">Sarathi Store</span>
            </Link>

            <div className="space-y-2 pt-6">
              <h2 className="text-2xl font-extrabold leading-snug font-display">Reset Password</h2>
              <p className="text-slate-200 text-xs font-semibold leading-relaxed">
                Choose a secure password and regain access to your account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-bold text-slate-100">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                  {f.icon}
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-12">
          {/* Mobile brand logo header */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <img
              src="/sarathi-logo.jpg"
              alt="Sarathi Logo"
              className="h-12 w-12 object-contain rounded-full border border-slate-200 bg-white mb-2"
            />
            <span className="text-base font-bold text-slate-800">Sarathi Store</span>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              data-testid="reset-password-success"
              className="text-center space-y-5 py-4"
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
              <div className="pt-2">
                <Link to="/login" className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-sm bg-[#FF9F00] text-white font-bold text-xs w-full uppercase hover:bg-[#ff9100]">
                  Sign In Now
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-extrabold text-slate-800">Set New Password</h1>
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  Enter your reset token and choose a new password.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    id="reset-password-error-alert"
                    data-testid="reset-password-error-msg"
                    className="flex items-start gap-2.5 p-3 mb-4 rounded-sm border border-red-200 bg-red-50 text-red-800 text-xs"
                  >
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form data-testid="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Token field */}
                <div className="space-y-1">
                  <label htmlFor="reset-token" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Reset Token
                  </label>
                  <input
                    id="reset-token"
                    data-testid="reset-password-token-input"
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    aria-describedby={error ? 'reset-password-error-alert' : undefined}
                    placeholder="Paste your reset token here"
                    className="w-full px-3 py-2 border border-slate-350 bg-white rounded-sm text-xs font-mono text-slate-700 outline-none focus:border-[#2874F0]"
                  />
                </div>

                {/* New password */}
                <div className="space-y-1">
                  <label htmlFor="reset-new-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                    <input
                      id="reset-new-password"
                      data-testid="reset-password-new-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      aria-describedby={error ? 'reset-password-error-alert' : undefined}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-10 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2874F0]"
                    />
                    <button
                      type="button"
                      data-testid="reset-show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <label htmlFor="reset-confirm-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                    <input
                      id="reset-confirm-password"
                      data-testid="reset-password-confirm-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-describedby={error ? 'reset-password-error-alert' : undefined}
                      placeholder="Re-enter new password"
                      className={`w-full pl-9 pr-4 py-2 border rounded-sm text-xs text-slate-800 outline-none transition-colors ${
                        confirmPassword && newPassword !== confirmPassword
                          ? 'border-red-400 focus:border-red-400'
                          : confirmPassword && newPassword === confirmPassword
                          ? 'border-emerald-500 focus:border-emerald-500'
                          : 'border-slate-350 focus:border-[#2874F0]'
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#FF9F00] text-white text-xs font-bold hover:shadow-md hover:bg-[#ff9100] transition-all disabled:opacity-60 disabled:cursor-wait uppercase"
                >
                  <ShieldCheck size={14} />
                  {submitting ? 'Updating Password...' : 'Reset Password'}
                </motion.button>
              </form>

              <div className="text-center mt-6">
                <Link to="/login" className="text-xs text-slate-500 hover:text-[#2874F0] hover:underline font-bold transition-colors">
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

