import { Star, ShoppingCart, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wished, setWished] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to add items to cart', {
        style: { background: '#1c1917', color: '#fff', fontFamily: 'DM Sans' },
        icon: '🔒',
      })
      navigate('/login')
      return
    }
    setAdding(true)
    addItem(product)
    toast.success(`${product.name} added to cart! 🌿`, {
      style: { background: '#166534', color: '#fff', fontFamily: 'DM Sans' },
      iconTheme: { primary: '#4ade80', secondary: '#fff' },
    })
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col border border-gray-100"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-forest-50" style={{ aspectRatio: '1/1' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className="absolute top-2 left-2 bg-forest-600 text-white text-[10px] font-body px-2 py-0.5 rounded-full leading-tight">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setWished(!wished) }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${wished ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-400'}`}
        >
          <Heart className="w-3.5 h-3.5" fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        <p className="text-[10px] font-body text-forest-600 uppercase tracking-wider mb-0.5 truncate">{product.category}</p>
        <h3 className="font-display text-bark text-xs sm:text-sm leading-snug mb-1.5 line-clamp-2 flex-1">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 ${i < Math.floor(product.rating) ? 'text-earth-400 fill-earth-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-body text-gray-400">({product.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-1">
          <span className="font-display text-sm sm:text-base text-forest-800 font-bold">₹{product.price}</span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1 bg-forest-600 text-white text-[10px] sm:text-xs font-body px-2 sm:px-3 py-1.5 rounded-full hover:bg-forest-700 transition-all whitespace-nowrap ${adding ? 'scale-95 bg-forest-500' : ''}`}
          >
            <ShoppingCart className="w-3 h-3" />
            {user ? 'Add' : 'Sign in'}
          </button>
        </div>
      </div>
    </Link>
  )
}