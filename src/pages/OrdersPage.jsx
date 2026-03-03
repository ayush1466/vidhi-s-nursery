import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserOrders } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'

const STATUS_COLOR = {
  pending: 'bg-earth-100 text-earth-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getUserOrders(user.id).then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user])

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
        <h1 className="font-display text-3xl text-bark mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-24 animate-pulse" />
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
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display text-bark text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="font-body text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <span className={`font-body text-xs px-3 py-1 rounded-full capitalize ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {(order.order_items || []).slice(0, 4).map((item, i) => (
                      <img
                        key={i}
                        src={item.products?.image || ''}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                      />
                    ))}
                    {(order.order_items || []).length > 4 && (
                      <div className="w-10 h-10 rounded-full bg-forest-100 border-2 border-white flex items-center justify-center">
                        <span className="font-body text-xs text-forest-600">+{order.order_items.length - 4}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-forest-700">₹{order.total_amount.toFixed(2)}</p>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
