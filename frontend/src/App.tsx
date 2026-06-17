import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SearchProvider } from './context/SearchContext'

// Components
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { CartDrawer } from './components/CartDrawer'
import { Wishlist } from './components/Wishlist'
import { Returns } from './components/Returns'
import { ProductSearch } from './components/ProductSearch'

// Pages — Core
import { Home } from './pages/Home'
import { ProductDetails } from './pages/ProductDetails'
import { Cart } from './pages/Cart'
import { Orders } from './pages/Orders'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AdminDashboard } from './pages/AdminDashboard'
import { Checkout } from './pages/Checkout'
import { DeliveryDashboard } from './pages/DeliveryDashboard'
import { SellerDashboard } from './pages/SellerDashboard'

// Pages — Phase 1 New
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { OrderDetail } from './pages/OrderDetail'
import { NotFound } from './pages/NotFound'
import { HelpPage } from './pages/HelpPage'
import { ShippingPage } from './pages/ShippingPage'
import { ContactPage } from './pages/ContactPage'

import { scrollToElementWithOffset } from './utils/scroll'

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation()

  // Disable default browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const timer = setTimeout(() => {
        scrollToElementWithOffset(id, 95)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [pathname, search, hash])

  return null
}

const TouchpadNavigation: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Touchscreen swipe detection (left-to-right swipe)
    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX
        const touchEndY = e.changedTouches[0].clientY
        
        const diffX = touchEndX - touchStartX
        const diffY = touchEndY - touchStartY

        // Swipe right (left to right) to go back: diffX must be positive and significant
        if (diffX > 150 && Math.abs(diffY) < 60) {
          navigate(-1)
        }
      }
    }

    // 2. Trackpad / Touchpad horizontal swipe detection (via deltaX)
    let accumX = 0
    let lastWheel = 0

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (now - lastWheel > 300) {
          accumX = 0
        }
        lastWheel = now
        accumX += e.deltaX

        // Swiping right on a trackpad moves the content left (meaning deltaX is negative)
        if (accumX < -120) {
          accumX = 0
          navigate(-1)
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [navigate])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <TouchpadNavigation />
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* ── Public routes ─────────────────────────────── */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/search" element={<ProductSearch />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/404" element={<NotFound />} />

                {/* ── Customer routes ────────────────────────────── */}
                <Route path="/cart" element={
                  <ProtectedRoute><Cart /></ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute><Checkout /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute><Orders /></ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute><OrderDetail /></ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute><Wishlist /></ProtectedRoute>
                } />
                <Route path="/returns" element={
                  <ProtectedRoute><Returns /></ProtectedRoute>
                } />

                {/* ── Delivery Partner routes ────────────────────── */}
                <Route path="/delivery/dashboard" element={
                  <ProtectedRoute><DeliveryDashboard /></ProtectedRoute>
                } />

                {/* ── Shop Owner routes ──────────────────────────── */}
                <Route path="/seller/dashboard" element={
                  <ProtectedRoute><SellerDashboard /></ProtectedRoute>
                } />

                {/* ── Admin routes ───────────────────────────────── */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute><AdminDashboard /></AdminRoute>
                } />

                {/* ── 404 fallback ───────────────────────────────── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
          </div>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
