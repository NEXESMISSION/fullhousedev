import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import SubmissionCount from '@/components/SubmissionCount'

export default async function FormsPage() {
  const supabase = await createClient()
  
  const { data: forms, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
          <p className="mt-2 text-gray-600">Create and manage your forms</p>
        </div>
        <Link
          href="/admin/forms/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Form
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Public URL
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
                    <SubmissionCount formId={form.id} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/form/${form.public_url}`}
                      target="_blank"
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      /form/{form.public_url}
                    </Link>
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No forms yet. Create your first form!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

