'use client'

// import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase/client'
import { ar as t } from '@/lib/translations'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Auth temporarily disabled
  // const router = useRouter()
  // const supabase = createClient()
  // const [user, setUser] = useState<any>(null)
  const user = null // No auth check for now
  const loading = false // No loading state needed

  // Auth checks removed temporarily
  // useEffect(() => {
  //   checkUser()
  //   
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null)
  //     if (!session?.user && pathname.startsWith('/admin')) {
  //       router.push('/auth/login')
  //     }
  //   })

  //   return () => subscription.unsubscribe()
  // }, [pathname, router, supabase])

  // const checkUser = async () => {
  //   const { data: { user } } = await supabase.auth.getUser()
  //   setUser(user)
  //   setLoading(false)
  //   
  //   if (!user && pathname.startsWith('/admin')) {
  //     router.push('/auth/login')
  //   }
  // }

  const handleLogout = async () => {
    // Auth temporarily disabled
    // await supabase.auth.signOut()
    // router.push('/auth/login')
  }

  const navItems = [
    { href: '/admin', label: 'الإرسالات', icon: '📥' },
    { href: '/admin/forms', label: 'النماذج', icon: '📝' },
    { href: '/admin/map', label: 'خريطة المواقع', icon: '🗺️' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo - Empty space */}
            <div className="flex-shrink-0 w-0"></div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title={t.home}
              >
                <span className="text-lg">🏠</span>
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t.logout}
                >
                  <span className="text-lg">🚪</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="flex justify-around items-center px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 flex-1 py-2 px-1 rounded-lg transition-all ${
                  pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
