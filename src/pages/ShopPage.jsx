import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
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
  const [showSortSheet, setShowSortSheet] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setCategory(cat)
    const s = searchParams.get('search')
    if (s) setSearch(s)
  }, [searchParams])

  const filtered = useMemo(() => {
    let products = [...MOCK_PRODUCTS]
    if (category !== 'All') products = products.filter(p => p.category === category)
    if (search) products = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
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
    <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20">

      {/* Compact Page Header */}
      <div className="bg-forest-800 py-6 sm:py-10 text-center">
        <h1 className="font-display text-2xl sm:text-4xl text-white">Plant Shop</h1>
        <p className="font-body text-forest-300 text-xs sm:text-sm mt-1">{filtered.length} plants found</p>
      </div>

      {/* Sticky Search + Filter Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plants..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 border border-gray-200 bg-gray-50 rounded-full font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Sort button */}
          <button
            onClick={() => setShowSortSheet(!showSortSheet)}
            className="flex items-center gap-1 border border-gray-200 bg-white rounded-full px-3 py-2 font-body text-xs text-bark whitespace-nowrap"
          >
            Sort <ChevronDown className="w-3 h-3" />
          </button>

          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 border rounded-full px-3 py-2 font-body text-xs transition-colors whitespace-nowrap ${showFilters ? 'bg-forest-600 text-white border-forest-600' : 'border-gray-200 bg-white text-bark'}`}
          >
            <SlidersHorizontal className="w-3 h-3" /> Filter
          </button>
        </div>

        {/* Sort Sheet (dropdown) */}
        {showSortSheet && (
          <div className="border-t border-gray-100 bg-white px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {SORT_OPTIONS.map(o => (
              <button
                key={o}
                onClick={() => { setSort(o); setShowSortSheet(false) }}
                className={`shrink-0 font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${sort === o ? 'bg-forest-600 text-white border-forest-600' : 'border-gray-200 text-bark'}`}
              >
                {o}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Category Scrollbar — always visible on mobile */}
      <div className="bg-white border-b border-gray-100 px-3 sm:hidden">
        <div className="flex gap-2 overflow-x-auto py-2.5 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 font-body text-xs px-3 py-1.5 rounded-full border transition-colors ${category === cat ? 'bg-forest-600 text-white border-forest-600' : 'bg-gray-50 text-bark border-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex gap-4">

          {/* Sidebar — desktop only */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-44 lg:w-52 shrink-0`}>
            <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-32 border border-gray-100">
              <h3 className="font-display text-bark text-sm mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left font-body text-xs px-3 py-2 rounded-xl transition-colors ${category === cat ? 'bg-forest-600 text-white' : 'text-bark hover:bg-forest-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <hr className="my-3 border-gray-100" />

              <h3 className="font-display text-bark text-sm mb-2">Price Range</h3>
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
          <div className="flex-1 min-w-0">

            {/* Mobile filter panel */}
            {showFilters && (
              <div className="md:hidden bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
                <h3 className="font-display text-bark text-sm mb-2">Price Range</h3>
                <input
                  type="range" min={0} max={2000} value={priceRange[1]}
                  onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-forest-600"
                />
                <div className="flex justify-between font-body text-xs text-gray-400 mt-1">
                  <span>₹0</span><span>₹{priceRange[1]}</span>
                </div>
              </div>
            )}

            {/* Result count + active filter */}
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-xs text-gray-500">
                <span className="font-medium text-bark">{filtered.length}</span> products
                {category !== 'All' && <span className="ml-1 text-forest-600">in {category}</span>}
              </p>
              {(category !== 'All' || search) && (
                <button
                  onClick={() => { setCategory('All'); setSearch('') }}
                  className="font-body text-xs text-red-400 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="font-display text-xl text-bark mb-2">No plants found</p>
                <p className="font-body text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            ) : (
              /* 2 columns on mobile, 3 on tablet, 4 on desktop */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
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