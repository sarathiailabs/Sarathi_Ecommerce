import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Shield, Star, Zap, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: <Shield size={16} />, text: 'Bank-grade security on all transactions' },
  { icon: <Star size={16} />, text: 'Access exclusive member-only deals' },
  { icon: <Zap size={16} />, text: 'Lightning-fast checkout experience' },
]

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  const [rememberMe, setRememberMe] = useState(false)

  return (
    <div data-page="login" data-testid="login-page" className="min-h-[calc(100vh-130px)] flex bg-[#F8FAFC] py-12 select-none justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-sm border border-slate-200 shadow-md flex overflow-hidden min-h-[500px]">
        {/* LEFT: Branding Panel (Blue Flipkart-like side panel) */}
        <div className="brand-panel hidden md:flex flex-col w-[40%] bg-[#0F6FFF] text-white p-10 justify-between relative overflow-hidden">
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
              <h2 className="text-2xl font-extrabold leading-snug">Login</h2>
              <p className="text-slate-200 text-xs font-semibold leading-relaxed">
                Get access to your Orders, Wishlist and Recommendations.
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

          <div className="mb-6">
            <h1 className="text-xl font-extrabold text-slate-800" data-testid="login-heading">Sign In</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              New to Sarathi Store?{' '}
              <Link to="/register" data-testid="login-register-link" className="text-[#0F6FFF] hover:underline">
                Create a free account
              </Link>
            </p>
          </div>

          {/* Alert Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                id="login-error-alert"
                data-testid="login-error-msg"
                role="alert"
                className="flex items-start gap-2.5 p-3 mb-4 rounded-sm border border-red-200 bg-red-50 text-red-800 text-xs"
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="login-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  data-testid="login-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={errorMsg ? 'login-error-alert' : undefined}
                  placeholder="enter email address"
                  className="w-full pl-9 pr-4 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  data-testid="login-forgot-password-link"
                  className="text-[10px] text-[#0F6FFF] hover:underline font-bold"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={errorMsg ? 'login-error-alert' : undefined}
                  placeholder="enter password"
                  className="w-full pl-9 pr-9 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF]"
                />
                <button
                  type="button"
                  data-testid="login-show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 mt-1">
              <input
                id="remember-me"
                name="rememberMe"
                data-testid="login-remember-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 text-[#0F6FFF] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-[11px] font-semibold text-slate-500 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button
              id="login-submit-btn"
              data-testid="login-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#14B8A6] hover:bg-[#e68f00] text-white text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <LogIn size={13} />
              <span>{submitting ? 'Signing in...' : 'Login'}</span>
            </button>
          </form>

          {/* Demo access divider */}
          <div className="flex items-center gap-2 my-4">
            <div className="flex-grow h-px bg-slate-100" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Demo Credentials</span>
            <div className="flex-grow h-px bg-slate-100" />
          </div>

          {/* Demo credentials table */}
          <div data-testid="demo-credentials-section" className="bg-slate-50 border border-slate-200/60 p-3 rounded-sm text-[10px]">
            <table data-testid="demo-credentials-table" className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-1 text-[9px] font-bold text-slate-400 uppercase">Role</th>
                  <th className="pb-1 text-[9px] font-bold text-slate-400 uppercase">Email</th>
                  <th className="pb-1 text-[9px] font-bold text-slate-400 uppercase">Password</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-slate-600">
                <tr data-testid="demo-row-customer" className="border-b border-slate-100/30">
                  <td className="py-1">Customer</td>
                  <td className="py-1 select-all">customer@novacart.com</td>
                  <td className="py-1 select-all">customer123</td>
                </tr>
                <tr data-testid="demo-row-admin" className="border-b border-slate-100/30">
                  <td className="py-1">Admin</td>
                  <td className="py-1 select-all">admin@novacart.com</td>
                  <td className="py-1 select-all">admin123</td>
                </tr>
                <tr data-testid="demo-row-seller" className="border-b border-slate-100/30">
                  <td className="py-1">Seller</td>
                  <td className="py-1 select-all">seller@novacart.com</td>
                  <td className="py-1 select-all">seller123</td>
                </tr>
                <tr data-testid="demo-row-delivery">
                  <td className="py-1">Carrier</td>
                  <td className="py-1 select-all">delivery@novacart.com</td>
                  <td className="py-1 select-all">delivery123</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
