import { Link } from 'react-router-dom'
import { Leaf, Truck, Shield, RefreshCw, Star, ArrowRight, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { MOCK_PRODUCTS } from '../lib/mockData'

const FEATURES = [
  { icon: Truck, title: 'Free Delivery', desc: 'Orders above ₹599' },
  { icon: Shield, title: 'Healthy Guarantee', desc: 'Money back promise' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free' },
  { icon: Leaf, title: 'Expert Tips', desc: 'With every plant' },
]

const TESTIMONIALS = [
  { name: 'Priya Mehta', text: 'The Monstera arrived in perfect condition. Beautifully packed and incredibly healthy!', rating: 5, avatar: 'P' },
  { name: 'Arjun Patel', text: "Best nursery online! Plants are always fresh and customer service is outstanding.", rating: 5, avatar: 'A' },
  { name: 'Sneha Sharma', text: "My snake plant has been thriving for months now. Worth every rupee!", rating: 5, avatar: 'S' },
]

export default function HomePage() {
  const featured = MOCK_PRODUCTS.slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50 pb-14 sm:pb-0">

      {/* Hero — compact on mobile */}
      <section className="relative min-h-[60vh] sm:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&auto=format)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div className="absolute top-20 right-10 sm:right-20 w-48 sm:w-96 h-48 sm:h-96 bg-forest-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-10 sm:pb-16 grid lg:grid-cols-2 gap-8 items-center w-full">
          <div className="animate-slide-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-forest-700/50 backdrop-blur text-forest-200 text-xs font-body px-3 py-1.5 rounded-full mb-4 border border-forest-600/30">
              <Sparkles className="w-3 h-3" /> Free shipping above ₹599
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-3">
              Bring Nature
              <span className="block text-forest-300 font-accent italic">Into Your Home</span>
            </h1>
            <p className="font-body text-forest-200 text-sm sm:text-lg leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
              Curated plants, seeds & garden supplies delivered fresh. Transform your space into a green sanctuary.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-forest-800 font-body font-medium px-6 py-3 rounded-full hover:bg-forest-50 transition-colors shadow-xl text-sm sm:text-base">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?category=Indoor Plants" className="inline-flex items-center gap-2 bg-forest-700/50 backdrop-blur text-white font-body px-6 py-3 rounded-full hover:bg-forest-700 transition-colors border border-forest-600/40 text-sm sm:text-base">
                Indoor Plants
              </Link>
            </div>
            {/* Stats — compact on mobile */}
            <div className="flex gap-5 sm:gap-8 mt-6 sm:mt-10 justify-center lg:justify-start">
              {[['500+', 'Varieties'], ['10K+', 'Customers'], ['4.9★', 'Rating']].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="font-display text-lg sm:text-2xl text-white">{num}</p>
                  <p className="font-body text-[10px] sm:text-xs text-forest-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image grid — hidden on small mobile */}
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

      {/* Features — 2x2 on mobile, 4-col on desktop */}
      <section className="py-4 sm:py-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2 sm:gap-3 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-forest-50 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-forest-100 transition-colors shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-forest-600" />
                </div>
                <div>
                  <p className="font-display text-bark text-xs sm:text-sm">{title}</p>
                  <p className="font-body text-[10px] sm:text-xs text-gray-400 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — horizontal scroll on mobile */}
      <section className="py-6 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div>
            <p className="font-body text-forest-600 text-[10px] sm:text-sm uppercase tracking-widest mb-0.5 sm:mb-2">Browse By</p>
            <h2 className="font-display text-xl sm:text-3xl md:text-4xl text-bark">Shop by Category</h2>
          </div>
          <Link to="/shop" className="font-body text-xs text-forest-600 flex items-center gap-1 hover:text-forest-800">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
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
              className="group flex flex-col items-center gap-1.5 shrink-0 sm:shrink"
            >
              <div className="w-16 h-16 sm:w-full sm:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-forest-50 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <span className="font-display text-[11px] sm:text-sm text-bark text-center">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products — 2 col on mobile */}
      <section className="py-4 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-4 sm:mb-8">
            <div>
              <p className="font-body text-forest-600 text-[10px] sm:text-sm uppercase tracking-widest mb-0.5 sm:mb-2">Handpicked</p>
              <h2 className="font-display text-xl sm:text-3xl md:text-4xl text-bark">Featured Plants</h2>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-forest-700 font-body text-xs sm:text-sm hover:text-forest-900">
              View all <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
          {/* 2 col on mobile, 4 col on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="py-12 sm:py-20 relative overflow-hidden mx-3 sm:mx-0 my-4 sm:my-0 rounded-2xl sm:rounded-none">
        <div className="absolute inset-0 bg-gradient-to-r from-earth-800 to-earth-700 rounded-2xl sm:rounded-none" />
        <div className="absolute inset-0 opacity-20 rounded-2xl sm:rounded-none" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format)',
          backgroundSize: 'cover',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="font-accent text-earth-300 text-lg sm:text-2xl mb-2">Plant a seed,</p>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-5">Grow Your Own Jungle 🌿</h2>
          <p className="font-body text-earth-200 text-sm sm:text-lg mb-5 sm:mb-8 max-w-xl mx-auto">
            First-time buyer? Get 15% off. Use code <strong>GREENIE</strong> at checkout.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-earth-800 font-body font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-earth-50 transition-colors shadow-xl text-sm sm:text-base">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 sm:py-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <p className="font-body text-forest-600 text-[10px] sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">Customer Love</p>
          <h2 className="font-display text-xl sm:text-3xl md:text-4xl text-bark">What Our Customers Say</h2>
        </div>
        {/* horizontal scroll on mobile */}
        <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-6 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {TESTIMONIALS.map(({ name, text, rating, avatar }) => (
            <div key={name} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow shrink-0 w-72 sm:w-auto">
              <div className="flex mb-3">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-earth-400 fill-earth-400" />
                ))}
              </div>
              <p className="font-body text-bark leading-relaxed mb-4 text-xs sm:text-sm">"{text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-forest-100 text-forest-700 rounded-full flex items-center justify-center font-display text-sm font-bold">
                  {avatar}
                </div>
                <span className="font-display text-xs sm:text-sm text-bark">{name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}