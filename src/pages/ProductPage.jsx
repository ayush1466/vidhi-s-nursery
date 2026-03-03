import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { MOCK_PRODUCTS } from '../lib/mockData'
import ProductCard from '../components/ProductCard'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { id } = useParams()
  const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id))
  const { addItem, items } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [wished, setWished] = useState(false)
  const [qty, setQty] = useState(1)

  const cartItem = items.find(i => i.id === product?.id)

  if (!product) {
    return (
      <div className="min-h-screen bg-cream pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl text-bark mb-4">Product not found</p>
          <Link to="/shop" className="text-forest-600 font-body hover:underline">← Back to shop</Link>
        </div>
      </div>
    )
  }

  const related = MOCK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart', {
        style: { background: '#1c1917', color: '#fff', fontFamily: 'DM Sans' },
        icon: '🔒',
      })
      navigate('/login')
      return
    }
    for (let i = 0; i < qty; i++) addItem(product)
    toast.success(`${qty}x ${product.name} added! 🌿`, {
      style: { background: '#166534', color: '#fff', fontFamily: 'DM Sans' },
    })
  }

  return (
    <div className="min-h-screen bg-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link to="/shop" className="flex items-center gap-1 font-body text-sm text-forest-600 hover:text-forest-800">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-body text-sm text-gray-400">{product.category}</span>
          <span className="text-gray-300">/</span>
          <span className="font-body text-sm text-bark">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-forest-50">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden opacity-70 hover:opacity-100 cursor-pointer transition-opacity">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.badge && (
              <span className="inline-block bg-forest-100 text-forest-700 text-xs font-body px-3 py-1 rounded-full mb-4">
                {product.badge}
              </span>
            )}
            <p className="font-body text-forest-600 text-sm uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="font-display text-4xl text-bark mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-earth-400 fill-earth-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="font-body text-sm text-bark">{product.rating}</span>
              <span className="font-body text-sm text-gray-400">({product.reviews} reviews)</span>
            </div>

            <p className="font-body text-bark/70 leading-relaxed mb-6">{product.description}</p>
            <div className="text-3xl font-display text-forest-800 mb-6">₹{product.price}</div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4">
              <p className="font-body text-sm text-bark">Quantity:</p>
              <div className="flex items-center gap-3 bg-forest-50 rounded-full px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="w-4 h-4 text-forest-600" /></button>
                <span className="font-body text-bark w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)}><Plus className="w-4 h-4 text-forest-600" /></button>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 mb-8">
              {user ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-forest-600 text-white font-body font-medium py-4 rounded-full hover:bg-forest-700 transition-colors shadow-lg shadow-forest-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 flex items-center justify-center gap-2 bg-forest-600 text-white font-body font-medium py-4 rounded-full hover:bg-forest-700 transition-colors shadow-lg shadow-forest-200"
                >
                  🔒 Sign in to Add to Cart
                </Link>
              )}
              <button
                onClick={() => setWished(!wished)}
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors ${wished ? 'bg-red-500 border-red-500 text-white' : 'border-forest-200 text-bark hover:border-red-300'}`}
              >
                <Heart className="w-5 h-5" fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Perks */}
            <div className="space-y-3 border-t border-forest-100 pt-6">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-forest-600 shrink-0" />
                <p className="font-body text-sm text-bark">Free delivery on orders above ₹599</p>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-forest-600 shrink-0" />
                <p className="font-body text-sm text-bark">30-day plant health guarantee</p>
              </div>
            </div>

            {/* Care Tags */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['Bright Indirect Light', 'Water Weekly', 'Non-toxic', 'Pet Friendly'].map(tag => (
                <span key={tag} className="bg-forest-50 text-forest-700 font-body text-xs px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display text-2xl text-bark mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}