import { useEffect, useRef, useState } from 'react'
import { getDashboardStats, updateOrderStatus } from '../adminSupabase'
import { adminClient as supabase } from '../adminClient'
import { getAdminCache, setAdminCache } from '../adminPageCache'
import { ShoppingBag, Leaf, Users, TrendingUp, Clock, AlertCircle, ArrowUpRight, IndianRupee, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLOR = {
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  delivered: 'bg-forest-500/20 text-forest-400 border border-forest-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const STATUS_ACTIONS = {
  pending: ['processing', 'shipped', 'delivered', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
}

const ACTION_LABEL = {
  processing: 'Process',
  shipped: 'Ship',
  delivered: 'Deliver',
  cancelled: 'Cancel',
}

function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 sm:gap-1.5 h-14 sm:h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-forest-600 rounded-sm transition-all duration-500"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
          />
        </div>
      ))}
    </div>
  )
}

/** Mobile card view for a single order */
function OrderCard({ order, updatingOrder, quickUpdateOrder }) {
  const [expanded, setExpanded] = useState(false)
  const actions = STATUS_ACTIONS[order.status] || []
  const isTerminal = order.status === 'delivered' || order.status === 'cancelled'

  return (
    <div className="bg-forest-800/40 border border-forest-800 rounded-xl p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-body text-xs text-forest-400 truncate">
            #{order.id?.slice(0, 8).toUpperCase()}
          </p>
          <p className="font-body text-[11px] text-forest-600 mt-0.5">
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] || ''}`}>
            {order.status}
          </span>
          {!isTerminal && actions.length > 0 && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="text-forest-500 hover:text-white transition-colors"
              aria-label="Toggle actions"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Amount */}
      <p className="font-display text-base text-white">
        Rs {Number(order.total_amount).toLocaleString('en-IN')}
      </p>

      {/* Expandable actions */}
      {expanded && !isTerminal && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-forest-800">
          {actions.map(nextStatus => (
            <button
              key={nextStatus}
              onClick={() => quickUpdateOrder(order.id, nextStatus)}
              disabled={updatingOrder === order.id + nextStatus}
              className={`font-body text-xs px-3 py-1.5 rounded-md disabled:opacity-50 transition-colors ${
                nextStatus === 'cancelled'
                  ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                  : 'bg-forest-600 text-white hover:bg-forest-500'
              }`}
            >
              {updatingOrder === order.id + nextStatus ? 'Updating…' : ACTION_LABEL[nextStatus]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const cachedStats = getAdminCache('dashboard_stats', 15 * 60 * 1000)
  const [stats, setStats] = useState(cachedStats || null)
  const [loading, setLoading] = useState(!cachedStats)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const isMountedRef = useRef(true)
  const activeFetchIdRef = useRef(0)
  const lastSilentFetchRef = useRef(0)

  const patchStatsWithOrderUpdate = (prev, updatedOrder) => {
    if (!prev || !updatedOrder?.id) return prev
    const existing = (prev.recentOrders || []).find(o => o.id === updatedOrder.id)
    if (!existing) return prev

    const oldStatus = existing.status
    const newStatus = updatedOrder.status
    const amount = Number(existing.total_amount ?? updatedOrder.total_amount ?? 0)

    const nextStatusCounts = { ...(prev.statusCounts || {}) }
    if (oldStatus && nextStatusCounts[oldStatus] !== undefined)
      nextStatusCounts[oldStatus] = Math.max(0, nextStatusCounts[oldStatus] - 1)
    if (newStatus && nextStatusCounts[newStatus] !== undefined)
      nextStatusCounts[newStatus] += 1

    const nextPending =
      (prev.pendingOrders || 0) +
      (oldStatus === 'pending' ? -1 : 0) +
      (newStatus === 'pending' ? 1 : 0)

    const nextRevenue =
      (prev.totalRevenue || 0) +
      (oldStatus === 'delivered' ? -amount : 0) +
      (newStatus === 'delivered' ? amount : 0)

    const nextRecentOrders = (prev.recentOrders || []).map(order =>
      order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
    )

    return {
      ...prev,
      pendingOrders: Math.max(0, nextPending),
      totalRevenue: Math.max(0, nextRevenue),
      statusCounts: nextStatusCounts,
      recentOrders: nextRecentOrders,
    }
  }

  const fetchStats = async ({ mode = 'silent' } = {}) => {
    if (mode === 'silent') {
      const now = Date.now()
      if (now - lastSilentFetchRef.current < 1500) return
      lastSilentFetchRef.current = now
    }
    const fetchId = ++activeFetchIdRef.current
    if (mode === 'initial' && isMountedRef.current) setLoading(true)
    if (mode === 'refresh' && isMountedRef.current) setRefreshing(true)

    try {
      const data = await getDashboardStats()
      if (!isMountedRef.current || fetchId !== activeFetchIdRef.current) return
      setStats(data)
      setAdminCache('dashboard_stats', data)
    } catch (err) {
      const isTimeoutError = String(err?.message || '').toLowerCase().includes('timed out')
      if (!(mode === 'silent' && isTimeoutError)) console.error('dashboard fetch error:', err)
      if (mode === 'refresh') toast.error('Failed to load dashboard')
    } finally {
      if (isMountedRef.current) {
        if (mode === 'refresh') setRefreshing(false)
        else setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchStats({ mode: 'initial' })

    const refreshOnReturn = () => fetchStats({ mode: 'silent' })
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshOnReturn()
    }
    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', handleVisibility)

    let debounce = null
    const channel = supabase
      .channel('admin_dashboard_orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => fetchStats({ mode: 'silent' }), 400)
      })
      .subscribe()

    const poll = setInterval(() => {
      if (document.visibilityState === 'visible') fetchStats({ mode: 'silent' })
    }, 8000)

    return () => {
      isMountedRef.current = false
      if (debounce) clearTimeout(debounce)
      clearInterval(poll)
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [])

  const quickUpdateOrder = async (orderId, status) => {
    const key = orderId + status
    setUpdatingOrder(key)
    try {
      const { error } = await updateOrderStatus(orderId, status)
      if (error) throw error
      setStats(prev => {
        const next = patchStatsWithOrderUpdate(prev, { id: orderId, status })
        setAdminCache('dashboard_stats', next)
        return next
      })
      toast.success(
        status === 'delivered' ? 'Marked as Delivered' :
        status === 'shipped' ? 'Marked as Shipped' :
        status === 'processing' ? 'Marked as Processing' :
        status === 'cancelled' ? 'Order Cancelled' : 'Status updated'
      )
      await fetchStats({ mode: 'silent' })
    } catch (err) {
      console.error('quick update failed:', err)
      toast.error('Failed to update status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-IN', { weekday: 'short' })
  })

  const chartData = last7Days.map((day, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = (stats?.recentOrders || []).filter(o => o.created_at?.startsWith(dateStr)).length
    return { label: day, value: count }
  })

  const statusCounts = stats?.statusCounts || {
    pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0,
  }

  const STAT_CARDS = stats ? [
    {
      label: 'Total Revenue',
      value: `Rs ${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-forest-400',
      bg: 'bg-forest-500/10 border-forest-500/20',
      sub: 'From delivered orders',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      sub: `${stats.pendingOrders} pending`,
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: Leaf,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      sub: `${stats.outOfStock} out of stock`,
    },
    {
      label: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-earth-400',
      bg: 'bg-earth-500/10 border-earth-500/20',
      sub: 'Registered users',
    },
  ] : []

  if (loading && !stats) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        <div className="h-8 bg-forest-800 rounded-xl w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 sm:h-28 bg-forest-800 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 h-48 sm:h-64 bg-forest-800 rounded-2xl" />
          <div className="h-48 sm:h-64 bg-forest-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl text-white">Dashboard</h1>
          <p className="font-body text-xs sm:text-sm text-forest-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => fetchStats({ mode: 'refresh' })}
          disabled={refreshing}
          className="self-start xs:self-auto flex items-center gap-2 text-forest-400 hover:text-white border border-forest-700 hover:border-forest-500 px-3 sm:px-4 py-2 rounded-xl font-body text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stat cards — 2-col on mobile, 4-col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className={`rounded-2xl p-3 sm:p-5 border min-w-0 ${bg}`}>
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-forest-900">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-forest-700" />
            </div>
            {/* Shrink large numbers on very small screens */}
            <p className="font-display text-lg sm:text-2xl text-white break-words leading-tight">{value}</p>
            <p className="font-body text-[11px] sm:text-xs text-forest-500 mt-0.5">{label}</p>
            <p className="font-body text-[10px] sm:text-xs text-forest-600 mt-1 hidden xs:block">{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Status row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-forest-900 border border-forest-800 rounded-2xl p-4 sm:p-5 min-w-0">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h2 className="font-display text-white text-sm sm:text-base">Orders This Week</h2>
              <p className="font-body text-[11px] sm:text-xs text-forest-500 mt-0.5">Last 7 days</p>
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-forest-500" />
          </div>
          <MiniChart data={chartData} />
          <div className="flex justify-between mt-2">
            {last7Days.map(d => (
              <span key={d} className="font-body text-[9px] sm:text-xs text-forest-600 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-forest-900 border border-forest-800 rounded-2xl p-4 sm:p-5 min-w-0">
          <h2 className="font-display text-white text-sm sm:text-base mb-3 sm:mb-4">Order Status</h2>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`font-body text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full capitalize ${STATUS_COLOR[status]}`}>
                  {status}
                </span>
                <span className="font-display text-white text-sm">{count}</span>
              </div>
            ))}
          </div>

          {stats?.pendingOrders > 0 && (
            <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" />
              <p className="font-body text-[11px] sm:text-xs text-yellow-400">
                {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} need attention
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden min-w-0">
        {/* Section header */}
        <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-forest-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-500" />
            <h2 className="font-display text-white text-sm sm:text-base">Recent Orders</h2>
          </div>
          <a href="/admin/orders" className="font-body text-xs text-forest-500 hover:text-forest-300 transition-colors whitespace-nowrap">
            View all
          </a>
        </div>

        {!stats?.recentOrders?.length ? (
          <p className="text-center py-8 font-body text-sm text-forest-600">No orders yet</p>
        ) : (
          <>
            {/* Mobile card list (hidden on md+) */}
            <div className="md:hidden p-3 space-y-3">
              {stats.recentOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  updatingOrder={updatingOrder}
                  quickUpdateOrder={quickUpdateOrder}
                />
              ))}
            </div>

            {/* Desktop table (hidden below md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-forest-800">
                    {['Order ID', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-body text-xs text-forest-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-forest-800/50 hover:bg-forest-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-body text-xs text-forest-400">
                        #{order.id?.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 font-body text-xs text-forest-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-display text-sm text-white">
                        Rs {Number(order.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {order.status === 'delivered' || order.status === 'cancelled' ? (
                          <span className="font-body text-xs text-forest-600">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(STATUS_ACTIONS[order.status] || []).map(nextStatus => (
                              <button
                                key={nextStatus}
                                onClick={() => quickUpdateOrder(order.id, nextStatus)}
                                disabled={updatingOrder === order.id + nextStatus}
                                className={`font-body text-xs px-2.5 py-1 rounded-md disabled:opacity-50 transition-colors ${
                                  nextStatus === 'cancelled'
                                    ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                                    : 'bg-forest-600 text-white hover:bg-forest-500'
                                }`}
                              >
                                {updatingOrder === order.id + nextStatus ? 'Updating…' : ACTION_LABEL[nextStatus]}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
