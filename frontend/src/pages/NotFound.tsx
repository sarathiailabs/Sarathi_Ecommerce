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
      className="min-h-[calc(100vh-130px)] flex items-center justify-center px-6 py-16 bg-[#F8FAFC]"
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
            className="text-[140px] font-extrabold text-[#0F6FFF]/10 leading-none select-none"
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-[#0F6FFF] shadow-xs">
              <Search size={32} />
            </div>
          </div>
        </div>

        <h1
          data-testid="not-found-heading"
          className="text-2xl font-extrabold text-slate-800 mb-3 uppercase tracking-tight"
        >
          Page Not Found
        </h1>
        <p
          data-testid="not-found-message"
          className="text-slate-550 text-xs leading-relaxed mb-8 font-semibold"
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            data-testid="not-found-home-btn"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#0F6FFF] text-white font-bold text-xs shadow-xs hover:bg-[#0D5ED9] transition-all"
          >
            <Home size={14} />
            Go Home
          </Link>
          <button
            data-testid="not-found-back-btn"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Popular Pages</p>
          <div className="flex flex-wrap gap-2.5 justify-center">
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
                className="px-4 py-2 rounded-sm bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:border-[#0F6FFF] hover:text-[#0F6FFF] transition-all shadow-xs"
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
