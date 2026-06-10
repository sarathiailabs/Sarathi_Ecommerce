
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SearchProvider } from './context/SearchContext'

// Components
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { AIAssistant } from './components/AIAssistant'
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
<<<<<<< HEAD
import { DeliveryDashboard } from './pages/DeliveryDashboard'
import { SellerDashboard } from './pages/SellerDashboard'

// Pages — Phase 1 New
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { OrderDetail } from './pages/OrderDetail'
import { NotFound } from './pages/NotFound'
=======
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* ── Public routes ─────────────────────────────── */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/search" element={<ProductSearch />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
<<<<<<< HEAD
                <Route path="/404" element={<NotFound />} />
=======
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729

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
<<<<<<< HEAD

            <Footer />
            <AIAssistant />
            <CartDrawer />
=======
            
            {/* Footer */}
            <Footer />
>>>>>>> 3fb1eaec9d7fbe035b485f07fc838529eccd6729
          </div>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
