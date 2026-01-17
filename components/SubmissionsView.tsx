'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import type { Database } from '@/lib/supabase/database.types'

type Form = Database['public']['Tables']['forms']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']
type SubmissionValue = Database['public']['Tables']['submission_values']['Row']
type Field = Database['public']['Tables']['fields']['Row']

interface SubmissionWithValues extends Submission {
  values: SubmissionValue[]
}

interface SubmissionsViewProps {
  forms: Pick<Form, 'id' | 'name'>[]
}

export default function SubmissionsView({ forms }: SubmissionsViewProps) {
  const supabase = createClient()
  const [selectedFormId, setSelectedFormId] = useState<string>('')
  const [submissions, setSubmissions] = useState<SubmissionWithValues[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithValues | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (selectedFormId) {
      loadSubmissions()
      loadFields()
    } else {
      setSubmissions([])
      setFields([])
    }
  }, [selectedFormId])

  const loadFields = async () => {
    const { data } = await supabase
      .from('fields')
      .select('*')
      .eq('form_id', selectedFormId)
      .order('order', { ascending: true })

    if (data) {
      setFields(data)
    }
  }

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const { data: submissionsData, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('form_id', selectedFormId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (submissionsData) {
        const submissionIds = submissionsData.map((s) => s.id)
        const { data: valuesData } = await supabase
          .from('submission_values')
          .select('*')
          .in('submission_id', submissionIds)

        const submissionsWithValues = submissionsData.map((submission) => ({
          ...submission,
          values: valuesData?.filter((v) => v.submission_id === submission.id) || [],
        }))

        setSubmissions(submissionsWithValues)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
      alert('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId)

      if (error) throw error
      loadSubmissions()
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission')
    }
  }

  const handleExport = () => {
    if (submissions.length === 0) {
      alert('No submissions to export')
      return
    }

    const exportData = submissions.map((submission) => {
      const row: Record<string, any> = {
        'Submission ID': submission.id,
        'Date': format(new Date(submission.created_at), 'yyyy-MM-dd HH:mm:ss'),
      }

      fields.forEach((field) => {
        const value = submission.values.find((v) => v.field_id === field.id)
        row[field.label] = value?.value || ''
      })

      return row
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions')
    XLSX.writeFile(wb, `submissions-${selectedFormId}-${Date.now()}.xlsx`)
  }

  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return submission.values.some((v) => v.value.toLowerCase().includes(searchLower))
  })

  const getFieldValue = (submission: SubmissionWithValues, fieldId: string) => {
    return submission.values.find((v) => v.field_id === fieldId)?.value || ''
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        <p className="mt-2 text-gray-600">View and manage form submissions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="form-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Form
            </label>
            <select
              id="form-select"
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">-- Select a form --</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedFormId && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Submissions
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by any field value..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <button
                onClick={handleExport}
                disabled={filteredSubmissions.length === 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Export to Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      {fields.slice(0, 5).map((field) => (
                        <th
                          key={field.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {field.label}
                        </th>
                      ))}
                      {fields.length > 5 && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ...
                        </th>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(submission.created_at), 'MMM d, yyyy HH:mm')}
                        </td>
                        {fields.slice(0, 5).map((field) => (
                          <td key={field.id} className="px-6 py-4 text-sm text-gray-900">
                            {getFieldValue(submission, field.id) || '-'}
                          </td>
                        ))}
                        {fields.length > 5 && (
                          <td className="px-6 py-4 text-sm text-gray-500">
                            +{fields.length - 5} more
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSubmission(submission)
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(submission.id)
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'No submissions match your search.' : 'No submissions yet for this form.'}
              </p>
            </div>
          )}
        </>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Submission ID</p>
                  <p className="text-sm text-gray-900">{selectedSubmission.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedSubmission.created_at), 'MMMM d, yyyy HH:mm:ss')}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Field Values</h3>
                  <div className="space-y-4">
                    {fields.map((field) => {
                      const value = getFieldValue(selectedSubmission, field.id)
                      return (
                        <div key={field.id}>
                          <p className="text-sm font-medium text-gray-500">{field.label}</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {value || <span className="text-gray-400">(empty)</span>}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => {
                      handleDelete(selectedSubmission.id)
                      setSelectedSubmission(null)
                    }}
                    className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    Delete Submission
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

