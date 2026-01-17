import { createClient } from '@/lib/supabase/server'
import SubmissionsView from '@/components/SubmissionsView'

export default async function SubmissionsPage() {
  try {
    const supabase = await createClient()
    
    const { data: forms, error } = await supabase
      .from('forms')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('[Submissions Page] Error loading forms:', error)
    }

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
    console.error('[Submissions Page] Unexpected error:', error)
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
