import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div
      data-page="not-found"
      data-testid="not-found-page"
      className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 py-16 bg-[#FAF6EE]"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center"
      >
        {/* 404 Big Number */}
        <div className="relative mb-8">
          <div
            data-testid="not-found-code"
            className="text-[140px] font-black text-[#1D1C1A] leading-none select-none opacity-[0.06]"
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <Search size={48} className="text-white" />
            </div>
          </div>
        </div>

        <h1
          data-testid="not-found-heading"
          className="text-3xl font-extrabold text-slate-900 mb-3"
        >
          Page Not Found
        </h1>
        <p
          data-testid="not-found-message"
          className="text-slate-500 text-sm leading-relaxed mb-10 font-medium"
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            data-testid="not-found-home-btn"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all"
          >
            <Home size={16} />
            Go Home
          </Link>
          <button
            data-testid="not-found-back-btn"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:border-amber-400 hover:text-amber-600 transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Popular Pages</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: 'Shop All', to: '/' },
              { label: 'My Orders', to: '/orders' },
              { label: 'My Cart', to: '/cart' },
              { label: 'My Wishlist', to: '/wishlist' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`not-found-quicklink-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
