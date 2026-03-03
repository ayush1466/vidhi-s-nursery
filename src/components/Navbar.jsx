import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Menu, X, Leaf, User, LogOut } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Navbar({ onCartOpen }) {
  const { count } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-forest-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center group-hover:bg-forest-700 transition-colors">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-accent text-xl text-forest-800 leading-none">Vidhi's</span>
              <span className="font-display text-sm text-earth-600 block leading-none tracking-widest uppercase">Nursery</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">Home</Link>
            <Link to="/shop" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">Shop</Link>
            <Link to="/about" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">About</Link>
            <Link to="/contact" className="font-body text-sm text-bark hover:text-forest-700 transition-colors">Contact</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-forest-200 rounded-full px-4 py-1.5 text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 w-48"
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X className="w-4 h-4 text-bark" />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-forest-50 rounded-full transition-colors">
                <Search className="w-5 h-5 text-bark" />
              </button>
            )}

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 hover:bg-forest-50 rounded-full transition-colors"
              >
                <User className="w-5 h-5 text-bark" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-forest-100 w-48 py-2 animate-slide-up">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-forest-50">
                        <p className="text-xs text-gray-400 font-body">Signed in as</p>
                        <p className="text-sm font-body text-bark truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-body text-bark hover:bg-forest-50 transition-colors"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-body text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-body text-bark hover:bg-forest-50 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-body text-forest-600 hover:bg-forest-50 transition-colors font-medium"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2 hover:bg-forest-50 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-bark" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-forest-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-medium animate-fade-in">
                  {count}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-forest-50 rounded-full transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5 text-bark" /> : <Menu className="w-5 h-5 text-bark" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-forest-100 py-4 flex flex-col gap-3 animate-slide-up">
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-2 py-1">Home</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-2 py-1">Shop</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-2 py-1">About</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="font-body text-sm text-bark hover:text-forest-700 px-2 py-1">Contact</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
