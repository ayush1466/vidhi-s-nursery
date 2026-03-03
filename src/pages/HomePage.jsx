import { Link } from 'react-router-dom'
import { Leaf, Truck, Shield, RefreshCw, Star, ArrowRight, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { MOCK_PRODUCTS } from '../lib/mockData'

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹599' },
  { icon: Shield, title: 'Healthy Guarantee', desc: 'Or your money back' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
  { icon: Leaf, title: 'Expert Care Tips', desc: 'With every plant purchase' },
]

const TESTIMONIALS = [
  { name: 'Priya Mehta', text: 'The Monstera I ordered arrived in perfect condition. Beautifully packed and incredibly healthy!', rating: 5, avatar: 'P' },
  { name: 'Arjun Patel', text: "Best nursery online! The plants are always fresh and the customer service is outstanding.", rating: 5, avatar: 'A' },
  { name: 'Sneha Sharma', text: "My snake plant has been thriving for months now. Worth every rupee!", rating: 5, avatar: 'S' },
]

export default function HomePage() {
  const featured = MOCK_PRODUCTS.slice(0, 8)
  const bestsellers = MOCK_PRODUCTS.filter(p => p.badge === 'Bestseller' || p.rating >= 4.8).slice(0, 3)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-forest-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-earth-500/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-forest-700/50 backdrop-blur text-forest-200 text-xs font-body px-4 py-2 rounded-full mb-6 border border-forest-600/30">
              <Sparkles className="w-3 h-3" /> Free shipping on orders above ₹599
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-4">
              Bring Nature
              <span className="block text-forest-300 font-accent italic">Into Your Home</span>
            </h1>
            <p className="font-body text-forest-200 text-lg leading-relaxed mb-8 max-w-md">
              Curated plants, seeds, and garden supplies delivered fresh to your doorstep. 
              Transform your space into a green sanctuary.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-forest-800 font-body font-medium px-7 py-3.5 rounded-full hover:bg-forest-50 transition-colors shadow-xl"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?category=Indoor Plants"
                className="inline-flex items-center gap-2 bg-forest-700/50 backdrop-blur text-white font-body px-7 py-3.5 rounded-full hover:bg-forest-700 transition-colors border border-forest-600/40"
              >
                Indoor Plants
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[['500+', 'Plant Varieties'], ['10K+', 'Happy Customers'], ['4.9★', 'Average Rating']].map(([num, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl text-white">{num}</p>
                  <p className="font-body text-xs text-forest-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-in">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden h-48 animate-float" style={{ animationDelay: '0s' }}>
                <img src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&auto=format" alt="Plant" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-3xl overflow-hidden h-64 animate-float" style={{ animationDelay: '1s' }}>
                <img src="https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&auto=format" alt="Plant" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="rounded-3xl overflow-hidden h-64 animate-float" style={{ animationDelay: '0.5s' }}>
                <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format" alt="Pot" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-3xl overflow-hidden h-48 animate-float" style={{ animationDelay: '1.5s' }}>
                <img src="https://images.unsplash.com/photo-1490750967868-88df5691cc9a?w=400&auto=format" alt="Flower" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-y border-forest-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-forest-50 rounded-2xl flex items-center justify-center group-hover:bg-forest-100 transition-colors shrink-0">
                  <Icon className="w-5 h-5 text-forest-600" />
                </div>
                <div>
                  <p className="font-display text-bark text-sm">{title}</p>
                  <p className="font-body text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="font-body text-forest-600 text-sm uppercase tracking-widest mb-2">Browse By</p>
          <h2 className="font-display text-3xl md:text-4xl text-bark">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Indoor', img: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=200&auto=format', cat: 'Indoor Plants' },
            { name: 'Outdoor', img: 'https://images.unsplash.com/photo-1548460456-1f5c57dac7b3?w=200&auto=format', cat: 'Outdoor Plants' },
            { name: 'Succulents', img: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=200&auto=format', cat: 'Succulents' },
            { name: 'Seeds', img: 'https://images.unsplash.com/photo-1490750967868-88df5691cc9a?w=200&auto=format', cat: 'Seeds' },
            { name: 'Pots', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&auto=format', cat: 'Pots & Planters' },
            { name: 'Tools', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&auto=format', cat: 'Tools' },
          ].map(({ name, img, cat }) => (
            <Link
              key={name}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-full aspect-square rounded-3xl overflow-hidden bg-forest-50 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="font-display text-sm text-bark">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-body text-forest-600 text-sm uppercase tracking-widest mb-2">Handpicked for you</p>
              <h2 className="font-display text-3xl md:text-4xl text-bark">Featured Plants</h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-forest-700 font-body text-sm hover:text-forest-900 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 text-forest-700 font-body border border-forest-200 px-6 py-2.5 rounded-full hover:bg-forest-50 transition-colors">
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-earth-800 to-earth-700" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format)',
          backgroundSize: 'cover',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="font-accent text-earth-300 text-2xl mb-3">Plant a seed,</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-5">Grow Your Own Jungle 🌿</h2>
          <p className="font-body text-earth-200 text-lg mb-8 max-w-xl mx-auto">
            First-time buyer? Get 15% off your first order. Use code <strong>GREENIE</strong> at checkout.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-earth-800 font-body font-medium px-8 py-4 rounded-full hover:bg-earth-50 transition-colors shadow-xl"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="font-body text-forest-600 text-sm uppercase tracking-widest mb-2">Customer Love</p>
          <h2 className="font-display text-3xl md:text-4xl text-bark">What Our Customers Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, text, rating, avatar }) => (
            <div key={name} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-earth-400 fill-earth-400" />
                ))}
              </div>
              <p className="font-body text-bark leading-relaxed mb-5 text-sm">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-forest-100 text-forest-700 rounded-full flex items-center justify-center font-display font-bold">
                  {avatar}
                </div>
                <span className="font-display text-sm text-bark">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
