import { useEffect, useRef, useState } from 'react'
import { adminClient as supabase } from '../adminClient'
import { getAdminCache, setAdminCache } from '../adminPageCache'
import { MapPin, Phone, Mail, Package, CheckCircle, Clock, Truck, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateOrderStatus } from '../adminSupabase'

const STATUS = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  processing: { label: 'Processing', icon: RefreshCw, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-forest-500/20 text-forest-400 border-forest-500/30' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
}
const ADMIN_ORDERS_TIMEOUT_MS = 45000

export default function AdminOrders() {
  const cachedOrders = getAdminCache('orders_list')
  const [orders, setOrders] = useState(cachedOrders || [])
  const [loading, setLoading] = useState(!cachedOrders)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const isMountedRef = useRef(true)
  const activeFetchIdRef = useRef(0)

  const fetchOrders = async ({ withLoader = false, silent = false } = {}) => {
    const fetchId = ++activeFetchIdRef.current
    if (withLoader && isMountedRef.current) setLoading(true)

    try {
      const withTimeout = (promise, ms, message) =>
        Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
        ])

      const query = () =>
        supabase
          .from('orders')
          .select(`
            id, status, total_amount, created_at, shipping_address, payment_method, user_id,
            order_items ( id, quantity, price, product_name, product_image )
          `)
          .order('created_at', { ascending: false })

      const isTimeoutError = (err) => String(err?.message || '').toLowerCase().includes('timed out')

      let response
      try {
        response = await withTimeout(query(), ADMIN_ORDERS_TIMEOUT_MS, 'Admin orders request timed out')
      } catch (firstErr) {
        if (!isTimeoutError(firstErr)) throw firstErr
        response = await withTimeout(query(), ADMIN_ORDERS_TIMEOUT_MS, 'Admin orders request timed out')
      }

      const { data, error } = response
      if (error) throw error

      if (!isMountedRef.current || fetchId !== activeFetchIdRef.current) return
      setOrders(data || [])
      setAdminCache('orders_list', data || [])
    } catch (err) {
      console.error('fetch orders error:', err)
      if (!silent) toast.error('Failed to load orders')
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchOrders({ withLoader: true })

    const refreshOnReturn = () => fetchOrders({ silent: true })
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshOnReturn()
    }

    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', handleVisibility)

    let debounce = null
    const channel = supabase
      .channel('admin_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => fetchOrders({ silent: true }), 800)
      })
      .subscribe()
    const poll = setInterval(() => fetchOrders({ silent: true }), 8000)

    return () => {
      isMountedRef.current = false
      if (debounce) clearTimeout(debounce)
      clearInterval(poll)
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStatus = async (orderId, status) => {
    const key = orderId + status
    setUpdating(key)
    try {
      const { data, error } = await updateOrderStatus(orderId, status)
      if (error) throw error

      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, ...data } : o)))
      toast.success(
        status === 'delivered' ? 'Marked as Delivered' :
        status === 'shipped' ? 'Marked as Shipped' :
        status === 'processing' ? 'Marked as Processing' :
        status === 'cancelled' ? 'Order Cancelled' : 'Status updated'
      )
    } catch (err) {
      console.error('update error:', err)
      toast.error('Failed to update: ' + (err?.message || 'Unknown error'))
    } finally {
      setUpdating(null)
      fetchOrders({ silent: true })
    }
  }

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Orders</h1>
          <p className="font-body text-sm text-forest-500">{orders.length} total orders</p>
        </div>
        <button
          onClick={() => fetchOrders({ withLoader: true })}
          className="flex items-center gap-2 text-forest-400 hover:text-white border border-forest-700 hover:border-forest-500 px-4 py-2 rounded-xl font-body text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`font-body text-xs px-4 py-2 rounded-full capitalize transition-all border ${
              filter === key
                ? 'bg-forest-600 text-white border-forest-600'
                : 'border-forest-700 text-forest-400 hover:border-forest-500'
            }`}
          >
            {key} ({count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-forest-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-forest-900 border border-forest-800 rounded-2xl">
          <Package className="w-12 h-12 text-forest-700 mx-auto mb-3" />
          <p className="font-body text-forest-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const addr = order.shipping_address || {}
            const isDelivered = order.status === 'delivered'
            const isCancelled = order.status === 'cancelled'
            const StatusIcon = STATUS[order.status]?.icon || Clock

            return (
              <div key={order.id} className={`bg-forest-900 border rounded-2xl overflow-hidden ${isDelivered ? 'border-forest-800/50 opacity-80' : 'border-forest-700'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-forest-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${STATUS[order.status]?.color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-display text-white text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-body text-xs text-forest-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-white">
                      Rs {Number(order.total_amount).toLocaleString('en-IN')}
                    </span>
                    <span className={`font-body text-xs px-3 py-1 rounded-full capitalize border ${STATUS[order.status]?.color}`}>
                      {STATUS[order.status]?.label}
                    </span>
                  </div>
                </div>

                <div className="p-5 grid md:grid-cols-3 gap-5">
                  <div>
                    <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-3">
                      Items ({order.order_items?.length || 0})
                    </p>
                    <div className="space-y-2">
                      {(order.order_items || []).length === 0 ? (
                        <p className="font-body text-xs text-forest-600">No item details</p>
                      ) : (
                        order.order_items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-forest-800 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-forest-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-xs text-white truncate">{item.product_name || 'Plant'}</p>
                              <p className="font-body text-xs text-forest-500">Qty: {item.quantity} x Rs {item.price}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-3">Delivery Address</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-forest-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-body text-sm text-white font-medium">{addr.name || '-'}</p>
                          <p className="font-body text-xs text-forest-400 leading-relaxed">
                            {addr.address && <span>{addr.address}<br /></span>}
                            {addr.city && addr.state && <span>{addr.city}, {addr.state}<br /></span>}
                            {addr.pincode && <span>PIN: {addr.pincode}</span>}
                          </p>
                        </div>
                      </div>
                      {addr.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-forest-500 shrink-0" />
                          <p className="font-body text-xs text-forest-400">{addr.phone}</p>
                        </div>
                      )}
                      {addr.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-forest-500 shrink-0" />
                          <p className="font-body text-xs text-forest-400">{addr.email}</p>
                        </div>
                      )}
                      {order.payment_method && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-forest-800 px-3 py-1.5 rounded-full">
                          <span className="font-body text-xs text-forest-400 capitalize">
                            {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'upi' ? 'UPI' : 'Card'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-3">Update Status</p>
                    {isDelivered ? (
                      <div className="flex items-center gap-2 bg-forest-800/50 rounded-xl p-3">
                        <CheckCircle className="w-5 h-5 text-forest-400" />
                        <div>
                          <p className="font-body text-sm text-forest-400">Delivered</p>
                          <p className="font-body text-xs text-forest-600">Order completed</p>
                        </div>
                      </div>
                    ) : isCancelled ? (
                      <div className="flex items-center gap-2 bg-red-900/20 rounded-xl p-3">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <p className="font-body text-sm text-red-400">Cancelled</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(order.id, 'processing')}
                            disabled={updating === order.id + 'processing'}
                            className="w-full flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 font-body text-sm px-4 py-2.5 rounded-xl hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-4 h-4 shrink-0" />
                            {updating === order.id + 'processing' ? 'Updating...' : 'Mark as Processing'}
                          </button>
                        )}

                        {(order.status === 'pending' || order.status === 'processing') && (
                          <button
                            onClick={() => updateStatus(order.id, 'shipped')}
                            disabled={updating === order.id + 'shipped'}
                            className="w-full flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 font-body text-sm px-4 py-2.5 rounded-xl hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                          >
                            <Truck className="w-4 h-4 shrink-0" />
                            {updating === order.id + 'shipped' ? 'Updating...' : 'Mark as Shipped'}
                          </button>
                        )}

                        <button
                          onClick={() => updateStatus(order.id, 'delivered')}
                          disabled={updating === order.id + 'delivered'}
                          className="w-full flex items-center gap-2 bg-forest-600 border border-forest-500 text-white font-body text-sm px-4 py-2.5 rounded-xl hover:bg-forest-500 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          {updating === order.id + 'delivered' ? 'Updating...' : 'Mark as Delivered'}
                        </button>

                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          disabled={updating === order.id + 'cancelled'}
                          className="w-full flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 font-body text-sm px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 shrink-0" />
                          {updating === order.id + 'cancelled' ? 'Updating...' : 'Cancel Order'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
