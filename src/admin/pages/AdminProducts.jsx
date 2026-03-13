import { useEffect, useRef, useState } from 'react'
import { adminClient as supabase } from '../adminClient'
import { getAllProducts, createProduct, updateProduct, deleteProduct, toggleProductStock, uploadProductImage } from '../adminSupabase'
import { getAdminCache, setAdminCache } from '../adminPageCache'
import { Plus, Search, Edit2, Trash2, X, Leaf, ToggleLeft, ToggleRight, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES } from '../../lib/mockData'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', price: '', category: 'Indoor Plants',
  image: '', description: '', badge: '', in_stock: true, rating: 4.5, reviews: 0
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const isEdit = !!product
  const fileInputRef = useRef(null)

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB')
      return
    }

    setUploadError('')
    setUploading(true)
    const { url, error } = await uploadProductImage(file)
    setUploading(false)

    if (error) {
      setUploadError('Upload failed: ' + (error.message || 'Unknown error'))
    } else {
      setForm(f => ({ ...f, image: url }))
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      toast.error('Name, price and category are required')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      price: parseFloat(form.price),
      rating: parseFloat(form.rating),
      reviews: parseInt(form.reviews),
    }
    const { data, error } = isEdit
      ? await updateProduct(product.id, payload)
      : await createProduct(payload)

    if (error) {
      console.error('Save error:', error)
      toast.error('Failed to save: ' + (error.message || 'Unknown error'))
    } else {
      toast.success(`Product ${isEdit ? 'updated' : 'added'}! 🌿`)
      onSave(data)
      onClose()
    }
    setSaving(false)
  }

  const cats = CATEGORIES.filter(c => c !== 'All')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-forest-900 border border-forest-700 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-forest-800">
          <h2 className="font-display text-white text-base sm:text-lg">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-forest-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">

          {/* ── Image ── */}
          <div>
            <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-2">
              Product Image
            </label>

            {form.image && (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-forest-800 mb-3 group">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setForm(f => ({ ...f, image: '' }))}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageFile}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-600 border border-forest-600 text-white font-body text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {form.image ? 'Change Photo' : 'Upload from Device / Gallery'}
                </>
              )}
            </button>

            {uploadError && (
              <p className="font-body text-xs text-red-400 mt-1.5">{uploadError}</p>
            )}

            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-forest-700" />
              <span className="font-body text-xs text-forest-600">or paste URL</span>
              <div className="flex-1 h-px bg-forest-700" />
            </div>

            <input
              type="text"
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* Name */}
          <div>
            <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Plant Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Monstera Deliciosa"
              className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description..."
              rows={3}
              className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500 resize-none"
            />
          </div>

          {/* Price + Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Price (₹) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="499"
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-3 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
              />
            </div>
            <div>
              <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Badge</label>
              <input
                type="text"
                value={form.badge || ''}
                onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                placeholder="Bestseller…"
                className="w-full bg-forest-800 border border-forest-700 rounded-xl px-3 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="font-body text-xs text-forest-500 uppercase tracking-wider block mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-forest-800 border border-forest-700 rounded-xl px-4 py-2.5 font-body text-sm text-white focus:outline-none focus:border-forest-500"
            >
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* In Stock */}
          <div className="flex items-center justify-between bg-forest-800/50 rounded-xl px-4 py-3">
            <span className="font-body text-sm text-white">In Stock</span>
            <button onClick={() => setForm(f => ({ ...f, in_stock: !f.in_stock }))}>
              {form.in_stock
                ? <ToggleRight className="w-8 h-8 text-forest-400" />
                : <ToggleLeft className="w-8 h-8 text-forest-600" />
              }
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
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
  const cachedProducts = getAdminCache('products_list')
  const [products, setProducts] = useState(cachedProducts || [])
  const [loading, setLoading] = useState(!cachedProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const load = async ({ silent = false } = {}) => {
      if (!silent && isMountedRef.current) setLoading(true)
      try {
        const { data, error } = await getAllProducts()
        if (!isMountedRef.current) return
        if (error) { toast.error('Failed to load products'); return }
        setProducts(data || [])
        setAdminCache('products_list', data || [])
      } catch (err) {
        console.error('products fetch error:', err)
        if (!silent) toast.error('Failed to load products')
      } finally {
        if (isMountedRef.current) setLoading(false)
      }
    }
    load()
    const refreshOnReturn = () => load({ silent: true })
    const handleVisibility = () => { if (document.visibilityState === 'visible') refreshOnReturn() }
    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', handleVisibility)
    const poll = setInterval(() => load({ silent: true }), 12000)
    return () => {
      isMountedRef.current = false
      clearInterval(poll)
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleDelete = async (id) => {
  if (!confirm('Delete this product?')) return

  // Find the product to get its image URL
  const product = products.find(p => p.id === id)

  const { error } = await deleteProduct(id)
  if (error) {
    toast.error('Failed to delete: ' + (error.message || 'Unknown error'))
    return
  }

  // Also delete image from storage if it's a Supabase-hosted image
  if (product?.image?.includes('supabase')) {
    const fileName = product.image.split('/').pop()
    await supabase.storage.from('product-images').remove([fileName])
  }

  setProducts(products.filter(p => p.id !== id))
  toast.success('Product deleted 🗑️')
}

  const handleToggleStock = async (id, current) => {
    await toggleProductStock(id, !current)
    setProducts(products.map(p => p.id === id ? { ...p, in_stock: !current } : p))
  }

  const handleSave = (saved) => {
    if (products.find(p => p.id === saved.id))
      setProducts(products.map(p => p.id === saved.id ? saved : p))
    else
      setProducts([saved, ...products])
  }

  const cats = ['All', ...CATEGORIES.filter(c => c !== 'All')]

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl text-white">Products</h1>
          <p className="font-body text-xs sm:text-sm text-forest-500">{products.length} total products</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-1.5 sm:gap-2 bg-forest-600 text-white font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-forest-500 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Product
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-600" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-forest-900 border border-forest-700 rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-white placeholder-forest-600 focus:outline-none focus:border-forest-500"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(p => !p)}
            className={`sm:hidden flex items-center justify-center w-10 h-10 rounded-xl border transition-colors shrink-0 ${filtersOpen || categoryFilter !== 'All' ? 'bg-forest-600 border-forest-600 text-white' : 'border-forest-700 text-forest-500'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className={`${filtersOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2`}>
          {cats.map(c => (
            <button
              key={c}
              onClick={() => { setCategoryFilter(c); setFiltersOpen(false) }}
              className={`font-body text-xs px-3 py-1.5 sm:py-2 rounded-full transition-all border ${categoryFilter === c ? 'bg-forest-600 text-white border-forest-600' : 'border-forest-700 text-forest-500 hover:border-forest-500'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-forest-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <Leaf className="w-10 h-10 text-forest-700 mx-auto mb-3" />
          <p className="font-body text-sm text-forest-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-forest-900 border border-forest-800 rounded-2xl overflow-hidden group">
              <div className="relative aspect-square bg-forest-800">
                {product.image
                  ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Leaf className="w-10 h-10 text-forest-700" /></div>
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                  <button onClick={() => setModal(product)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-forest-100 transition-colors">
                    <Edit2 className="w-4 h-4 text-forest-800" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="absolute top-2 right-2 flex gap-1.5 sm:hidden">
                  <button onClick={() => setModal(product)} className="w-7 h-7 bg-forest-900/80 rounded-lg flex items-center justify-center border border-forest-700">
                    <Edit2 className="w-3 h-3 text-white" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="w-7 h-7 bg-forest-900/80 rounded-lg flex items-center justify-center border border-red-500/40">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-forest-600 text-white text-[10px] sm:text-xs font-body px-1.5 sm:px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-3 sm:p-4">
                <p className="font-body text-[10px] sm:text-xs text-forest-500 mb-0.5 truncate">{product.category}</p>
                <p className="font-display text-white text-xs sm:text-sm leading-snug mb-2 truncate">{product.name}</p>
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display text-forest-400 text-sm">₹{product.price}</span>
                  <button
                    onClick={() => handleToggleStock(product.id, product.in_stock)}
                    className={`font-body text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full border transition-colors whitespace-nowrap ${product.in_stock ? 'bg-forest-500/20 text-forest-400 border-forest-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
                  >
                    {product.in_stock ? 'In Stock' : 'Out'}
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