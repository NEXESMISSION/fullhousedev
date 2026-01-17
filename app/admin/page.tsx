import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ar as t } from '@/lib/translations'
import SubmissionsView from '@/components/SubmissionsView'

// Force dynamic rendering for pages that use cookies/authentication
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  try {
    const supabase = await createClient()
    
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select('id, name')
      .order('name', { ascending: true })

    if (formsError) {
      console.error('[Admin Dashboard] Error loading forms:', formsError)
    }

    const { data: allForms, error: allFormsError } = await supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })

    if (allFormsError) {
      console.error('[Admin Dashboard] Error loading all forms:', allFormsError)
    }

    const allFormsList = (allForms || []) as Array<{
      id: string
      name: string
      description: string | null
      status: 'draft' | 'active' | 'disabled'
      created_at: string
      public_url: string
    }>

    return (
      <div className="space-y-3 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">الإرسالات</h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600">إدارة وعرض جميع الإرسالات</p>
          </div>
        </div>

        {/* Submissions View */}
        <SubmissionsView forms={forms || []} />
      </div>
    )
  } catch (error) {
    console.error('[Admin Dashboard] Unexpected error:', error)
    // Return a fallback UI instead of crashing
    return (
      <div className="space-y-3 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">الإرسالات</h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600">إدارة وعرض جميع الإرسالات</p>
          </div>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
        </div>
        <SubmissionsView forms={[]} />
      </div>
    )
  }
}
