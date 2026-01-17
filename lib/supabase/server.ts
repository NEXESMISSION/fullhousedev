import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    const error = new Error('Missing Supabase environment variables. Check your .env.local file.')
    console.error('[Supabase Server] Missing environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
    })
    // In production, we should handle this more gracefully
    // For now, throw to prevent silent failures
    throw error
  }

  try {
    const cookieStore = await cookies()

    return createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })
  } catch (error) {
    console.error('[Supabase Server] Error creating client:', error)
    throw error
  }
}

