import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User as UserIcon, UserPlus, AlertCircle,
  CheckCircle, Eye, EyeOff, Zap, ArrowRight, Check, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
  if (!pass) return { score: 0, label: '', color: '' }
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  const levels = [
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-orange-500' },
    { label: 'Good', color: 'bg-amber-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ]
  return { score, ...levels[Math.max(0, score - 1)] }
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
]

const PERKS = [
  '🎁 Welcome bonus of ₹200 credits',
  '⚡ Priority customer support',
  '🚚 Free shipping on first 3 orders',
  '🔔 Early access to sales & launches',
]

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [role, setRole] = useState('customer')

  const { register } = useAuth()
  const navigate = useNavigate()

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.')
      return
    }
    if (strength.score < 2) {
      setErrorMsg('Please use a stronger password.')
      return
    }
    setSubmitting(true)
    try {
      await register(email, password, fullName, role)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3500)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Registration failed. Email may already be in use.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 bg-slate-50"
      >
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/15"
          >
            <CheckCircle size={48} className="text-white-force" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Account Created!</h2>
            <p className="text-slate-500 text-sm leading-relaxed font-semibold">
              Welcome to Prathazon, {fullName}! Your account is ready. Redirecting you to sign in...
            </p>
          </div>
          <Link to="/login" className="btn-primary inline-flex text-sm px-7 py-3.5 w-full">
            Sign In Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div data-page="register" className="min-h-[calc(100vh-130px)] flex bg-[#FAF6EE] border-b-3 border-[#1D1C1A]">
      {/* LEFT: Form Panel */}
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
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                data-testid="register-error-msg"
                className="flex items-start gap-3 p-4 mb-5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm shadow-sm"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form data-testid="register-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-name"
                  data-testid="register-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field input-with-icon-left shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="register-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-email"
                  data-testid="register-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field input-with-icon-left shadow-sm"
                />
              </div>
            </div>

            {/* Account Role */}
            <div className="space-y-1.5">
              <label htmlFor="register-role" className="block text-xs font-black text-[#1D1C1A] uppercase tracking-wider">Account Role</label>
              <div className="relative">
                <select
                  id="register-role"
                  data-testid="register-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-[#A5A199] outline-none focus:bg-[#FAF6EE] appearance-none cursor-pointer pr-10 shadow-[2px_2px_0px_0px_#1D1C1A]"
                >
                  <option value="customer">Customer / Buyer</option>
                  <option value="shop_owner">Shop Owner / Seller</option>
                  <option value="delivery_partner">Delivery Partner / Carrier</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1D1C1A] font-bold">
                  ▼
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-password"
                  data-testid="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="input-field input-with-icon-left input-with-icon-right shadow-sm"
                />
                <button
                  type="button"
                  data-testid="register-show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-xs font-extrabold ${
                      strength.score <= 1 ? 'text-red-500' :
                      strength.score === 2 ? 'text-orange-500' :
                      strength.score === 3 ? 'text-amber-500' : 'text-emerald-600'
                    }`}>
                      Password strength: {strength.label}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passes = rule.test(password)
                      return (
                        <div key={rule.label} className={`flex items-center gap-1.5 text-[10px] font-bold ${passes ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {passes ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-300" />}
                          {rule.label}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="register-confirm-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="register-confirm-password"
                  data-testid="register-confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`input-field input-with-icon-left input-with-icon-right shadow-sm ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-600' :
                    confirmPassword && password === confirmPassword ? 'border-emerald-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-bold">
                  <X size={11} />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 font-bold">
                  <Check size={11} />
                  Passwords match
                </p>
              )}
            </div>

            <motion.button
              id="register-submit-btn"
              data-testid="register-submit-btn"
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-4 text-sm disabled:opacity-60 disabled:cursor-wait mt-2"
            >
              <UserPlus size={16} />
              {submitting ? 'Creating Account...' : 'Create Account'}
              {!submitting && <ArrowRight size={15} />}
            </motion.button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-5 leading-normal font-semibold">
            By creating an account, you agree to our{' '}
            <span className="text-slate-500 hover:text-amber-700 cursor-pointer transition-colors font-bold underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-slate-500 hover:text-amber-700 cursor-pointer transition-colors font-bold underline">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>

      {/* RIGHT: Perks Panel */}
      <div className="brand-panel hidden lg:flex flex-col w-[42%] relative overflow-hidden border-l border-slate-200/60 bg-gradient-to-br from-amber-50/40 via-slate-50 to-slate-100">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-amber-600/8 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-center flex-1 px-12">
          <div className="mb-10">
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50 shadow-sm">Join Today</span>
            <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mt-4">
              Get Exclusive<br />
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Member Benefits
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed font-semibold">
              Create your free account and unlock a world of premium shopping privileges.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm"
              >
                <span className="text-xl">{perk.split(' ')[0]}</span>
                <span className="text-sm text-slate-700 font-bold">{perk.slice(perk.indexOf(' ') + 1)}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '50K+', label: 'Members' },
              { value: '4.9★', label: 'App Rating' },
              { value: '₹2Cr+', label: 'Savings' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-3 text-center shadow-sm">
                <div className="text-lg font-extrabold text-amber-600">{stat.value}</div>
                <div className="text-[10px] text-slate-500 font-bold mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
