import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Zap, Send, Shield, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const FEATURES = [
  { icon: <Shield size={16} />, text: 'Bank-grade security on all transactions' },
  { icon: <Star size={16} />, text: 'Access exclusive member-only deals' },
  { icon: <Zap size={16} />, text: 'Lightning-fast checkout experience' },
]

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
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
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div data-page="forgot-password" className="min-h-[calc(100vh-130px)] flex bg-[#F1F3F6] py-12 select-none justify-center items-center px-4">
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
                Recover your access to your Orders, Wishlist, and Recommendations.
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
              data-testid="forgot-password-success"
              className="text-center space-y-5 py-4"
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
                <div data-testid="dev-reset-token-box" className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-left">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    🛠 Dev Mode — Reset Token
                  </p>
                  <p data-testid="dev-reset-token" className="text-xs font-mono text-slate-700 break-all">{devToken}</p>
                  <div className="mt-2">
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="text-xs text-[#2874F0] font-bold hover:underline"
                    >
                      Click here to reset password using this token &rarr;
                    </Link>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">This token is only shown in non-production environments.</p>
                </div>
              )}

              <div className="pt-4">
                <Link to="/login" className="inline-flex items-center gap-2 text-[#2874F0] font-bold text-xs hover:underline">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-extrabold text-slate-800">Forgot Password?</h1>
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    id="forgot-password-error-alert"
                    data-testid="forgot-password-error-msg"
                    className="flex items-start gap-2.5 p-3 mb-4 rounded-sm border border-red-200 bg-red-50 text-red-800 text-xs"
                  >
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form data-testid="forgot-password-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="forgot-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                    <input
                      id="forgot-email"
                      data-testid="forgot-password-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-describedby={error ? 'forgot-password-error-alert' : undefined}
                      placeholder="enter email address"
                      className="w-full pl-9 pr-4 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>

                <motion.button
                  id="forgot-password-submit-btn"
                  data-testid="forgot-password-submit-btn"
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#FF9F00] text-white text-xs font-bold hover:shadow-md hover:bg-[#ff9100] transition-all disabled:opacity-60 disabled:cursor-wait uppercase"
                >
                  <Send size={13} />
                  {submitting ? 'Sending...' : 'Send Reset Instructions'}
                </motion.button>
              </form>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  data-testid="forgot-password-back-to-login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#2874F0] hover:underline font-bold transition-colors"
                >
                  <ArrowLeft size={13} />
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
