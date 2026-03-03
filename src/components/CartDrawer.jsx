import { X, Plus, Minus, ShoppingBag, Leaf } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, total, count } = useCart()
  const navigate = useNavigate()
  
  const { user } = useAuth()
  const handleCheckout = () => {
  onClose()
  if (!user) {
    navigate('/login')
    return
  }
  navigate('/checkout')
}

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-cream z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-forest-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-forest-700" />
            <h2 className="font-display text-lg text-bark">Your Cart <span className="text-forest-600 text-sm font-body">({count})</span></h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-forest-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-bark" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-forest-50 rounded-full flex items-center justify-center">
                <Leaf className="w-10 h-10 text-forest-300" />
              </div>
              <div>
                <p className="font-display text-bark text-lg">Your cart is empty</p>
                <p className="font-body text-sm text-gray-400 mt-1">Add some green to your life!</p>
              </div>
              <button
                onClick={onClose}
                className="bg-forest-600 text-white font-body text-sm px-6 py-2.5 rounded-full hover:bg-forest-700 transition-colors"
              >
                Browse Plants
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-bark truncate">{item.name}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">{item.category}</p>
                  <p className="font-body text-forest-700 font-medium text-sm mt-1">₹{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1.5 bg-forest-50 rounded-full px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-forest-600 hover:text-forest-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-body text-xs text-bark w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-forest-600 hover:text-forest-800"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-forest-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-body text-bark">Subtotal</span>
              <span className="font-display text-lg text-forest-700">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-xs font-body text-gray-400 text-center">Shipping calculated at checkout</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-forest-600 text-white font-body font-medium py-3.5 rounded-full hover:bg-forest-700 transition-colors shadow-lg shadow-forest-200"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
