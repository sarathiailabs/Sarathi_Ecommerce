import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, LogOut, LayoutDashboard, LogIn,
  Search, X, Menu, ChevronDown, Package,
  Heart, Sparkles, Store, Truck, ShoppingBag
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const ANNOUNCEMENT_MSGS = [
  '✦ FREE SHIPPING on orders above ₹999 · Use code SARATHI10 for 10% off',
  '✦ New Arrivals: Smart Home Collection now live — explore 50+ products',
  '✦ Limited Time: Up to 40% off on selected Electronics this week only',
]

const CATEGORY_ITEMS = [
  { label: 'Electronics', href: '/?category=Electronics' },
  { label: 'Fashion', href: '/?category=Fashion' },
  { label: 'Home & Kitchen', href: '/?category=Home%20%26%20Kitchen' },
  { label: 'Sports & Fitness', href: '/?category=Sports%20%26%20Fitness' },
  { label: 'Beauty', href: '/?category=Beauty' },
  { label: 'Books', href: '/?category=Books' },
  { label: 'Deals', href: '/?category=deals' },
]

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isShopOwner, isDeliveryPartner, logout } = useAuth()
  const { cartCount, setCartDrawerOpen } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [announcementIdx, setAnnouncementIdx] = useState(0)
  const [announcementVisible, setAnnouncementVisible] = useState(true)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Announcement rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % ANNOUNCEMENT_MSGS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [location.pathname])

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
      setSearchQuery('')
    }
  }

  const isStaff = isAdmin || isShopOwner || isDeliveryPartner

  return (
    <>
      {/* Announcement Banner */}
      {announcementVisible && (
        <div data-testid="announcement-banner" role="banner" className="relative bg-slate-900 text-slate-100 overflow-hidden shadow-xs border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
            <div className="flex-1 text-center text-xs font-medium tracking-wide">
              <span key={announcementIdx} data-testid="announcement-text" className="inline-block text-slate-200">
                {ANNOUNCEMENT_MSGS[announcementIdx]}
              </span>
            </div>
            <button
              data-testid="announcement-close-btn"
              onClick={() => setAnnouncementVisible(false)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              aria-label="Close announcement"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="w-full border border-slate-200/80 bg-white/85 backdrop-blur-md text-slate-800 shadow-md rounded-2xl">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 gap-4">

              {/* LEFT: Brand Logo */}
              <Link to="/" data-testid="navbar-logo" aria-label="Sarathi home" title="Go to homepage" className="flex items-center gap-2.5 group flex-shrink-0">
                <img
                  src="/sarathi-logo.jpg"
                  alt="Sarathi Logo"
                  className="h-11 w-11 object-contain rounded-full border-2 border-slate-100 shadow-sm bg-white"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-primary-500 transition-colors">
                    Sarathi Store
                  </span>
                  <span className="text-[9px] font-bold text-[#14B8A6] tracking-wider -mt-0.5 uppercase">
                    Smart Shopping
                  </span>
                </div>
              </Link>

              {/* CENTER: Persistent Search Bar (Stripe Style) */}
              {!isStaff && (
                <form 
                  data-testid="search-form" 
                  role="search" 
                  aria-label="Product search" 
                  onSubmit={handleSearch} 
                  className="flex-1 max-w-xl relative hidden md:block"
                >
                  <input
                    data-testid="search-input"
                    name="searchQuery"
                    type="text"
                    role="searchbox"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands and more..."
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none placeholder-slate-400 focus:border-[#0F6FFF] focus:bg-white focus:ring-4 focus:ring-[#0F6FFF]/10 transition-all shadow-xs"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-slate-400 hover:text-[#0F6FFF] transition-colors"
                  >
                    <Search size={15} />
                  </button>
                </form>
              )}

              {/* RIGHT: Actions */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Admin Button */}
                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    data-testid="navbar-admin-link"
                    title="Open Admin Dashboard"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all"
                  >
                    <LayoutDashboard size={12} />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Seller Console Button */}
                {isAuthenticated && isShopOwner && (
                  <Link
                    to="/seller/dashboard"
                    data-testid="navbar-seller-link"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all"
                  >
                    <LayoutDashboard size={12} />
                    <span>Seller</span>
                  </Link>
                )}

                {/* Carrier Console Button */}
                {isAuthenticated && isDeliveryPartner && (
                  <Link
                    to="/delivery/dashboard"
                    data-testid="navbar-carrier-link"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all"
                  >
                    <LayoutDashboard size={12} />
                    <span>Carrier</span>
                  </Link>
                )}

                {/* Wishlist Link */}
                {!isStaff && isAuthenticated && (
                  <Link
                    to="/wishlist"
                    data-testid="navbar-wishlist-link"
                    aria-label="Wishlist"
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0F6FFF] transition-colors"
                  >
                    <Heart size={15} className="text-slate-400 group-hover:text-red-500" />
                    <span className="hidden sm:inline">Wishlist</span>
                  </Link>
                )}

                {/* Cart Toggle */}
                {!isStaff && (
                  <button
                    data-testid="navbar-cart-btn"
                    onClick={() => setCartDrawerOpen(true)}
                    className="relative flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0F6FFF] transition-colors"
                    aria-label={`Shopping cart with ${cartCount} items`}
                    title={`Cart (${cartCount} items)`}
                  >
                    <ShoppingCart size={15} />
                    <span className="hidden sm:inline">Cart</span>
                    {cartCount > 0 && (
                      <span data-testid="cart-count-badge" aria-label={`${cartCount} items in cart`} className="w-5 h-5 rounded-full bg-[#14B8A6] text-white text-[9px] font-black flex items-center justify-center border border-white shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Auth Dropdown */}
                {isAuthenticated ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      data-testid="navbar-user-menu-btn"
                      aria-label="User account menu"
                      aria-expanded={userDropdownOpen}
                      aria-haspopup="true"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-1 text-slate-600 hover:text-[#0F6FFF] transition-colors text-xs font-bold py-1"
                    >
                      <span>Account</span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {userDropdownOpen && (
                      <div data-testid="user-dropdown" role="menu" className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-lg border border-slate-200/80 overflow-hidden z-50 animate-in fade-in duration-150">
                        {/* User Info */}
                        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                          <p className="text-[10px] text-slate-400 font-medium">Logged in as</p>
                          <p data-testid="user-email-display" className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                        </div>

                        <div className="p-1">
                          {!isStaff && (
                            <Link
                              to="/orders"
                              data-testid="dropdown-my-orders"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Package size={14} className="text-slate-400" />
                              My Orders
                            </Link>
                          )}
                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              data-testid="dropdown-admin-console"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <LayoutDashboard size={14} className="text-slate-400" />
                              Admin Console
                            </Link>
                          )}
                          {isShopOwner && (
                            <Link
                              to="/seller/dashboard"
                              data-testid="dropdown-seller-console"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Store size={14} className="text-slate-400" />
                              Seller Console
                            </Link>
                          )}
                          {isDeliveryPartner && (
                            <Link
                              to="/delivery/dashboard"
                              data-testid="dropdown-carrier-console"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Truck size={14} className="text-slate-400" />
                              Carrier Console
                            </Link>
                          )}
                          <button
                            data-testid="logout-btn"
                            role="menuitem"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
                          >
                            <LogOut size={14} />
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
                    className="px-4 py-2 bg-[#0F6FFF] text-white hover:bg-[#0D5ED9] rounded-lg text-xs font-bold transition-all shadow-sm uppercase tracking-wider"
                  >
                    Login
                  </Link>
                )}

                {/* Mobile Menu Button */}
                <button
                  data-testid="mobile-menu-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Search bar inside header on mobile/tablet */}
            {!isStaff && (
              <div className="pb-3 md:hidden">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands and more..."
                    className="w-full px-3 py-2 pr-8 text-slate-800 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:border-[#0F6FFF] transition-all"
                  />
                  <button type="submit" className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-slate-400">
                    <Search size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div data-testid="mobile-menu" role="menu" className="md:hidden border-t border-slate-200 bg-white text-slate-800 shadow-md">
          <div className="px-4 py-3 space-y-1">
            {CATEGORY_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                data-testid={`mobile-category-link-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="block py-2.5 border-b border-slate-100 text-sm font-semibold text-slate-700"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link to="/orders" data-testid="mobile-my-orders" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                  <Package size={16} className="text-slate-400" />
                  My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" data-testid="mobile-admin-console" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                    <LayoutDashboard size={16} className="text-slate-400" />
                    Admin Console
                  </Link>
                )}
                {isShopOwner && (
                  <Link to="/seller/dashboard" data-testid="mobile-seller-console" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                    <Store size={16} className="text-slate-400" />
                    Seller Console
                  </Link>
                )}
                {isDeliveryPartner && (
                  <Link to="/delivery/dashboard" data-testid="mobile-carrier-console" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                    <Truck size={16} className="text-slate-400" />
                    Carrier Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  data-testid="mobile-logout-btn"
                  className="w-full flex items-center gap-2 py-2.5 text-sm font-semibold text-red-500 text-left"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                data-testid="mobile-login-btn"
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-lg text-sm font-semibold bg-[#0F6FFF] hover:bg-[#0D5ED9] text-white"
              >
                <LogIn size={16} />
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
