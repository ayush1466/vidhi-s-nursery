import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, Leaf, User, LogOut, Home, ShoppingBag, Phone, Info } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Navbar({ onCartOpen }) {
  const { count } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
    setUserMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Mobile: Hamburger + Logo + Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5 text-bark" /> : <Menu className="w-5 h-5 text-bark" />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-1.5 group">
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-forest-600 rounded-full flex items-center justify-center group-hover:bg-forest-700 transition-colors">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <span className="font-accent text-base sm:text-xl text-forest-800 leading-none">Vidhi's</span>
                  <span className="font-display text-[10px] sm:text-sm text-earth-600 block leading-none tracking-widest uppercase">Nursery</span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden sm:flex items-center gap-6 lg:gap-8">
              <Link to="/" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">Home</Link>
              <Link to="/shop" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">Shop</Link>
              <Link to="/about" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">About</Link>
              <Link to="/contact" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">Contact</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search plants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-forest-200 rounded-full px-3 py-1.5 text-xs sm:text-sm font-body bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest-400 w-36 sm:w-48"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}>
                    <X className="w-4 h-4 text-bark" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-bark" />
                </button>
              )}

              {/* User — desktop only */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <User className="w-5 h-5 text-bark" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-forest-100 w-48 py-2 animate-slide-up z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-forest-50">
                          <p className="text-xs text-gray-400 font-body">Signed in as</p>
                          <p className="text-sm font-body text-bark truncate">{user.email}</p>
                        </div>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-body text-bark hover:bg-forest-50 transition-colors">
                          My Orders
                        </Link>
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm font-body text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-body text-bark hover:bg-forest-50 transition-colors">Sign In</Link>
                        <Link to="/register" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-body text-forest-600 hover:bg-forest-50 transition-colors font-medium">Create Account</Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={onCartOpen}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-bark" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-forest-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-body font-medium">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide Menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white py-3 px-4 flex flex-col gap-1 animate-slide-up shadow-lg">
            {user && (
              <div className="px-3 py-2 mb-1 bg-forest-50 rounded-xl">
                <p className="text-xs text-gray-400 font-body">Signed in as</p>
                <p className="text-sm font-body text-bark truncate">{user.email}</p>
              </div>
            )}
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-3 py-2 rounded-xl hover:bg-gray-50">Home</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-3 py-2 rounded-xl hover:bg-gray-50">Shop</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-3 py-2 rounded-xl hover:bg-gray-50">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-3 py-2 rounded-xl hover:bg-gray-50">Contact</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark px-3 py-2 rounded-xl hover:bg-gray-50">My Orders</Link>
                <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="font-body text-sm text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 text-left flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="font-body text-sm text-forest-600 font-medium px-3 py-2 rounded-xl hover:bg-forest-50">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="font-body text-sm text-forest-600 px-3 py-2 rounded-xl hover:bg-forest-50">Create Account</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 h-14">
          <Link to="/" className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/') ? 'text-forest-600' : 'text-gray-400'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-body">Home</span>
          </Link>
          <Link to="/shop" className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/shop') ? 'text-forest-600' : 'text-gray-400'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-body">Shop</span>
          </Link>
          <button onClick={onCartOpen} className="flex flex-col items-center justify-center gap-0.5 text-gray-400 relative">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-forest-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </div>
            <span className="text-[10px] font-body">Cart</span>
          </button>
          <Link to={user ? '/orders' : '/login'} className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/orders') ? 'text-forest-600' : 'text-gray-400'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-body">Orders</span>
          </Link>
          <Link to={user ? '#' : '/login'} onClick={user ? (e) => { e.preventDefault(); setUserMenuOpen(!userMenuOpen) } : undefined} className={`flex flex-col items-center justify-center gap-0.5 ${userMenuOpen ? 'text-forest-600' : 'text-gray-400'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-body">{user ? 'Profile' : 'Login'}</span>
          </Link>
        </div>
      </div>

      {/* Mobile user menu popup */}
      {userMenuOpen && user && (
        <div className="sm:hidden fixed bottom-14 right-3 z-50 bg-white rounded-2xl shadow-xl border border-forest-100 w-48 py-2 animate-slide-up">
          <div className="px-4 py-2 border-b border-forest-50">
            <p className="text-xs text-gray-400 font-body">Signed in as</p>
            <p className="text-sm font-body text-bark truncate">{user.email}</p>
          </div>
          <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-body text-bark hover:bg-forest-50">My Orders</Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm font-body text-red-500 hover:bg-red-50 w-full text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </>
  )
}