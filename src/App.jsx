import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider, useAdminAuth } from './admin/AdminAuthContext'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import OrdersPage from './pages/OrdersPage'
import AdminLogin from './admin/pages/AdminLogin'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminOrders from './admin/pages/AdminOrders'
import AdminProducts from './admin/pages/AdminProducts'
import AdminCustomers from './admin/pages/AdminCustomers'
import AdminLayout from './admin/components/AdminLayout'

function AdminRoute({ children }) {
  const { admin, loading } = useAdminAuth()
  if (loading) return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return admin ? children : <Navigate to="/admin" replace />
}

function StoreFront() {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function AdminSection() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/dashboard" element={
        <AdminRoute>
          <AdminLayout><AdminDashboard /></AdminLayout>
        </AdminRoute>
      } />
      <Route path="/orders" element={
        <AdminRoute>
          <AdminLayout><AdminOrders /></AdminLayout>
        </AdminRoute>
      } />
      <Route path="/products" element={
        <AdminRoute>
          <AdminLayout><AdminProducts /></AdminLayout>
        </AdminRoute>
      } />
      <Route path="/customers" element={
        <AdminRoute>
          <AdminLayout><AdminCustomers /></AdminLayout>
        </AdminRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminSection />} />
              <Route path="/*" element={<StoreFront />} />
            </Routes>
            <Toaster position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}