import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Package, MapPin, Phone, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered']
const USER_ORDERS_TIMEOUT_MS = 45000

const STATUS_COLOR = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:    'bg-purple-100 text-purple-700 border-purple-200',
  delivered:  'bg-forest-100 text-forest-700 border-forest-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200',
}

const STATUS_LABEL = {
  pending:    '🕐 Order Placed',
  processing: '⚙️ Processing',
  shipped:    '🚚 Shipped',
  delivered:  '✅ Delivered',
  cancelled:  '❌ Cancelled',
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const isMountedRef = useRef(true)
  const activeFetchIdRef = useRef(0)

  const fetchOrders = async ({ mode = 'silent' } = {}) => {
    if (!user) return
    const fetchId = ++activeFetchIdRef.current
    if (mode === 'initial' && isMountedRef.current) setLoading(true)
    if (mode === 'refresh' && isMountedRef.current) setRefreshing(true)

    try {
      const runQueryWithTimeout = async (ms) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), ms)

        try {
          return await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .abortSignal(controller.signal)
        } catch (err) {
          const isAbortError =
            err?.name === 'AbortError' ||
            String(err?.message || '').toLowerCase().includes('abort')
          if (isAbortError) throw new Error('Orders request timed out')
          throw err
        } finally {
          clearTimeout(timeoutId)
        }
      }

      const isTimeoutError = (err) =>
        String(err?.message || '').toLowerCase().includes('timed out')

      let response
      try {
        response = await runQueryWithTimeout(USER_ORDERS_TIMEOUT_MS)
      } catch (firstErr) {
        if (!isTimeoutError(firstErr)) throw firstErr
        response = await runQueryWithTimeout(USER_ORDERS_TIMEOUT_MS)
      }

      const { data, error } = response
      if (error) throw error

      if (!isMountedRef.current || fetchId !== activeFetchIdRef.current) return
      setOrders(data || [])
    } catch (err) {
      console.error('user orders fetch error:', err)
      if (mode !== 'silent') {
        toast.error('Failed to refresh orders')
      }
    } finally {
      if (mode !== 'refresh' && isMountedRef.current && fetchId === activeFetchIdRef.current) {
        setLoading(false)
      }
      if (mode === 'refresh' && isMountedRef.current) setRefreshing(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true

    // Wait for auth to finish loading before doing anything
    if (authLoading) return

    if (!user) {
      setLoading(false)
      return
    }

    fetchOrders({ mode: 'initial' })

    const refreshOnReturn = () => fetchOrders({ mode: 'silent' })
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshOnReturn()
    }
    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', handleVisibility)

    const channel = supabase
      .channel('user_orders_' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders(prev => [payload.new, ...prev.filter(o => o.id !== payload.new.id)])
            return
          }
          if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
            return
          }
          if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        if (status === 'CHANNEL_ERROR') setRealtimeStatus('error')
        if (status === 'TIMED_OUT') setRealtimeStatus('error')
      })

    return () => {
      isMountedRef.current = false
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [user?.id, authLoading]) // depend on stable user id

  // Show spinner while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-bark mb-4">Please sign in to view orders</p>
          <Link to="/login" className="bg-forest-600 text-white font-body px-6 py-3 rounded-full hover:bg-forest-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-bark">My Orders</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-forest-500 animate-pulse' :
                realtimeStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <span className="font-body text-xs text-gray-400">
                {realtimeStatus === 'connected' ? 'Live updates on' :
                 realtimeStatus === 'error' ? 'Realtime unavailable' : 'Connecting...'}
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchOrders({ mode: 'refresh' })}
            disabled={refreshing}
            className="flex items-center gap-2 text-forest-600 font-body text-sm border border-forest-200 px-4 py-2 rounded-full hover:bg-forest-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-48 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-forest-200 mx-auto mb-4" />
            <p className="font-display text-xl text-bark mb-2">No orders yet</p>
            <p className="font-body text-sm text-gray-400 mb-6">Start growing your plant family!</p>
            <Link to="/shop" className="bg-forest-600 text-white font-body px-6 py-3 rounded-full hover:bg-forest-700 transition-colors">
              Shop Plants
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => {
              const addr = order.shipping_address || {}
              const isCancelled = order.status === 'cancelled'
              const currentStep = STATUS_STEPS.indexOf(order.status)

              return (
                <div key={order.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-forest-50">

                  {/* Order Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-forest-50">
                    <div>
                      <p className="font-display text-bark text-sm">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="font-body text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-forest-700">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                      <span className={`font-body text-xs px-3 py-1 rounded-full border ${STATUS_COLOR[order.status] || ''}`}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">

                    {/* Progress Tracker */}
                    {!isCancelled && (
                      <div className="flex items-start">
                        {STATUS_STEPS.map((step, i) => {
                          const isCompleted = currentStep >= i
                          const isLast = i === STATUS_STEPS.length - 1
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center gap-1 w-full">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body border-2 transition-all duration-500 ${
                                  isCompleted
                                    ? 'bg-forest-600 border-forest-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                  {isCompleted ? '✓' : i + 1}
                                </div>
                                <span className={`font-body text-xs capitalize text-center transition-colors duration-500 ${
                                  isCompleted ? 'text-forest-600' : 'text-gray-300'
                                }`}>
                                  {step}
                                </span>
                              </div>
                              {!isLast && (
                                <div className={`flex-1 h-0.5 mb-5 transition-colors duration-500 ${
                                  currentStep > i ? 'bg-forest-400' : 'bg-gray-100'
                                }`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Cancelled banner */}
                    {isCancelled && (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
                        <p className="font-body text-sm text-red-500">❌ This order was cancelled</p>
                      </div>
                    )}

                    {/* Items */}
                    {order.order_items?.length > 0 && (
                      <div>
                        <p className="font-body text-xs text-gray-400 uppercase tracking-wider mb-2">Items Ordered</p>
                        <div className="space-y-2">
                          {order.order_items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-forest-50 rounded-2xl p-3">
                              {item.product_image && (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-10 h-10 rounded-xl object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-body text-sm text-bark truncate">{item.product_name || 'Plant'}</p>
                                <p className="font-body text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                              </div>
                              <p className="font-display text-sm text-forest-700 shrink-0">
                                ₹{item.quantity * item.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delivery Address */}
                    {addr.address && (
                      <div className="bg-forest-50 rounded-2xl p-4">
                        <p className="font-body text-xs text-forest-600 uppercase tracking-wider mb-2">Delivering to</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-forest-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-body text-sm text-bark font-medium">{addr.name}</p>
                            <p className="font-body text-xs text-bark/60">
                              {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        </div>
                        {addr.phone && (
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="w-4 h-4 text-forest-500" />
                            <p className="font-body text-xs text-bark/60">{addr.phone}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payment method + Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-forest-50">
                      <span className="font-body text-xs text-gray-400">
                        {order.payment_method === 'cod' ? '🏠 Cash on Delivery' :
                         order.payment_method === 'upi' ? '📱 UPI' : '💳 Card'}
                      </span>
                      <span className="font-display text-sm text-forest-700">
                        Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
