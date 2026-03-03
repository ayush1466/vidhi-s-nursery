import { Leaf, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-forest-800">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-accent text-xl text-forest-300">Vidhi's</span>
                <span className="font-display text-sm text-forest-400 block leading-none tracking-widest uppercase">Nursery</span>
              </div>
            </div>
            <p className="font-body text-sm text-forest-300 leading-relaxed mb-5">
              Bringing the beauty of nature to your home since 2018. We curate only the finest plants and garden supplies.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-forest-800 rounded-full flex items-center justify-center hover:bg-forest-600 transition-colors">
                  <Icon className="w-4 h-4 text-forest-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-white mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {['Indoor Plants', 'Outdoor Plants', 'Succulents', 'Seeds', 'Pots & Planters', 'Tools'].map(cat => (
                <li key={cat}>
                  <Link to={`/shop?category=${cat}`} className="font-body text-sm text-forest-300 hover:text-forest-100 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display text-white mb-4">Help</h4>
            <ul className="space-y-2.5">
              {['FAQ', 'Shipping Policy', 'Return Policy', 'Care Guides', 'Plant Doctor', 'Gift Cards'].map(link => (
                <li key={link}>
                  <a href="#" className="font-body text-sm text-forest-300 hover:text-forest-100 transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-forest-400 mt-0.5 shrink-0" />
                <span className="font-body text-sm text-forest-300">42 Garden Lane, Ahmedabad, Gujarat 380001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-forest-400 shrink-0" />
                <a href="tel:+911234567890" className="font-body text-sm text-forest-300 hover:text-forest-100">+91 12345 67890</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-forest-400 shrink-0" />
                <a href="mailto:hello@vidhinursery.in" className="font-body text-sm text-forest-300 hover:text-forest-100">hello@vidhinursery.in</a>
              </li>
            </ul>
            {/* Newsletter */}
            <div className="mt-5">
              <p className="font-body text-xs text-forest-400 mb-2">Get plant care tips in your inbox</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-forest-900 border border-forest-700 rounded-full px-3 py-2 text-xs font-body text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
                />
                <button className="bg-forest-600 text-white text-xs font-body px-4 py-2 rounded-full hover:bg-forest-500 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-body text-xs text-forest-500">© 2025 Vidhi's Nursery. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="font-body text-xs text-forest-500 hover:text-forest-300">Privacy Policy</a>
            <a href="#" className="font-body text-xs text-forest-500 hover:text-forest-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
