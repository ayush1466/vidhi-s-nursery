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
    <Link to={`/product/${product.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-forest-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-forest-600 text-white text-xs font-body px-2.5 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setWished(!wished) }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wished ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-400'}`}
        >
          <Heart className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-body text-forest-600 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-display text-bark text-base leading-snug mb-2 flex-1">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-earth-400 fill-earth-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs font-body text-gray-400">({product.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg text-forest-800">₹{product.price}</span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 bg-forest-600 text-white text-xs font-body px-3 py-2 rounded-full hover:bg-forest-700 transition-all ${adding ? 'scale-95 bg-forest-500' : ''}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {user ? 'Add' : 'Sign in'}
          </button>
        </div>
      </div>
    </Link>
  )
}