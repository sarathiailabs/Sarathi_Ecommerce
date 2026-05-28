import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, LayoutDashboard, LogIn, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useSearch } from '../context/SearchContext'

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const { searchQuery, setSearchQuery } = useSearch()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="bg-gradient-to-r from-purple-500 to-indigo-500 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
            N
          </span>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent tracking-tight">
            NovaCart
          </span>
        </Link>

        {/* Categories / Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
          <Link to="/" className="hover:text-purple-400 transition-colors duration-200">Catalog</Link>
          {isAuthenticated && (
            <>
              <Link to="/orders" className="hover:text-purple-400 transition-colors duration-200">My Orders</Link>
            </>
          )}
        </div>

        {/* Search Bar (Desktop) */}
        <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden md:block">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 placeholder:text-slate-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {/* Admin Dashboard button */}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-200 transition-all duration-200"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-200">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-slate-900 shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Section & Authentication button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs text-slate-400 font-medium">Signed in as</span>
                <span className="text-sm font-semibold text-slate-200">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/10 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar (Mobile) */}
      <div className="md:hidden mt-4">
        <div className="relative group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 placeholder:text-slate-500 transition-all duration-300"
          />
        </div>
      </div>
    </nav>
  )
}
