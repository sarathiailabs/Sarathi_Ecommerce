import React, { useState } from 'react'
import { Link } from 'react-router-dom'
<<<<<<< HEAD
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Zap, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
=======
import { Mail, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
import api from '../services/api'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
<<<<<<< HEAD
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devToken, setDevToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSuccess(true)
      // In dev mode the API returns the token directly — useful for automation
      if (res.data.reset_token) setDevToken(res.data.reset_token)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
=======
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      const response = await api.post('/auth/forgot-password', { email })
      setSuccessMsg(response.data.message || 'If an account with that email exists, we have sent a password reset link.')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'An error occurred. Please try again.')
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
    } finally {
      setSubmitting(false)
    }
  }

  return (
<<<<<<< HEAD
    <div data-page="forgot-password" className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 py-16 bg-[#FAF6EE]">
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
            data-testid="forgot-password-success"
            className="bg-white border-2 border-emerald-200 rounded-3xl p-8 text-center space-y-5 shadow-xl"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">Check your email</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                If <span className="font-bold text-slate-700">{email}</span> is registered, you'll receive a password reset link shortly.
              </p>
            </div>

            {/* Dev token display — only shown in dev for automation testing */}
            {devToken && (
              <div data-testid="dev-reset-token-box" className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  🛠 Dev Mode — Reset Token
                </p>
                <p data-testid="dev-reset-token" className="text-xs font-mono text-slate-700 break-all">{devToken}</p>
                <p className="text-[10px] text-slate-400 mt-2">This token is only shown in non-production environments.</p>
              </div>
            )}

            <Link to="/login" className="inline-flex items-center gap-2 text-amber-600 font-bold text-sm hover:text-amber-700 transition-colors">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Forgot Password?</h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                No worries. Enter your email and we'll send you reset instructions.
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  data-testid="forgot-password-error-msg"
                  className="flex items-start gap-3 p-4 mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm"
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form data-testid="forgot-password-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="forgot-email"
                    data-testid="forgot-password-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-amber-400 transition-colors shadow-sm"
                  />
                </div>
              </div>

              <motion.button
                id="forgot-password-submit-btn"
                data-testid="forgot-password-submit-btn"
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                <Send size={15} />
                {submitting ? 'Sending...' : 'Send Reset Instructions'}
              </motion.button>
            </form>

            <div className="text-center mt-6">
              <Link
                to="/login"
                data-testid="forgot-password-back-to-login"
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-600 font-semibold transition-colors"
              >
                <ArrowLeft size={14} />
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
          <h1 className="text-3xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">
            Enter your email to receive a password reset link.
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
          <div className="flex items-center gap-2 p-4 rounded-xl border border-green-500/20 bg-green-950/40 text-green-200 text-xs">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-350">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/10 hover:shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Remember your password?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
    </div>
  )
}
