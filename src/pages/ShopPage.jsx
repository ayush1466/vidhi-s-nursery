import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { MOCK_PRODUCTS, CATEGORIES } from '../lib/mockData'

const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Newest']

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [sort, setSort] = useState('Featured')
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
    const s = searchParams.get('search')
    if (s) setSearch(s)
  }, [searchParams])

  const filtered = useMemo(() => {
    let products = [...MOCK_PRODUCTS]

    if (category !== 'All') products = products.filter(p => p.category === category)
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sort) {
      case 'Price: Low to High': products.sort((a, b) => a.price - b.price); break
      case 'Price: High to Low': products.sort((a, b) => b.price - a.price); break
      case 'Rating': products.sort((a, b) => b.rating - a.rating); break
      default: break
    }

    return products
  }, [category, search, sort, priceRange])

  return (
    <div className="min-h-screen bg-cream pt-20">
      {/* Header */}
      <div className="bg-forest-800 py-12 text-center">
        <p className="font-accent text-forest-300 text-xl mb-1">Explore our collection</p>
        <h1 className="font-display text-4xl text-white">Plant Shop</h1>
        <p className="font-body text-forest-300 mt-2">{filtered.length} plants found</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plants, seeds..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-forest-100 bg-white rounded-full font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-forest-100 bg-white rounded-full px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
          >
            {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border rounded-full px-4 py-2.5 font-body text-sm transition-colors ${showFilters ? 'bg-forest-600 text-white border-forest-600' : 'border-forest-100 bg-white text-bark'}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-56 shrink-0`}>
            <div className="bg-white rounded-3xl p-5 shadow-sm sticky top-24">
              <h3 className="font-display text-bark mb-4">Categories</h3>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left font-body text-sm px-3 py-2 rounded-xl transition-colors ${category === cat ? 'bg-forest-600 text-white' : 'text-bark hover:bg-forest-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <hr className="my-4 border-forest-50" />

              <h3 className="font-display text-bark mb-3">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={2000}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-forest-600"
                />
                <div className="flex justify-between font-body text-xs text-gray-400">
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Category Pills (mobile/quick filter) */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 md:hidden">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 font-body text-xs px-3 py-1.5 rounded-full transition-colors ${category === cat ? 'bg-forest-600 text-white' : 'bg-white text-bark border border-forest-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display text-2xl text-bark mb-2">No plants found</p>
                <p className="font-body text-gray-400">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
