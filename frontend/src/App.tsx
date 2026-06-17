import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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

const ScrollToHash = () => {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const timer = setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
      return () => clearTimeout(timer)
    } else if (pathname === '/' || pathname === '/products') {
      const timer = setTimeout(() => {
        const id = pathname === '/products' ? 'products-section' : ''
        if (id) {
          const element = document.getElementById(id)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [pathname, search, hash])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
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
