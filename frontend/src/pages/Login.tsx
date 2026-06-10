import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Zap, Shield, Star, ArrowRight } from 'lucide-react'
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
    <div data-page="login" data-testid="login-page" className="min-h-[calc(100vh-130px)] flex bg-[#FAF6EE] border-b-3 border-[#1D1C1A]">
      {/* LEFT: Branding Panel */}
      <div className="brand-panel hidden lg:flex flex-col w-[45%] relative overflow-hidden border-r border-slate-100 bg-gradient-to-br from-amber-50/50 via-slate-50 to-slate-100">
        {/* Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl" />
        
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative flex flex-col justify-center flex-1 px-12">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/15">
              <Zap size={20} className="text-white-force" fill="white" />
            </div>
<<<<<<< HEAD
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">Prathazon</span>
=======
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-355">Password</label>
              <Link to="/forgot-password" className="text-xs text-purple-400 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <LogIn size={16} />
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:underline font-semibold">
            Create Account
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
          </Link>

          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            Welcome back to<br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Elite Shopping
            </span>
          </h2>
          <p className="text-slate-500 leading-relaxed mb-10 text-sm font-medium">
            Sign in to access your curated product catalog, track orders, and enjoy personalized recommendations.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm font-bold text-slate-700">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAF6EE]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Zap size={16} className="text-white-force" fill="white" />
            </div>
            <span className="text-lg font-extrabold text-slate-800">Prathazon</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2" data-testid="login-heading">Sign In</h1>
            <p className="text-slate-500 text-sm font-medium">
              New to Prathazon?{' '}
              <Link to="/register" data-testid="login-register-link" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
                Create a free account
              </Link>
            </p>
          </div>

          {/* Error message in pastel style */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                data-testid="login-error-msg"
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 p-4 mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm shadow-sm"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  data-testid="login-email-input"
                  type="email"
                  required
                  autoComplete="email"
                  title="Enter your registered email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field input-with-icon-left shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  data-testid="login-forgot-password-link"
                  className="text-xs text-amber-600 hover:text-amber-700 transition-colors font-bold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  title="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field input-with-icon-left input-with-icon-right shadow-sm"
                />
                <button
                  type="button"
                  data-testid="login-show-password-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me — Checkbox for getByRole('checkbox') practice */}
            <div className="flex items-center gap-2.5 mt-1">
              <input
                id="remember-me"
                name="rememberMe"
                data-testid="login-remember-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer accent-amber-500"
              />
              <label htmlFor="remember-me" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <motion.button
              id="login-submit-btn"
              data-testid="login-submit-btn"
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-4 text-sm disabled:opacity-60 disabled:cursor-wait mt-2"
            >
              <LogIn size={16} />
              {submitting ? 'Signing in...' : 'Sign In'}
              {!submitting && <ArrowRight size={15} />}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200/60" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Demo Access</span>
            <div className="flex-1 h-px bg-slate-200/60" />
          </div>

          {/* Demo credentials as a proper HTML table — for table locator practice */}
          <div data-testid="demo-credentials-section" className="bg-slate-50 rounded-xl p-4 text-xs border border-slate-200/60 shadow-inner">
            <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-3">
              <Shield size={12} className="text-amber-600" />
              Demo Credentials
            </p>
            <table data-testid="demo-credentials-table" className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</th>
                </tr>
              </thead>
              <tbody>
                <tr data-testid="demo-row-customer">
                  <td className="py-1 font-semibold text-slate-600">Customer</td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">customer@novacart.com</span></td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">customer123</span></td>
                </tr>
                <tr data-testid="demo-row-admin">
                  <td className="py-1 font-semibold text-slate-600">Admin</td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin@novacart.com</span></td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin123</span></td>
                </tr>
                <tr data-testid="demo-row-seller">
                  <td className="py-1 font-semibold text-slate-600">Seller</td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">seller@novacart.com</span></td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">seller123</span></td>
                </tr>
                <tr data-testid="demo-row-delivery">
                  <td className="py-1 font-semibold text-slate-600">Delivery</td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">delivery@novacart.com</span></td>
                  <td className="py-1"><span className="text-slate-800 font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">delivery123</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
