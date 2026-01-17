import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ar as t } from '@/lib/translations'
import SubmissionCount from '@/components/SubmissionCount'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalSubmissions } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.dashboard}</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">نظرة عامة على النماذج والإرسالات</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/admin/forms/create-housing-form"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>🏠</span>
            إنشاء نموذج طلب امتلاك مسكن
          </Link>
          <Link
            href="/admin/forms/new"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>➕</span>
            {t.createNewForm}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md border border-blue-100 p-5 sm:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">{t.totalForms}</h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{forms?.length || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl">📋</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md border border-green-100 p-5 sm:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">{t.activeForms}</h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-green-600">
                {forms?.filter(f => f.status === 'active').length || 0}
              </p>
            </div>
            <div className="text-3xl sm:text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-md border border-indigo-100 p-5 sm:p-6 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">{t.totalSubmissions}</h3>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600">{totalSubmissions || 0}</p>
            </div>
            <div className="text-3xl sm:text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t.forms}</h2>
        </div>

        {forms && forms.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden divide-y divide-gray-200">
              {forms.map((form) => (
                <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{form.name}</h3>
                      {form.description && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{form.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {t.edit}
                    </Link>
                    <Link
                      href={`/form/${form.public_url}`}
                      target="_blank"
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      {t.view}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.forms}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.submissions}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.created}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{form.name}</div>
                        {form.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">{form.description}</div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            form.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : form.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {form.status === 'active' ? t.active : form.status === 'draft' ? t.draft : t.disabled}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <SubmissionCount formId={form.id} />
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(form.created_at), 'dd MMM yyyy', { locale: ar })}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/forms/${form.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          {t.edit}
                        </Link>
                        <Link
                          href={`/form/${form.public_url}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900 font-medium"
                        >
                          {t.view}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="px-4 sm:px-6 py-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{t.noFormsYet}</p>
            <Link
              href="/admin/forms/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
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
