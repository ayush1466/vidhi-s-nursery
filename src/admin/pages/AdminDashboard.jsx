import { useEffect, useState } from 'react'
import { getDashboardStats } from '../adminSupabase'
import { ShoppingBag, Leaf, Users, TrendingUp, Clock, AlertCircle, ArrowUpRight, IndianRupee } from 'lucide-react'

const STATUS_COLOR = {
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  delivered: 'bg-forest-500/20 text-forest-400 border border-forest-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

// Simple bar chart using divs
function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-16">
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

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  // Generate last 7 days labels
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-IN', { weekday: 'short' })
  })

  // Map orders to last 7 days chart data
  const chartData = last7Days.map((day, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const count = (stats?.recentOrders || []).filter(o =>
      o.created_at?.startsWith(dateStr)
    ).length
    return { label: day, value: count }
  })

  const STAT_CARDS = stats ? [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
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

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-forest-800 rounded-xl w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-28 bg-forest-800 rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-forest-800 rounded-2xl" />
        <div className="h-64 bg-forest-800 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white">Dashboard</h1>
        <p className="font-body text-sm text-forest-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className={`rounded-2xl p-5 border ${bg}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-forest-900`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <ArrowUpRight className="w-3 h-3 text-forest-700" />
            </div>
            <p className="font-display text-2xl text-white">{value}</p>
            <p className="font-body text-xs text-forest-500 mt-0.5">{label}</p>
            <p className="font-body text-xs text-forest-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Orders Chart */}
        <div className="lg:col-span-2 bg-forest-900 border border-forest-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-white">Orders This Week</h2>
              <p className="font-body text-xs text-forest-500 mt-0.5">Last 7 days</p>
            </div>
            <TrendingUp className="w-5 h-5 text-forest-500" />
          </div>
          <MiniChart data={chartData} />
          <div className="flex justify-between mt-2">
            {last7Days.map(d => (
              <span key={d} className="font-body text-xs text-forest-600 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-forest-900 border border-forest-800 rounded-2xl p-5">
          <h2 className="font-display text-white mb-4">Order Status</h2>
          <div className="space-y-3">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
              const count = (stats?.recentOrders || []).filter(o => o.status === status).length
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[status]}`}>
                    {status}
                  </span>
                  <span className="font-display text-white text-sm">{count}</span>
                </div>
              )
            })}
          </div>

          {stats?.pendingOrders > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="font-body text-xs text-yellow-400">
                {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} need attention
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-forest-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-forest-500" />
            <h2 className="font-display text-white">Recent Orders</h2>
          </div>
          <a href="/admin/orders" className="font-body text-xs text-forest-500 hover:text-forest-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-forest-800">
                <th className="text-left px-5 py-3 font-body text-xs text-forest-600 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-5 py-3 font-body text-xs text-forest-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 font-body text-xs text-forest-600 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 font-body text-xs text-forest-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 font-body text-sm text-forest-600">
                    No orders yet
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map(order => (
                  <tr key={order.id} className="border-b border-forest-800/50 hover:bg-forest-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-body text-xs text-forest-400">
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 font-body text-xs text-forest-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5 font-display text-sm text-white">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
