import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const error = new Error('Missing Supabase environment variables. Check your .env.local file.')
    console.error('[Supabase Client] Missing environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
      url: url ? '***' : 'MISSING',
    })
    throw error
  }

  try {
    return createBrowserClient<Database>(url, key)
  } catch (error) {
    console.error('[Supabase Client] Error creating client:', error)
    throw error
  }
}

