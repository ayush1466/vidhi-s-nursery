import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) }
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'LOAD_CART':
      return { ...state, items: action.payload }
    default:
      return state
  }
}

// Each user gets their own localStorage key: vidhis_cart_<userId>
// Guests get: vidhis_cart_guest
const getCartKey = (userId) => userId ? `vidhis_cart_${userId}` : 'vidhis_cart_guest'

const loadCart = (userId) => {
  try {
    const key = getCartKey(userId)
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [userId, setUserId] = useState(null)
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Listen for auth changes — load the right cart when user logs in/out
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id || null
      setUserId(uid)
      dispatch({ type: 'LOAD_CART', payload: loadCart(uid) })
    })

    // Watch for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null
      setUserId(uid)
      dispatch({ type: 'LOAD_CART', payload: loadCart(uid) })
    })

    return () => subscription.unsubscribe()
  }, [])

  // Save cart to localStorage whenever it changes, under the user-specific key
  useEffect(() => {
    const key = getCartKey(userId)
    localStorage.setItem(key, JSON.stringify(state.items))
  }, [state.items, userId])

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product })
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}