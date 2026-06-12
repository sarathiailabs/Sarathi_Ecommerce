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
        <div data-testid="announcement-banner" role="banner" className="relative bg-[#205dbd] text-white overflow-hidden shadow-xs border-b border-blue-400/25">
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-4">
            <div className="flex-1 text-center text-xs font-medium tracking-wide">
              <span key={announcementIdx} data-testid="announcement-text" className="inline-block text-white">
                {ANNOUNCEMENT_MSGS[announcementIdx]}
              </span>
            </div>
            <button
              data-testid="announcement-close-btn"
              onClick={() => setAnnouncementVisible(false)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors text-white"
              aria-label="Close announcement"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full shadow-md bg-[#2874F0] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* LEFT: Brand Logo */}
            <Link to="/" data-testid="navbar-logo" aria-label="Sarathi home" title="Go to homepage" className="flex items-center gap-2.5 group flex-shrink-0">
              <img
                src="/sarathi-logo.jpg"
                alt="Sarathi Logo"
                className="h-11 w-11 object-contain rounded-full border-2 border-white/30 bg-white"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Sarathi Store
                </span>
                <span className="text-[9px] font-semibold text-[#FF9F00] tracking-wide -mt-0.5 italic">
                  Smart Shopping
                </span>
              </div>
            </Link>

            {/* CENTER: Persistent Search Bar (Flipkart Style) */}
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
                  placeholder="Search for products, brands and more"
                  className="w-full px-4 py-2 pr-10 text-slate-800 text-sm bg-white rounded-sm border-0 focus:outline-none focus:ring-0 shadow-inner"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#2874F0] hover:text-blue-700 transition-colors"
                >
                  <Search size={16} />
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
                  className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm text-xs font-semibold"
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
                  className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm text-xs font-semibold"
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
                  className="hidden sm:flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm text-xs font-semibold"
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
                  className="flex items-center gap-1 text-sm font-semibold hover:text-slate-100 transition-colors"
                >
                  <Heart size={16} className="fill-white/10" />
                  <span className="hidden sm:inline">Wishlist</span>
                </Link>
              )}

              {/* Cart Toggle */}
              {!isStaff && (
                <button
                  data-testid="navbar-cart-btn"
                  onClick={() => setCartDrawerOpen(true)}
                  className="relative flex items-center gap-1.5 text-sm font-semibold hover:text-slate-100 transition-colors"
                  aria-label={`Shopping cart with ${cartCount} items`}
                  title={`Cart (${cartCount} items)`}
                >
                  <ShoppingCart size={16} />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span data-testid="cart-count-badge" aria-label={`${cartCount} items in cart`} className="w-5 h-5 rounded-full bg-[#FF9F00] text-white text-[10px] font-black flex items-center justify-center border border-white shadow-xs">
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
                    className="flex items-center gap-1 hover:text-slate-100 transition-colors text-sm font-semibold py-1"
                  >
                    <span>Account</span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div data-testid="user-dropdown" role="menu" className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-sm shadow-lg border border-slate-200/80 overflow-hidden z-50">
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
                            className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Package size={14} className="text-blue-500" />
                            My Orders
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            data-testid="dropdown-admin-console"
                            className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <LayoutDashboard size={14} className="text-blue-500" />
                            Admin Console
                          </Link>
                        )}
                        {isShopOwner && (
                          <Link
                            to="/seller/dashboard"
                            data-testid="dropdown-seller-console"
                            className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Store size={14} className="text-blue-500" />
                            Seller Console
                          </Link>
                        )}
                        {isDeliveryPartner && (
                          <Link
                            to="/delivery/dashboard"
                            data-testid="dropdown-carrier-console"
                            className="flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Truck size={14} className="text-blue-500" />
                            Carrier Console
                          </Link>
                        )}
                        <button
                          data-testid="logout-btn"
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
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
                  className="px-5 py-1 bg-white text-[#2874F0] hover:bg-slate-50 rounded-sm text-sm font-semibold transition-colors shadow-xs"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                data-testid="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 hover:bg-white/10 rounded transition-colors"
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
                  placeholder="Search for products, brands and more"
                  className="w-full px-3 py-1.5 pr-8 text-slate-800 text-xs bg-white rounded-sm focus:outline-none"
                />
                <button type="submit" className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-[#2874F0]">
                  <Search size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Category Strip below Navbar (Flipkart Style) */}
      {!isStaff && (
        <nav className="w-full bg-white border-b border-slate-200/80 overflow-x-auto shadow-xs select-none" aria-label="Product categories">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-center md:gap-12 gap-6 py-2.5 scrollable-tabs">
            {CATEGORY_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                data-testid={`category-link-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="text-xs font-semibold text-slate-700 hover:text-[#2874F0] transition-colors whitespace-nowrap px-1 py-0.5 tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

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
                  <Package size={16} className="text-blue-500" />
                  My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" data-testid="mobile-admin-console" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                    <LayoutDashboard size={16} className="text-blue-500" />
                    Admin Console
                  </Link>
                )}
                {isShopOwner && (
                  <Link to="/seller/dashboard" data-testid="mobile-seller-console" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                    <Store size={16} className="text-blue-500" />
                    Seller Console
                  </Link>
                )}
                {isDeliveryPartner && (
                  <Link to="/delivery/dashboard" data-testid="mobile-carrier-console" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 border-b border-slate-100">
                    <Truck size={16} className="text-blue-500" />
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
                className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-sm text-sm font-semibold bg-[#2874F0] text-white"
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
