import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Public client for unauthenticated access (public forms)
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const error = new Error('Missing Supabase environment variables')
    console.error('[Supabase Public Client] Missing environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
    })
    throw error
  }

  try {
    return createSupabaseClient<Database>(url, key)
  } catch (error) {
    console.error('[Supabase Public Client] Error creating client:', error)
    throw error
  }
}

