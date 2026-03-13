import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { signIn, signInWithGoogle, supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error('Google sign in failed')
      setGoogleLoading(false)
    }
    // on success, Google redirects the browser — no need to navigate manually
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

        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">

          {/* ── Google Sign In ── */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 font-body text-sm text-bark hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="font-body text-xs text-gray-400">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* ── Email/Password form ── */}
          <form onSubmit={handleLogin} className="space-y-4">
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
        </div>

        <p className="font-body text-sm text-center text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-forest-600 hover:text-forest-800 font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}

// ── RegisterPage, ForgotPasswordPage, ResetPasswordPage unchanged below ──

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error('Google sign in failed')
      setGoogleLoading(false)
    }
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

        <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4">

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 font-body text-sm text-bark hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="font-body text-xs text-gray-400">or register with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
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
        </div>

        <p className="font-body text-sm text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-forest-600 hover:text-forest-800 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

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
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-forest-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📬</span>
              </div>
              <h2 className="font-display text-xl text-bark">Check your email!</h2>
              <p className="font-body text-sm text-gray-400 leading-relaxed">
                We sent a password reset link to <strong className="text-bark">{email}</strong>.
              </p>
              <p className="font-body text-xs text-gray-300">
                Didn't receive it?{' '}
                <button onClick={() => setSent(false)} className="text-forest-600 hover:underline">try again</button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Your Email Address</label>
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
          <Link to="/login" className="text-forest-600 hover:text-forest-800 font-medium">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const handleReset = async (e) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
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
              <p className="font-body text-sm text-gray-400">Redirecting you to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full border border-forest-100 rounded-xl px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 bg-cream"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-gray-400 uppercase tracking-wider block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  className={`w-full border rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 bg-cream transition-colors ${
                    confirm && confirm !== password ? 'border-red-300 focus:ring-red-200'
                    : confirm && confirm === password ? 'border-forest-300 focus:ring-forest-200'
                    : 'border-forest-100 focus:ring-forest-300'
                  }`}
                />
                {confirm && confirm !== password && <p className="font-body text-xs text-red-400 mt-1">Passwords do not match</p>}
                {confirm && confirm === password && <p className="font-body text-xs text-forest-600 mt-1">✓ Passwords match</p>}
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