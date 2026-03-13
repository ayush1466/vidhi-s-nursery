import { useEffect, useRef, useState } from 'react'
import { getAllCustomers } from '../adminSupabase'
import { getAdminCache, setAdminCache } from '../adminPageCache'
import { Search, Users, ShoppingBag, Mail, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCustomers() {
  const cachedCustomers = getAdminCache('customers_list')
  const [customers, setCustomers] = useState(cachedCustomers || [])
  const [loading, setLoading] = useState(!cachedCustomers)
  const [search, setSearch] = useState('')
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const load = async ({ silent = false } = {}) => {
      if (!silent && isMountedRef.current) setLoading(true)
      const { data, error } = await getAllCustomers()
      if (!isMountedRef.current) return
      if (error) {
        console.error('customers fetch error:', error)
        if (!silent) toast.error('Failed to load customers')
      }
      setCustomers(data || [])
      setAdminCache('customers_list', data || [])
      if (isMountedRef.current) setLoading(false)
    }

    load()

    const refreshOnReturn = () => load({ silent: true })
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshOnReturn()
    }
    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', handleVisibility)
    const poll = setInterval(() => load({ silent: true }), 12000)

    return () => {
      isMountedRef.current = false
      clearInterval(poll)
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const filtered = customers.filter(c =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  // Summary stats
  const totalOrders = customers.reduce((s, c) => s + (c.orders?.length || 0), 0)
  const totalRevenue = customers.reduce((s, c) =>
    s + (c.orders || []).reduce((os, o) => os + (o.total_amount || 0), 0), 0)

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl text-white">Customers</h1>
          <p className="font-body text-xs sm:text-sm text-forest-500">
            {customers.length} registered customers
          </p>
        </div>
      </div>

      {/* Summary cards — 3 cols, compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Total', value: customers.length, sub: 'customers' },
          { label: 'Orders', value: totalOrders, sub: 'placed' },
          { label: 'Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}k`, sub: 'total spent' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-forest-900 border border-forest-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <p className="font-body text-[10px] sm:text-xs text-forest-500 uppercase tracking-wider">{label}</p>
            <p className="font-display text-lg sm:text-2xl text-white mt-0.5">{value}</p>
            <p className="font-body text-[10px] sm:text-xs text-forest-600">{sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600" />
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forest-900 border border-forest-700 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
        />
      </div>

      {/* Table / Cards */}
      <div className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-4 sm:p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-forest-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-forest-700 mx-auto mb-3" />
            <p className="font-body text-sm text-forest-500">No customers found</p>
          </div>
        ) : (
          <>
            {/* ── Mobile card list ── */}
            <div className="sm:hidden divide-y divide-forest-800/50">
              {filtered.map(customer => {
                const orders = customer.orders || []
                const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
                const initials =
                  customer.full_name?.[0]?.toUpperCase() ||
                  customer.email?.[0]?.toUpperCase() ||
                  '?'

                return (
                  <div key={customer.id} className="flex items-center gap-3 px-4 py-3.5">
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center font-display text-forest-300 text-sm shrink-0">
                      {initials}
                    </div>

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white truncate">
                        {customer.full_name || 'Unknown'}
                      </p>
                      <p className="font-body text-xs text-forest-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        {customer.email || '—'}
                      </p>
                    </div>

                    {/* Right stats */}
                    <div className="shrink-0 text-right">
                      <p className="font-display text-sm text-forest-400">
                        {totalSpent > 0 ? `₹${totalSpent.toLocaleString('en-IN')}` : '—'}
                      </p>
                      <p className="font-body text-[11px] text-forest-600 flex items-center justify-end gap-0.5 mt-0.5">
                        <ShoppingBag className="w-3 h-3" />
                        {orders.length}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forest-800">
                    {['Customer', 'Joined', 'Orders', 'Total Spent'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3.5 font-body text-xs text-forest-600 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(customer => {
                    const orders = customer.orders || []
                    const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-forest-800/50 hover:bg-forest-800/30 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center font-display text-forest-300 text-sm shrink-0">
                              {customer.full_name?.[0]?.toUpperCase() ||
                                customer.email?.[0]?.toUpperCase() ||
                                '?'}
                            </div>
                            <div>
                              <p className="font-body text-sm text-white">
                                {customer.full_name || 'Unknown'}
                              </p>
                              <p className="font-body text-xs text-forest-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-body text-xs text-forest-500">
                          {customer.created_at
                            ? new Date(customer.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-forest-500" />
                            <span className="font-body text-sm text-white">{orders.length}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-display text-sm text-forest-400">
                          {totalSpent > 0 ? `₹${totalSpent.toLocaleString('en-IN')}` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="font-body text-xs text-forest-600 text-right px-1">
          Showing {filtered.length} of {customers.length} customers
        </p>
      )}
    </div>
  )
}