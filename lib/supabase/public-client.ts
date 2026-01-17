import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Public client for unauthenticated access (public forms)
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient<Database>(url, key)
}

