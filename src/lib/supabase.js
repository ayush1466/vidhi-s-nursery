import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    lock: (name, acquireTimeout, fn) => fn(),
  }
})

export const signUp = (email, password, name) =>
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        full_name: name,
        email,
      },
    },
  })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

// ── NEW: Google OAuth ──────────────────────────────────
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
// ───────────────────────────────────────────────────────

export const getProducts = async (category = null, search = null) => {
  let query = supabase.from('products').select('*').eq('in_stock', true)
  if (category && category !== 'All') query = query.eq('category', category)
  if (search) query = query.ilike('name', `%${search}%`)
  return query.order('created_at', { ascending: false })
}

export const getProductById = (id) =>
  supabase.from('products').select('*').eq('id', id).single()

export const createOrder = async (userId, items, total, address) => {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({ user_id: userId, total_amount: total, status: 'pending', shipping_address: address })
    .select()
    .single()

  if (error) return { error }

  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  return { data: order, error: itemsError }
}

export const getUserOrders = (userId) =>
  supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })