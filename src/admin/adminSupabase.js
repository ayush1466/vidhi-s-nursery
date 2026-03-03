import { supabase } from '../lib/supabase'

// ── Auth ──────────────────────────────────────────────
export const adminSignIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const adminSignOut = () => supabase.auth.signOut()

// Check if logged-in user is admin
export const checkIsAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return data?.is_admin === true
}

// ── Dashboard Stats ───────────────────────────────────
export const getDashboardStats = async () => {
  const [orders, products, users, revenue] = await Promise.all([
    supabase.from('orders').select('id, status, total_amount, created_at'),
    supabase.from('products').select('id, in_stock'),
    supabase.from('profiles').select('id'),
    supabase.from('orders').select('total_amount').eq('status', 'delivered'),
  ])

  const totalRevenue = (revenue.data || []).reduce((s, o) => s + o.total_amount, 0)
  const pendingOrders = (orders.data || []).filter(o => o.status === 'pending').length
  const recentOrders = (orders.data || [])
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 7)

  return {
    totalOrders: orders.data?.length || 0,
    totalProducts: products.data?.length || 0,
    totalCustomers: users.data?.length || 0,
    totalRevenue,
    pendingOrders,
    recentOrders,
    outOfStock: (products.data || []).filter(p => !p.in_stock).length,
  }
}

// ── Orders ────────────────────────────────────────────
export const getAllOrders = () =>
  supabase
    .from('orders')
    .select(`*, profiles(full_name, email), order_items(*, products(name, image))`)
    .order('created_at', { ascending: false })

export const updateOrderStatus = (id, status) =>
  supabase.from('orders').update({ status, updated_at: new Date() }).eq('id', id)

// ── Products ──────────────────────────────────────────
export const getAllProducts = () =>
  supabase.from('products').select('*').order('created_at', { ascending: false })

export const createProduct = (product) =>
  supabase.from('products').insert(product).select().single()

export const updateProduct = (id, product) =>
  supabase.from('products').update(product).eq('id', id).select().single()

export const deleteProduct = (id) =>
  supabase.from('products').delete().eq('id', id)

export const toggleProductStock = (id, inStock) =>
  supabase.from('products').update({ in_stock: inStock }).eq('id', id)

// ── Customers ─────────────────────────────────────────
export const getAllCustomers = () =>
  supabase
    .from('profiles')
    .select('*, orders(id, total_amount, status)')
    .order('created_at', { ascending: false })
