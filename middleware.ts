import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Middleware] Missing Supabase environment variables')
    // Allow the request to continue - let the page handle the error
    // This prevents middleware from breaking the entire app
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        // If there's an auth error, still allow access but let the page handle it
        // This prevents middleware from blocking legitimate requests
        if (authError) {
          console.error('[Middleware] Auth error:', authError.message)
        }

        if (!user && !authError) {
          const url = request.nextUrl.clone()
          url.pathname = '/auth/login'
          url.searchParams.set('redirect', request.nextUrl.pathname)
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error('[Middleware] Error checking user auth:', error)
        // Continue with the request if auth check fails
      }
    }

    // Protect login page - redirect to home if already logged in
    if (request.nextUrl.pathname === '/auth/login') {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (user && !authError) {
          // If user is already logged in and trying to access login, redirect to admin
          const redirect = request.nextUrl.searchParams.get('redirect') || '/admin'
          const url = request.nextUrl.clone()
          url.pathname = redirect
          url.search = ''
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error('[Middleware] Error checking user auth on login page:', error)
        // Continue with the request if auth check fails
      }
    }
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error)
    // Return the response even if there's an error
    // This prevents middleware from breaking the app
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/login',
  ],
}

