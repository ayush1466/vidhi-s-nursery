import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff, Shield } from 'lucide-react'
import { adminSignIn } from '../adminSupabase'
import { checkIsAdmin } from '../adminSupabase'
import { useAdminAuth } from '../AdminAuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAdmin } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await adminSignIn(email, password)
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
      toast.error('Access denied. You are not an admin.')
      setLoading(false)
      return
    }
    setAdmin(data.user)
    toast.success('Welcome to Admin Dashboard! 🌿')
    navigate('/admin/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, #22c55e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #15803d 0%, transparent 50%)`
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-forest-900">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl text-white">Vidhi's Nursery</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-forest-400" />
            <p className="font-body text-sm text-forest-400">Admin Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-forest-900 border border-forest-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="font-display text-xl text-white mb-6">Sign in to Dashboard</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-body text-xs text-forest-400 uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vidhinursery.in"
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-colors"
              />
            </div>

            <div>
              <label className="font-body text-xs text-forest-400 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-3 pr-11 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-500 hover:text-forest-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 text-white font-body font-medium py-3.5 rounded-xl hover:bg-forest-500 transition-colors disabled:opacity-60 mt-2 shadow-lg shadow-forest-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-forest-800/50 rounded-2xl border border-forest-700/50">
            <p className="font-body text-xs text-forest-500 text-center">
              🔒 Restricted to authorized administrators only
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="font-body text-xs text-forest-600 hover:text-forest-400 transition-colors">
            ← Back to Store
          </a>
        </p>
      </div>
    </div>
  )
}
