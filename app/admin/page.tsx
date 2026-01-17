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

  const { count: totalSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">الإرسالات</h1>
          <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600">إدارة وعرض جميع الإرسالات</p>
        </div>
        <Link
          href="/admin/forms/new"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <span>➕</span>
          {t.createNewForm}
        </Link>
      </div>

      {/* Stats Cards - Compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg sm:rounded-xl shadow-md border border-indigo-100 p-2.5 sm:p-4 md:p-6 hover:shadow-lg transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 truncate">{t.totalSubmissions}</h3>
              <p className="mt-0.5 sm:mt-2 text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-indigo-600">{totalSubmissions || 0}</p>
            </div>
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl">📊</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg sm:rounded-xl shadow-md border border-blue-100 p-2.5 sm:p-4 md:p-6 hover:shadow-lg transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 truncate">{t.totalForms}</h3>
              <p className="mt-0.5 sm:mt-2 text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{allFormsList.length || 0}</p>
            </div>
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl">📋</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-green-50 rounded-lg sm:rounded-xl shadow-md border border-green-100 p-2.5 sm:p-4 md:p-6 hover:shadow-lg transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 truncate">{t.activeForms}</h3>
              <p className="mt-0.5 sm:mt-2 text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600">
                {allFormsList.filter(f => f.status === 'active').length || 0}
              </p>
            </div>
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Submissions View - Main Content */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <SubmissionsView forms={forms || []} />
      </div>

      {/* Forms Section - Collapsible/Minimized */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">النماذج</h2>
            <span className="text-xs text-gray-500">{allForms?.length || 0} نموذج</span>
          </div>
        </div>

        {allFormsList && allFormsList.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {allFormsList.slice(0, 3).map((form) => (
              <div key={form.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{form.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          form.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : form.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {form.status === 'active' ? t.active : form.status === 'draft' ? t.draft : t.disabled}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(form.created_at), 'dd/MM/yyyy', { locale: ar })}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/forms/${form.id}`}
                    className="px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {t.edit}
                  </Link>
                </div>
              </div>
            ))}
            {allFormsList.length > 3 && (
              <div className="p-3 sm:p-4 text-center border-t border-gray-200">
                <Link
                  href="/admin/forms"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  عرض جميع النماذج ({allFormsList.length - 3} أكثر)
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-8 text-center">
            <p className="text-sm text-gray-500 mb-4">{t.noFormsYet}</p>
            <Link
              href="/admin/forms/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <span>➕</span>
              {t.createNewForm}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}