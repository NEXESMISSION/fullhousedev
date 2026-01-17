import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build, env vars might not be available - only throw at runtime
  // Check if we're in a browser environment (client-side) before throwing
  if (!url || !key) {
    const isBrowser = typeof window !== 'undefined'
    
    // During build/server-side rendering, log warning but don't throw
    // This allows the build to complete even without env vars
    if (!isBrowser) {
      console.warn('[Supabase Client] Missing environment variables during build/SSR - this is expected if env vars are not set in build environment')
      // Create a minimal client that won't work but won't break the build
      // Using empty strings will create a client that fails at runtime with proper errors
      return createBrowserClient<Database>('', '')
    }
    
    // At runtime in browser, throw error as before
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

