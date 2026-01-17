'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ar as t } from '@/lib/translations'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user && pathname.startsWith('/admin')) {
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router, supabase])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
    
    if (!user && pathname.startsWith('/admin')) {
      router.push('/auth/login')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/admin', label: 'الإرسالات' },
    { href: '/admin/forms', label: 'النماذج' },
    { href: '/admin/map', label: 'خريطة المواقع' },
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
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-12 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <Link href="/admin" className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t.forms} Builder
                </Link>
              </div>
              <div className="hidden md:ml-8 md:flex md:space-x-4 rtl:space-x-reverse">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-3 rtl:space-x-reverse">
              {user && (
                <>
                  <span className="hidden lg:inline text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg truncate max-w-[120px]">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
                  >
                    {t.logout}
                  </button>
                </>
              )}
              <Link
                href="/"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
              >
                {t.home}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu - More Compact */}
        <div className="md:hidden border-t border-gray-200 px-2 sm:px-4 py-1.5 sm:py-2">
          <div className="flex space-x-1.5 sm:space-x-2 rtl:space-x-reverse overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
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
