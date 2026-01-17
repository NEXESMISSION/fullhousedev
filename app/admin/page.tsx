import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your forms and submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Forms</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{forms?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Forms</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {forms?.filter(f => f.status === 'active').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Submissions</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalSubmissions || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Forms</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forms && forms.length > 0 ? (
                forms.map((form) => (
                  <tr key={form.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{form.name}</div>
                      {form.description && (
                        <div className="text-sm text-gray-500">{form.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          form.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : form.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {form.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Submissions count will be loaded separately if needed */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(form.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/forms/${form.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/form/${form.public_url}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No forms yet. Create your first form!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/forms/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Form
        </Link>
      </div>
    </div>
  )
}

