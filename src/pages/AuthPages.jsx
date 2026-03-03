import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { signIn, supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back! 🌿')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl text-bark">Welcome Back</h1>
          <p className="font-body text-sm text-gray-400 mt-1">Sign in to your Vidhi's Nursery account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
          <div>
            <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-forest-100 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-body text-xs text-gray-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="font-body text-xs text-forest-600 hover:text-forest-800">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-forest-100 rounded-xl px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 text-white font-body font-medium py-3.5 rounded-full hover:bg-forest-700 transition-colors disabled:opacity-70 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="font-body text-sm text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-forest-600 hover:text-forest-800 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { signUp } = await import('../lib/supabase')
    const { error } = await signUp(email, password, name)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Please check your email to verify. 🌿')
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl text-bark">Join Our Garden 🌿</h1>
          <p className="font-body text-sm text-gray-400 mt-1">Create your Vidhi's Nursery account</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
          {[
            { label: 'Full Name', type: 'text', value: name, setter: setName, placeholder: 'Vidhi Patel' },
            { label: 'Email', type: 'email', value: email, setter: setEmail, placeholder: 'you@example.com' },
            { label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: '8+ characters' },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">{label}</label>
              <input
                type={type}
                required
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-forest-100 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
              />
            </div>
          ))}

          <p className="font-body text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-forest-600">Terms of Service</a> and{' '}
            <a href="#" className="text-forest-600">Privacy Policy</a>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-forest-600 text-white font-body font-medium py-3.5 rounded-full hover:bg-forest-700 transition-colors disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="font-body text-sm text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-600 hover:text-forest-800 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

// ─── Forgot Password Page ───────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl text-bark">Forgot Password?</h1>
          <p className="font-body text-sm text-gray-400 mt-1">No worries, we'll send you a reset link</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {sent ? (
            // Success state
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📬</span>
              </div>
              <h2 className="font-display text-xl text-bark">Check your email!</h2>
              <p className="font-body text-sm text-gray-400 leading-relaxed">
                We sent a password reset link to <strong className="text-bark">{email}</strong>.
                Check your inbox and click the link to reset your password.
              </p>
              <p className="font-body text-xs text-gray-300">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-forest-600 hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            // Form state
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-forest-100 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest-600 text-white font-body font-medium py-3.5 rounded-full hover:bg-forest-700 transition-colors disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="font-body text-sm text-center text-gray-400 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-forest-600 hover:text-forest-800 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

// ─── Reset Password Page ────────────────────────────────────────────────────
export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleReset = async (e) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
    } else {
      setDone(true)
      toast.success('Password updated successfully! 🌿')
      setTimeout(() => navigate('/login'), 2500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl text-bark">Set New Password</h1>
          <p className="font-body text-sm text-gray-400 mt-1">Choose a strong new password</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="font-display text-xl text-bark">Password Updated!</h2>
              <p className="font-body text-sm text-gray-400">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-forest-100 rounded-xl px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= i * 3
                            ? password.length >= 10 ? 'bg-forest-500'
                              : password.length >= 6 ? 'bg-earth-400'
                              : 'bg-red-400'
                            : 'bg-gray-100'
                        }`}
                      />
                    ))}
                    <span className="font-body text-xs text-gray-400 ml-1">
                      {password.length < 6 ? 'Weak' : password.length < 10 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 bg-cream transition-colors ${
                    confirm && confirm !== password
                      ? 'border-red-300 focus:ring-red-200'
                      : confirm && confirm === password
                      ? 'border-forest-300 focus:ring-forest-200'
                      : 'border-forest-100 focus:ring-forest-300'
                  }`}
                />
                {confirm && confirm !== password && (
                  <p className="font-body text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
                {confirm && confirm === password && (
                  <p className="font-body text-xs text-forest-600 mt-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 8}
                className="w-full bg-forest-600 text-white font-body font-medium py-3.5 rounded-full hover:bg-forest-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}