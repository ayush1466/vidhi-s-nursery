import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Leaf, Users,
  LogOut, Menu, X, ChevronRight, Bell, Settings
} from 'lucide-react'
import { useState } from 'react'
import { adminSignOut } from '../adminSupabase'
import { useAdminAuth } from '../AdminAuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/products', icon: Leaf, label: 'Products' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { admin, setAdmin } = useAdminAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      const { error } = await adminSignOut()
      if (error) {
        toast.error('Sign out failed, local session cleared')
      } else {
        toast.success('Signed out')
      }
    } catch (err) {
      console.error('admin signout error:', err)
      toast.error('Sign out failed, local session cleared')
    } finally {
      setAdmin(null)
      navigate('/admin')
      setSigningOut(false)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-forest-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-accent text-forest-300 text-lg leading-none">Vidhi's</p>
            <p className="font-body text-xs text-forest-600 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all group ${
                isActive
                  ? 'bg-forest-600 text-white shadow-lg shadow-forest-900'
                  : 'text-forest-400 hover:bg-forest-800 hover:text-forest-200'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-forest-800 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-forest-700 rounded-full flex items-center justify-center text-forest-300 font-display text-sm">
            {admin?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-xs text-forest-300 truncate">{admin?.email}</p>
            <p className="font-body text-xs text-forest-600">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-forest-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-forest-900 border-r border-forest-800 flex-col fixed h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-forest-900 border-r border-forest-800 flex flex-col animate-slide-up">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-forest-900 border-b border-forest-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-forest-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            className="font-body text-xs text-forest-500 hover:text-forest-300 transition-colors border border-forest-700 px-3 py-1.5 rounded-full"
          >
            View Store ↗
          </a>
          <button className="relative text-forest-400 hover:text-white transition-colors p-2">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
