import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User as UserIcon, UserPlus, AlertCircle,
  CheckCircle, Eye, EyeOff, ArrowRight, Check, X
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
      <div data-testid="register-success-state" className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 bg-[#F8FAFC] select-none">
        <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-sm border border-slate-200 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#10B981] shadow-sm">
            <CheckCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Account Created!</h2>
            <p className="text-slate-450 text-xs font-semibold leading-relaxed mt-2">
              Welcome to Sarathi Store, {fullName}! Redirecting to login page...
            </p>
          </div>
          <Link to="/login" data-testid="register-login-btn" className="w-full py-2.5 bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white text-xs font-bold rounded-sm uppercase tracking-wider block transition-colors shadow-xs">
            Sign In Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div id="createaccount-section" data-page="register" className="min-h-[calc(100vh-130px)] flex bg-[#F8FAFC] py-8 select-none justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-sm border border-slate-200 shadow-md flex overflow-hidden min-h-[580px]">
        {/* LEFT: Perks Panel (Flipkart Blue) */}
        <div className="brand-panel hidden md:flex flex-col w-[38%] bg-[#0F6FFF] text-white p-10 justify-between relative overflow-hidden">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src="/sarathi-logo.jpg"
                alt="Sarathi Logo"
                className="h-10 w-10 object-contain rounded-full border border-white/35 bg-white shadow-md"
              />
              <span className="text-lg font-bold text-white">Sarathi Store</span>
            </Link>

            <div className="space-y-2 pt-4">
              <h2 className="text-2xl font-extrabold leading-snug">Sign Up</h2>
              <p className="text-slate-200 text-xs font-semibold leading-relaxed">
                Enjoy early product sales, priority carrier tracking, and secure checkouts.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            {PERKS.map((perk, i) => (
              <div key={i} className="bg-white/10 rounded-sm p-3 border border-white/5 text-xs font-semibold leading-snug">
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Form Panel */}
        <div className="flex-1 flex flex-col justify-center px-6 py-6 md:px-12">
          {/* Mobile brand header */}
          <div className="md:hidden flex flex-col items-center mb-4">
            <img
              src="/sarathi-logo.jpg"
              alt="Sarathi Logo"
              className="h-10 w-10 object-contain rounded-full border border-slate-200 bg-white mb-1"
            />
            <span className="text-base font-bold text-slate-800">Sarathi Store</span>
          </div>

          <div className="mb-4">
            <h1 className="text-xl font-extrabold text-slate-800">Create Account</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Already registered?{' '}
              <Link to="/login" className="text-[#0F6FFF] hover:underline font-bold">
                Sign in instead
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
                id="register-error-alert"
                data-testid="register-error-msg"
                className="flex items-start gap-2.5 p-3 mb-4 rounded-sm border border-red-200 bg-red-50 text-red-800 text-xs"
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form data-testid="register-form" onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="register-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                <input
                  id="register-name"
                  data-testid="register-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-describedby={errorMsg ? 'register-error-alert' : undefined}
                  placeholder="enter full name"
                  className="w-full pl-9 pr-4 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="register-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 pointer-events-none" />
                <input
                  id="register-email"
                  data-testid="register-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={errorMsg ? 'register-error-alert' : undefined}
                  placeholder="enter email address"
                  className="w-full pl-9 pr-4 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF]"
                />
              </div>
            </div>

            {/* Account Role */}
            <div className="space-y-1">
              <label htmlFor="register-role" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Role</label>
              <div className="relative">
                <select
                  id="register-role"
                  data-testid="register-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  aria-describedby={errorMsg ? 'register-error-alert' : undefined}
                  className="w-full px-3 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 focus:outline-none focus:border-[#0F6FFF] appearance-none cursor-pointer pr-10"
                >
                  <option value="customer">Customer / Buyer</option>
                  <option value="shop_owner">Shop Owner / Seller</option>
                  <option value="delivery_partner">Delivery Partner / Carrier</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="register-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                <input
                  id="register-password"
                  data-testid="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="create password"
                  className="w-full pl-9 pr-9 py-2 border border-slate-350 bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF]"
                />
                <button
                  type="button"
                  data-testid="register-show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password && (
                <div className="space-y-1.5 mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-grow h-1 rounded-sm transition-colors duration-200 ${
                          i <= strength.score ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PASSWORD_RULES.map((rule) => {
                      const passes = rule.test(password)
                      return (
                        <div key={rule.label} className={`flex items-center gap-1 text-[9px] font-bold ${passes ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {passes ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-slate-350" />}
                          {rule.label}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="register-confirm-password" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 pointer-events-none" />
                <input
                  id="register-confirm-password"
                  data-testid="register-confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="re-enter password"
                  className={`w-full pl-9 pr-9 py-2 border bg-white rounded-sm text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F6FFF] ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500 focus:border-red-650' :
                    confirmPassword && password === confirmPassword ? 'border-emerald-500 focus:border-emerald-600' : 'border-slate-350'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              id="register-submit-btn"
              data-testid="register-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#14B8A6] hover:bg-[#e68f00] text-white text-xs font-bold rounded-sm uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus size={13} />
              <span>{submitting ? 'Creating Account...' : 'Register'}</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-4 leading-normal font-semibold">
            By creating an account, you agree to our{' '}
            <span className="text-slate-500 hover:underline cursor-pointer">Terms</span>
            {' '}and{' '}
            <span className="text-slate-500 hover:underline cursor-pointer">Privacy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
