import React, { createContext, useContext, useMemo } from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SupabaseContext = createContext<SupabaseClient | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const url = (import.meta as any).env.VITE_SUPABASE_URL
    const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY
    return createClient(url, anon)
  }, [])
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const c = useContext(SupabaseContext)
  if (!c) throw new Error('SupabaseProvider missing')
  return c
}
