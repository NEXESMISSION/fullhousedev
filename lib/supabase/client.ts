import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[Supabase Client] Missing environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
      url: url ? '***' : 'MISSING',
    })
    throw new Error('Missing Supabase environment variables. Check your .env.local file.')
  }

  console.log('[Supabase Client] Initializing client with URL:', url.substring(0, 30) + '...')

  return createBrowserClient<Database>(url, key)
}

