<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, LogOut, LayoutDashboard, LogIn,
  Search, X, Menu, ChevronDown, Package,
  Zap, Sparkles, Store, Truck
} from 'lucide-react'
=======
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, LayoutDashboard, LogIn, Search } from 'lucide-react'
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useSearch } from '../context/SearchContext'

const ANNOUNCEMENT_MSGS = [
  '✦ FREE SHIPPING on orders above ₹999 · Use code NOVA10 for 10% off',
  '✦ New Arrivals: Smart Home Collection now live — explore 50+ products',
  '✦ Limited Time: Up to 40% off on selected Electronics this week only',
]

export const Navbar: React.FC = () => {
<<<<<<< HEAD
  const { user, isAuthenticated, isAdmin, isShopOwner, isDeliveryPartner, logout } = useAuth()
  const { cartCount, setCartDrawerOpen } = useCart()
=======
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const { searchQuery, setSearchQuery } = useSearch()
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [announcementVisible, setAnnouncementVisible] = useState(true)

  const searchRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Announcement rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENT_MSGS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Focus search on open
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserDropdownOpen(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isStaff = isAdmin || isShopOwner || isDeliveryPartner

  const navLinks = isAuthenticated && isStaff
    ? []
    : [
        { label: 'Catalog', href: '/' },
        { label: 'Deals', href: '/?category=deals' },
        ...(isAuthenticated ? [{ label: 'My Orders', href: '/orders' }] : []),
      ]

  return (
<<<<<<< HEAD
    <>
      {/* Announcement Banner */}
      {announcementVisible && (
        <div data-testid="announcement-banner" role="banner" className="announcement-banner relative bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white overflow-hidden shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex-1 text-center text-xs font-semibold tracking-wide animate-fade-in">
              <span key={announcementIdx} data-testid="announcement-text" className="animate-fade-in inline-block text-white-force">
                {ANNOUNCEMENT_MSGS[announcementIdx]}
=======
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
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
              </span>
            </div>
            <button
              data-testid="announcement-close-btn"
              onClick={() => setAnnouncementVisible(false)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors text-white-force"
              aria-label="Close announcement"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav
        data-testid="main-navbar"
        role="navigation"
        aria-label="Main navigation"
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-md shadow-slate-100/10'
            : 'bg-white/70 backdrop-blur-lg border-b border-slate-200/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* LEFT: Logo */}
            <Link to="/" data-testid="navbar-logo" aria-label="Prathazon home" title="Go to homepage" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-25 group-hover:opacity-45 transition-opacity" />
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                  <Zap size={18} className="text-white-force" fill="white" />
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 bg-clip-text text-transparent">
                  Prathazon
                </span>
                <span className="text-[9px] font-bold text-amber-600 tracking-[0.15em] uppercase -mt-0.5">
                  Elite Store
                </span>
              </div>
            </Link>

            {/* CENTER: Nav Links (desktop) */}
            <div data-testid="navbar-links" className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    title={`Go to ${link.label}`}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'text-amber-600 bg-amber-500/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Toggle */}
              {!isStaff && (
                <button
                  data-testid="navbar-search-btn"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-all duration-150"
                  aria-label="Search products"
                  title="Search products"
                >
                  <Search size={18} />
                </button>
              )}

              {/* Admin Button */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/dashboard"
                  data-testid="navbar-admin-link"
                  title="Open Admin Dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 hover:text-amber-700 transition-all duration-150"
                >
                  <LayoutDashboard size={13} />
                  <span>Admin</span>
                </Link>
              )}

              {/* Seller Console Button */}
              {isAuthenticated && isShopOwner && (
                <Link
                  to="/seller/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 hover:text-amber-700 transition-all duration-150"
                >
                  <LayoutDashboard size={13} />
                  <span>Seller Console</span>
                </Link>
              )}

              {/* Carrier Console Button */}
              {isAuthenticated && isDeliveryPartner && (
                <Link
                  to="/delivery/dashboard"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/15 hover:text-amber-700 transition-all duration-150"
                >
                  <LayoutDashboard size={13} />
                  <span>Carrier Console</span>
                </Link>
              )}

              {/* Cart */}
              {!isStaff && (
                <button
                  data-testid="navbar-cart-btn"
                  onClick={() => setCartDrawerOpen(true)}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-all duration-150 group"
                  aria-label={`Shopping cart with ${cartCount} items`}
                  title={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span data-testid="cart-count-badge" aria-label={`${cartCount} items in cart`} className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white-force text-[10px] font-black flex items-center justify-center border-2 border-white shadow-lg animate-scale-in">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Auth / User */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    data-testid="navbar-user-menu-btn"
                    aria-label="User account menu"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100/80 transition-all duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white-force text-xs font-bold shadow-md">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div data-testid="user-dropdown" role="menu" className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden animate-slide-down">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-amber-500/5 to-transparent">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p data-testid="user-email-display" className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                            <Sparkles size={10} />
                            Administrator
                          </span>
                        )}
                        {isShopOwner && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                            <Store size={10} />
                            Certified Seller
                          </span>
                        )}
                        {isDeliveryPartner && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                            <Truck size={10} />
                            Logistics Partner
                          </span>
                        )}
                      </div>

                      <div className="p-2">
                        {!isStaff && (
                          <Link
                            to="/orders"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                          >
                            <Package size={15} className="text-amber-500" />
                            My Orders
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                          >
                            <LayoutDashboard size={15} className="text-amber-500" />
                            Admin Dashboard
                          </Link>
                        )}
                        {isShopOwner && (
                          <Link
                            to="/seller/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                          >
                            <LayoutDashboard size={15} className="text-amber-500" />
                            Seller Console
                          </Link>
                        )}
                        {isDeliveryPartner && (
                          <Link
                            to="/delivery/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                          >
                            <LayoutDashboard size={15} className="text-amber-500" />
                            Carrier Console
                          </Link>
                        )}
                        <button
                          data-testid="logout-btn"
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-all mt-1"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  data-testid="navbar-signin-btn"
                  title="Sign in to your account"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white-force shadow-lg shadow-amber-600/15 hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <LogIn size={15} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                data-testid="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-all duration-150"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                title="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Search Bar (expandable) */}
          {searchOpen && (
            <div data-testid="search-bar-container" className="pb-4 animate-slide-down">
              <form data-testid="search-form" role="search" aria-label="Product search" onSubmit={handleSearch} className="relative">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D1C1A] pointer-events-none z-10"
                />
                <input
                  ref={searchRef}
                  data-testid="search-input"
                  name="searchQuery"
                  type="search"
                  role="searchbox"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, categories..."
                  title="Type your search query"
                  autoComplete="off"
                  className="w-full pl-11 pr-11 py-3 bg-white border-2 border-[#1D1C1A] rounded-xl text-sm text-[#1D1C1A] font-bold placeholder-[#A5A199] focus:outline-none transition-all shadow-[3px_3px_0px_0px_#1D1C1A] focus:shadow-[2px_2px_0px_0px_#1D1C1A] focus:translate-x-[1px] focus:translate-y-[1px]"
                />
                <button
                  type="button"
                  data-testid="search-close-btn"
                  aria-label="Close search"
                  onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 border-2 border-transparent hover:border-[#1D1C1A] rounded-lg text-[#1D1C1A] bg-[#FAF6EE] transition-all"
                >
                  <X size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
<<<<<<< HEAD

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div data-testid="mobile-menu" role="menu" className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-slide-down shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-50 transition-all"
                >
                  <LayoutDashboard size={16} />
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated && isShopOwner && (
                <Link
                  to="/seller/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-50 transition-all"
                >
                  <Store size={16} />
                  Seller Console
                </Link>
              )}
              {isAuthenticated && isDeliveryPartner && (
                <Link
                  to="/delivery/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-50 transition-all"
                >
                  <Truck size={16} />
                  Carrier Console
                </Link>
              )}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white-force"
                >
                  <LogIn size={16} />
                  Sign In to Shop
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
=======
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
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
  )
}
