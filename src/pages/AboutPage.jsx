import { Leaf, Heart, Award, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Hero */}
      <div className="relative bg-forest-800 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format)',
          backgroundSize: 'cover',
        }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <p className="font-accent text-forest-300 text-2xl mb-3">Our Story</p>
          <h1 className="font-display text-5xl text-white mb-5">Born from a Love of Plants</h1>
          <p className="font-body text-forest-200 text-lg leading-relaxed">
            Vidhi's Nursery started in 2018 as a small backyard garden in Ahmedabad and grew into one of Gujarat's most loved online plant shops.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="w-12 h-12 bg-forest-100 rounded-2xl flex items-center justify-center mb-5">
            <Leaf className="w-6 h-6 text-forest-600" />
          </div>
          <h2 className="font-display text-3xl text-bark mb-5">Who We Are</h2>
          <p className="font-body text-bark/70 leading-relaxed mb-4">
            Hi! I'm Vidhi, a botanist-turned-entrepreneur with a deep passion for bringing plants into everyday Indian homes. 
            What started as sharing cuttings with neighbors grew into a full-fledged nursery serving customers across India.
          </p>
          <p className="font-body text-bark/70 leading-relaxed mb-6">
            Every plant we sell is grown or sourced with love, checked for health and quality, and packed carefully to survive the journey to your home.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-forest-600 text-white font-body px-6 py-3 rounded-full hover:bg-forest-700 transition-colors">
            Shop Our Collection
          </Link>
        </div>
        <div className="rounded-3xl overflow-hidden h-80">
          <img src="https://images.unsplash.com/photo-1517191434949-5e90cd67d2b6?w=600&auto=format" alt="Nursery" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-forest-800 py-14">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Leaf, num: '500+', label: 'Plant Varieties' },
            { icon: Users, num: '10,000+', label: 'Happy Customers' },
            { icon: Heart, num: '98%', label: 'Satisfaction Rate' },
            { icon: Award, num: '7', label: 'Years of Excellence' },
          ].map(({ icon: Icon, num, label }) => (
            <div key={label}>
              <div className="w-10 h-10 bg-forest-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-forest-300" />
              </div>
              <p className="font-display text-3xl text-white">{num}</p>
              <p className="font-body text-sm text-forest-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-bark mb-5">Our Mission</h2>
        <p className="font-body text-bark/70 leading-relaxed text-lg">
          We believe every home deserves a touch of green. Our mission is to make plant parenting easy, joyful, and accessible for everyone — from first-time plant owners to seasoned green thumbs.
        </p>
      </section>
    </div>
  )
}
