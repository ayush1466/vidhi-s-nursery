import { adminClient as supabase } from './adminClient'

const ADMIN_QUERY_TIMEOUT_MS = 45000

const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])

const isTimeoutError = (err) =>
  String(err?.message || '').toLowerCase().includes('timed out')

// ── Auth ──────────────────────────────────────────────
export const adminSignIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const adminSignOut = async () =>
  supabase.auth.signOut({ scope: 'local' })

export const checkIsAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    if (error) return false
    return data?.is_admin === true
  } catch {
    return false
  }
}

// ── Dashboard Stats ───────────────────────────────────
export const getDashboardStats = async () => {
  try {
    const query = () =>
      Promise.all([
        supabase.from('orders').select('id, status, total_amount, created_at'),
        supabase.from('products').select('id, in_stock'),
        supabase.from('profiles').select('id'),
      ])

    let response
    try {
      response = await withTimeout(query(), ADMIN_QUERY_TIMEOUT_MS, 'Dashboard stats request timed out')
    } catch (firstErr) {
      if (!isTimeoutError(firstErr)) throw firstErr
      response = await withTimeout(query(), ADMIN_QUERY_TIMEOUT_MS, 'Dashboard stats request timed out')
    }

    const [ordersRes, productsRes, usersRes] = response
    if (ordersRes.error) throw ordersRes.error
    if (productsRes.error) throw productsRes.error
    if (usersRes.error) throw usersRes.error

    const orders = ordersRes.data || []
    const products = productsRes.data || []
    const users = usersRes.data || []

    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((s, o) => s + Number(o.total_amount), 0)

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)

    return {
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: users.length,
      totalRevenue,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      recentOrders,
      outOfStock: products.filter(p => !p.in_stock).length,
      statusCounts: {
        pending:    orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped:    orders.filter(o => o.status === 'shipped').length,
        delivered:  orders.filter(o => o.status === 'delivered').length,
        cancelled:  orders.filter(o => o.status === 'cancelled').length,
      }
    }
  } catch (error) {
    throw error
  }
}

// ── Orders ────────────────────────────────────────────
export const getAllOrders = () =>
  supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        quantity,
        price,
        product_name,
        product_image,
        products ( name, image, category )
      )
    `)
    .order('created_at', { ascending: false })

export const updateOrderStatus = async (id, status) => {
  const query = () =>
    supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, status, total_amount, created_at')
      .single()

  try {
    return await withTimeout(query(), ADMIN_QUERY_TIMEOUT_MS, 'Order update request timed out')
  } catch (firstErr) {
    if (!isTimeoutError(firstErr)) return { data: null, error: firstErr }
    try {
      return await withTimeout(query(), ADMIN_QUERY_TIMEOUT_MS, 'Order update request timed out')
    } catch (secondErr) {
      return { data: null, error: secondErr }
    }
  }
}

// ── Products ──────────────────────────────────────────
export const getAllProducts = () =>
  supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

export const createProduct = (product) =>
  supabase.from('products').insert(product).select().single()

export const updateProduct = (id, product) =>
  supabase.from('products').update(product).eq('id', id).select().single()

export const deleteProduct = (id) =>
  supabase.from('products').delete().eq('id', id)

export const toggleProductStock = (id, inStock) =>
  supabase.from('products').update({ in_stock: inStock }).eq('id', id)

// ── Customers ─────────────────────────────────────────
export const getAllCustomers = async () => {
  try {
    const [profilesRes, ordersRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, created_at'),
      supabase
        .from('orders')
        .select('id, user_id, total_amount, status'),
    ])

    if (profilesRes.error) return { data: null, error: profilesRes.error }
    if (ordersRes.error) return { data: null, error: ordersRes.error }

    const profiles = profilesRes.data || []
    const orders = ordersRes.data || []

    const ordersByUser = orders.reduce((acc, order) => {
      const key = order.user_id
      if (!key) return acc
      if (!acc[key]) acc[key] = []
      acc[key].push(order)
      return acc
    }, {})

    const data = [...profiles]
      .sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0
        return bt - at
      })
      .map(profile => ({
        ...profile,
        orders: ordersByUser[profile.id] || [],
      }))

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
