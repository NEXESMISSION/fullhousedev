'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import type { Database } from '@/lib/supabase/database.types'
import { ar as t } from '@/lib/translations'
import LocationDisplayFree from './LocationDisplayFree'

type Form = Database['public']['Tables']['forms']['Row']
type Submission = Database['public']['Tables']['submissions']['Row']
type SubmissionValue = Database['public']['Tables']['submission_values']['Row']
type Field = Database['public']['Tables']['fields']['Row']

interface SubmissionWithValues extends Submission {
  values: SubmissionValue[]
  form?: Form
}

interface SubmissionsViewProps {
  forms: Pick<Form, 'id' | 'name'>[]
}

export default function SubmissionsView({ forms }: SubmissionsViewProps) {
  const supabase = createClient()
  const [selectedFormId, setSelectedFormId] = useState<string>('all')
  const [submissions, setSubmissions] = useState<SubmissionWithValues[]>([])
  const [allFields, setAllFields] = useState<Record<string, Field[]>>({})
  const [loading, setLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithValues | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'form'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadAllSubmissions()
  }, [])

  useEffect(() => {
    if (selectedFormId && selectedFormId !== 'all') {
      loadFieldsForForm(selectedFormId)
    } else {
      // Load fields for all forms
      forms.forEach(form => {
        if (!allFields[form.id]) {
          loadFieldsForForm(form.id)
        }
      })
    }
  }, [selectedFormId, forms])

  const loadFieldsForForm = async (formId: string) => {
    if (allFields[formId]) return
    
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('form_id', formId)
      .order('order', { ascending: true })

    if (!error && data) {
      setAllFields(prev => ({ ...prev, [formId]: data }))
    }
  }

  const loadAllSubmissions = async () => {
    setLoading(true)
    
    try {
      const { data: submissionsData, error } = await supabase
        .from('submissions')
        .select(`
          *,
          forms (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (submissionsData) {
        const submissionsTyped = submissionsData as Array<{ id: string; form_id: string; created_at: string; forms?: any }>
        const submissionIds = submissionsTyped.map((s) => s.id)
        const { data: valuesData } = await supabase
          .from('submission_values')
          .select('*')
          .in('submission_id', submissionIds)

        const submissionsWithValues = submissionsTyped.map((submission) => ({
          ...submission,
          form: submission.forms,
          values: valuesData?.filter((v) => (v as any).submission_id === submission.id) || [],
        }))

        setSubmissions(submissionsWithValues)

        // Load fields for all forms
        const formIds = [...new Set(submissionsTyped.map(s => s.form_id))]
        for (const formId of formIds) {
          await loadFieldsForForm(formId)
        }
      }
    } catch (error: any) {
      console.error('[Submissions] Error:', error)
      alert(`فشل تحميل الإرسالات: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (submissionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإرسال؟')) {
      return
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId)

      if (error) throw error
      loadAllSubmissions()
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null)
      }
    } catch (error: any) {
      console.error('Error deleting submission:', error)
      alert('فشل حذف الإرسال')
    }
  }

  const handleExport = () => {
    const submissionsToExport = filteredAndSortedSubmissions
    if (submissionsToExport.length === 0) {
      alert('لا توجد إرسالات للتصدير')
      return
    }

    const exportData = submissionsToExport.map((submission) => {
      const fields = allFields[submission.form_id] || []
      const row: Record<string, any> = {
        'معرف الإرسال': submission.id,
        'النموذج': (submission.form as any)?.name || '',
        'التاريخ': format(new Date(submission.created_at), 'yyyy-MM-dd HH:mm:ss'),
      }

      fields.forEach((field) => {
        const value = submission.values.find((v) => v.field_id === field.id)
        row[field.label] = value?.value || ''
      })

      return row
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'الإرسالات')
    XLSX.writeFile(wb, `submissions-${Date.now()}.xlsx`)
  }

  const filteredAndSortedSubmissions = submissions
    .filter((submission) => {
      // Filter by form if selected
      if (selectedFormId !== 'all' && submission.form_id !== selectedFormId) {
        return false
      }

      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesValue = submission.values.some((v) => 
          v.value.toLowerCase().includes(searchLower)
        )
        const matchesFormName = (submission.form as any)?.name?.toLowerCase().includes(searchLower)
        return matchesValue || matchesFormName
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        const formA = (a.form as any)?.name || ''
        const formB = (b.form as any)?.name || ''
        return sortOrder === 'asc' 
          ? formA.localeCompare(formB, 'ar')
          : formB.localeCompare(formA, 'ar')
      }
    })

  const getFieldValue = (submission: SubmissionWithValues, fieldId: string) => {
    return submission.values.find((v) => v.field_id === fieldId)?.value || ''
  }

  const getFieldsForSubmission = (submission: SubmissionWithValues) => {
    return allFields[submission.form_id] || []
  }

  const getAllUniqueFields = () => {
    const fieldMap = new Map<string, Field>()
    Object.values(allFields).forEach(fields => {
      fields.forEach(field => {
        if (!fieldMap.has(field.id)) {
          fieldMap.set(field.id, field)
        }
      })
    })
    return Array.from(fieldMap.values())
  }

  return (
    <div className="space-y-3 sm:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header with Export Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        <button
          onClick={handleExport}
          disabled={filteredAndSortedSubmissions.length === 0}
          className="w-full sm:w-auto px-3 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg sm:rounded-xl shadow-md hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2"
        >
          <span>📥</span>
          {t.exportToExcel}
        </button>
      </div>

      {/* Filters - Compact on mobile */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 p-2.5 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Form Filter */}
          <div>
            <label htmlFor="form-filter" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t.selectForm}
            </label>
            <select
              id="form-filter"
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1.5 sm:py-2.5 bg-white transition-all"
            >
              <option value="all">{t.allForms}</option>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t.searchSubmissions}
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1.5 sm:py-2.5 transition-all"
            />
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              ترتيب حسب
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'form')}
              className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1.5 sm:py-2.5 bg-white transition-all"
            >
              <option value="date">التاريخ</option>
              <option value="form">النموذج</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sort-order" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              الترتيب
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1.5 sm:py-2.5 bg-white transition-all"
            >
              <option value="desc">الأحدث أولاً</option>
              <option value="asc">الأقدم أولاً</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600">
            عرض <span className="font-semibold text-gray-900">{filteredAndSortedSubmissions.length}</span> من أصل <span className="font-semibold text-gray-900">{submissions.length}</span> إرسال
          </p>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loadingSubmissions}</p>
        </div>
      ) : filteredAndSortedSubmissions.length > 0 ? (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {filteredAndSortedSubmissions.map((submission) => {
              const fields = getFieldsForSubmission(submission)
              const mainFields = fields.slice(0, 2)
              return (
                <div
                  key={submission.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                          {(submission.form as any)?.name || 'نموذج غير معروف'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(submission.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                        </span>
                      </div>
                      {mainFields.map((field) => {
                        const value = getFieldValue(submission, field.id)
                        if (!value) return null
                        return (
                          <div key={field.id} className="text-sm mb-1">
                            <span className="text-gray-500 font-medium">{field.label}:</span>{' '}
                            <span className="text-gray-900">{value.length > 40 ? value.substring(0, 40) + '...' : value}</span>
                          </div>
                        )
                      })}
                      {fields.length > 2 && (
                        <p className="text-xs text-gray-400 mt-2">
                          +{fields.length - 2} حقول أخرى
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      {t.view}
                    </button>
                    <button
                      onClick={() => handleDelete(submission.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.date}
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.forms}
                    </th>
                    {getAllUniqueFields().slice(0, 3).map((field) => (
                      <th
                        key={field.id}
                        className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {field.label}
                      </th>
                    ))}
                    {getAllUniqueFields().length > 3 && (
                      <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        المزيد
                      </th>
                    )}
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedSubmissions.map((submission) => {
                    const fields = getFieldsForSubmission(submission)
                    const displayFields = getAllUniqueFields().slice(0, 3)
                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format(new Date(submission.created_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                            {(submission.form as any)?.name || 'نموذج غير معروف'}
                          </span>
                        </td>
                        {displayFields.map((field) => (
                          <td key={field.id} className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate">
                              {getFieldValue(submission, field.id) || '-'}
                            </div>
                          </td>
                        ))}
                        {getAllUniqueFields().length > 3 && (
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">
                            +{fields.length} حقول
                          </td>
                        )}
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSubmission(submission)
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            {t.view}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(submission.id)
                            }}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            {t.delete}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 text-lg">
            {searchTerm ? t.noSubmissionsMatch : t.noSubmissions}
          </p>
        </div>
      )}

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSubmission(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.submissionDetails}</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1">النموذج</p>
                    <p className="text-base text-gray-900 font-medium">
                      {(selectedSubmission.form as any)?.name || 'نموذج غير معروف'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{t.date}</p>
                    <p className="text-base text-gray-900">
                      {format(new Date(selectedSubmission.created_at), 'dd MMMM yyyy, HH:mm:ss', { locale: ar })}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">{t.fieldValues}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getFieldsForSubmission(selectedSubmission).map((field) => {
                      const value = getFieldValue(selectedSubmission, field.id)
                      
                      // Special handling for location fields
                      if (field.type === 'location' && value) {
                        return (
                          <div key={field.id} className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                            <p className="text-sm font-semibold text-gray-700 mb-3">{field.label}</p>
                            <LocationDisplayFree value={value} fieldLabel={field.label} />
                          </div>
                        )
                      }
                      
                      return (
                        <div key={field.id} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">{field.label}</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                            {value || <span className="text-gray-400 italic">{t.empty}</span>}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedSubmission.id)
                  setSelectedSubmission(null)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                {t.deleteSubmission}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
