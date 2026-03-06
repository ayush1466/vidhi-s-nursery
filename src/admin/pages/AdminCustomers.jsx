import { useEffect, useRef, useState } from 'react'
import { getAllCustomers } from '../adminSupabase'
import { getAdminCache, setAdminCache } from '../adminPageCache'
import { Search, Users, ShoppingBag, Mail } from 'lucide-react'
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-white">Customers</h1>
        <p className="font-body text-sm text-forest-500">{customers.length} registered customers</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-forest-900 border border-forest-700 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
        />
      </div>

      {/* Table */}
      <div className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-forest-800 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-forest-700 mx-auto mb-3" />
            <p className="font-body text-forest-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest-800">
                  {['Customer', 'Joined', 'Orders', 'Total Spent'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-body text-xs text-forest-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => {
                  const orders = customer.orders || []
                  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0)
                  return (
                    <tr key={customer.id} className="border-b border-forest-800/50 hover:bg-forest-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-forest-700 rounded-full flex items-center justify-center font-display text-forest-300 text-sm shrink-0">
                            {customer.full_name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-body text-sm text-white">{customer.full_name || 'Unknown'}</p>
                            <p className="font-body text-xs text-forest-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />{customer.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-body text-xs text-forest-500">
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
        )}
      </div>
    </div>
  )
}
