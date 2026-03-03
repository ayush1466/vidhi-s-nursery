import { useEffect, useState } from 'react'
import { getAllProducts, createProduct, updateProduct, deleteProduct, toggleProductStock } from '../adminSupabase'
import { Plus, Search, Edit2, Trash2, X, Leaf, ToggleLeft, ToggleRight } from 'lucide-react'
import { CATEGORIES } from '../../lib/mockData'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', price: '', category: 'Indoor Plants',
  image: '', description: '', badge: '', in_stock: true, rating: 4.5, reviews: 0
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const isEdit = !!product

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price and category are required')
      return
    }
    setSaving(true)
    const payload = { ...form, price: parseFloat(form.price), rating: parseFloat(form.rating), reviews: parseInt(form.reviews) }
    const { data, error } = isEdit
      ? await updateProduct(product.id, payload)
      : await createProduct(payload)

    if (error) toast.error('Failed to save product')
    else {
      toast.success(`Product ${isEdit ? 'updated' : 'added'}! 🌿`)
      onSave(data)
      onClose()
    }
    setSaving(false)
  }

  const cats = CATEGORIES.filter(c => c !== 'All')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-forest-900 border border-forest-700 rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-forest-800">
          <h2 className="font-display text-white text-lg">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-forest-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Image preview */}
          {form.image && (
            <div className="w-full h-40 rounded-2xl overflow-hidden bg-forest-800">
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={() => {}} />
            </div>
          )}

          {[
            { key: 'name', label: 'Plant Name *', type: 'text', placeholder: 'e.g. Monstera Deliciosa' },
            { key: 'image', label: 'Image URL', type: 'text', placeholder: 'https://...' },
            { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short description...' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500 resize-none"
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
                />
              )}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="499"
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
              />
            </div>
            <div>
              <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Badge</label>
              <input
                type="text"
                value={form.badge || ''}
                onChange={e => setForm({ ...form, badge: e.target.value })}
                placeholder="Bestseller, New, etc."
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
              />
            </div>
          </div>

          <div>
            <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white focus:outline-none focus:border-forest-500"
            >
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between bg-forest-800/50 rounded-xl px-4 py-3">
            <span className="font-body text-sm text-white">In Stock</span>
            <button onClick={() => setForm({ ...form, in_stock: !form.in_stock })}>
              {form.in_stock
                ? <ToggleRight className="w-8 h-8 text-forest-400" />
                : <ToggleLeft className="w-8 h-8 text-forest-600" />
              }
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-forest-600 text-white font-body py-3 rounded-xl hover:bg-forest-500 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [modal, setModal] = useState(null) // null | 'add' | product object

  useEffect(() => {
    getAllProducts().then(({ data }) => {
      setProducts(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    const { error } = await deleteProduct(id)
    if (error) toast.error('Failed to delete')
    else {
      setProducts(products.filter(p => p.id !== id))
      toast.success('Product deleted')
    }
  }

  const handleToggleStock = async (id, current) => {
    await toggleProductStock(id, !current)
    setProducts(products.map(p => p.id === id ? { ...p, in_stock: !current } : p))
  }

  const handleSave = (saved) => {
    if (products.find(p => p.id === saved.id)) {
      setProducts(products.map(p => p.id === saved.id ? saved : p))
    } else {
      setProducts([saved, ...products])
    }
  }

  const cats = ['All', ...CATEGORIES.filter(c => c !== 'All')]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Products</h1>
          <p className="font-body text-sm text-forest-500">{products.length} total products</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 bg-forest-600 text-white font-body text-sm px-4 py-2.5 rounded-xl hover:bg-forest-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-forest-900 border border-forest-700 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`font-body text-xs px-3 py-2 rounded-full transition-all border ${
                categoryFilter === c
                  ? 'bg-forest-600 text-white border-forest-600'
                  : 'border-forest-700 text-forest-500 hover:border-forest-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-forest-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Leaf className="w-10 h-10 text-forest-700 mx-auto mb-3" />
          <p className="font-body text-forest-500">No products found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden group">
              <div className="relative aspect-square bg-forest-800">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-forest-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                  <button
                    onClick={() => setModal(product)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-forest-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-forest-800" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-forest-600 text-white text-xs font-body px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-body text-xs text-forest-500 mb-1">{product.category}</p>
                <p className="font-display text-white text-sm leading-snug mb-2 truncate">{product.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-forest-400">₹{product.price}</span>
                  <button
                    onClick={() => handleToggleStock(product.id, product.in_stock)}
                    className={`font-body text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      product.in_stock
                        ? 'bg-forest-500/20 text-forest-400 border-forest-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}
                  >
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
