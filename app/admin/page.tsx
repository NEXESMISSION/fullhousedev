import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ar as t } from '@/lib/translations'
import SubmissionsView from '@/components/SubmissionsView'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: forms } = await supabase
    .from('forms')
    .select('id, name')
    .order('name', { ascending: true })

  const { data: allForms } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false })

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
}
