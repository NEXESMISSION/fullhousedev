import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we're in browser - only create real client in browser environment
  const isBrowser = typeof window !== 'undefined'
  
  // During build/SSR (NOT in browser), return a mock client to prevent build failures
  // This allows build to complete without actually calling createBrowserClient
  if (!isBrowser) {
    console.warn('[Supabase Client] Client creation skipped during build/SSR')
    // Return a mock client that satisfies the type but won't work at runtime
    // Using type assertion because this is only for build-time, not runtime
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as unknown as ReturnType<typeof createBrowserClient<Database>>
  }

  // In browser: always require env vars and create real client
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

