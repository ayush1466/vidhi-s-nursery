import { useEffect, useState } from 'react'
import { getAllOrders, updateOrderStatus } from '../adminSupabase'
import { Search, Filter, Eye, ChevronDown, X, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLOR = {
  pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  delivered: 'bg-forest-500/20 text-forest-400 border border-forest-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateOrderStatus(order.id, status)
    if (error) toast.error('Failed to update status')
    else {
      toast.success('Order status updated!')
      onStatusUpdate(order.id, status)
      onClose()
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-forest-900 border border-forest-700 rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-forest-800">
          <h2 className="font-display text-white text-lg">
            Order #{order.id?.slice(0, 8).toUpperCase()}
          </h2>
          <button onClick={onClose} className="text-forest-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="bg-forest-800/50 rounded-2xl p-4">
            <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-2">Customer</p>
            <p className="font-body text-sm text-white">{order.profiles?.full_name || 'Guest'}</p>
            <p className="font-body text-xs text-forest-400">{order.profiles?.email || '—'}</p>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-forest-800/50 rounded-2xl p-4">
              <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-2">Shipping Address</p>
              <p className="font-body text-sm text-forest-300">
                {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </p>
              <p className="font-body text-xs text-forest-500 mt-1">{order.shipping_address.phone}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-3">Items</p>
            <div className="space-y-2">
              {(order.order_items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-forest-800/50 rounded-xl p-3">
                  {item.products?.image && (
                    <img src={item.products.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-body text-sm text-white">{item.products?.name || 'Product'}</p>
                    <p className="font-body text-xs text-forest-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-display text-sm text-forest-400">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-forest-800">
            <span className="font-body text-sm text-forest-400">Total Amount</span>
            <span className="font-display text-lg text-white">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
          </div>

          {/* Status Update */}
          <div>
            <p className="font-body text-xs text-forest-500 uppercase tracking-wider mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`font-body text-xs px-3 py-2 rounded-full capitalize transition-all border ${
                    status === s ? STATUS_COLOR[s] : 'border-forest-700 text-forest-500 hover:border-forest-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || status === order.status}
            className="w-full bg-forest-600 text-white font-body py-3 rounded-xl hover:bg-forest-500 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    getAllOrders().then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleStatusUpdate = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-white">Orders</h1>
        <p className="font-body text-sm text-forest-500">{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600" />
          <input
            type="text"
            placeholder="Search by order ID, name, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-forest-900 border border-forest-700 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`font-body text-xs px-3 py-2 rounded-full capitalize transition-all border ${
                statusFilter === s
                  ? s === 'all' ? 'bg-forest-600 text-white border-forest-600' : STATUS_COLOR[s]
                  : 'border-forest-700 text-forest-500 hover:border-forest-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-forest-800 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-forest-700 mx-auto mb-3" />
            <p className="font-body text-forest-500">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest-800">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-body text-xs text-forest-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} className="border-b border-forest-800/50 hover:bg-forest-800/30 transition-colors">
                    <td className="px-5 py-4 font-body text-xs text-forest-400">
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-body text-sm text-white">{order.profiles?.full_name || 'Guest'}</p>
                      <p className="font-body text-xs text-forest-500">{order.profiles?.email || '—'}</p>
                    </td>
                    <td className="px-5 py-4 font-body text-xs text-forest-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 font-body text-xs text-forest-400">
                      {order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-4 font-display text-sm text-white whitespace-nowrap">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-body text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 text-forest-400 hover:text-white transition-colors font-body text-xs border border-forest-700 hover:border-forest-500 px-3 py-1.5 rounded-full"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
