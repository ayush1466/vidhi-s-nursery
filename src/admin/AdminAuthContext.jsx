import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { checkIsAdmin } from './adminSupabase'

const AdminAuthContext = createContext()

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const isAdmin = await checkIsAdmin()
        setAdmin(isAdmin ? session.user : null)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) {
        const isAdmin = await checkIsAdmin()
        setAdmin(isAdmin ? session.user : null)
      } else {
        setAdmin(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, loading, setAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
