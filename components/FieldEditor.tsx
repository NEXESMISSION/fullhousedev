'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { ar as t } from '@/lib/translations'

type Field = Database['public']['Tables']['fields']['Row']
type FieldType = Field['type']

interface FieldEditorProps {
  formId: string
  field: Field | null
  onSave: () => void
  onCancel: () => void
  nextOrder: number
}

export default function FieldEditor({ formId, field, onSave, onCancel, nextOrder }: FieldEditorProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fieldData, setFieldData] = useState({
    label: field?.label || '',
    type: (field?.type || 'text') as FieldType,
    required: field?.required ?? false,
    placeholder: field?.placeholder || '',
    options: field?.options as string[] || [] as string[],
    enabled: field?.enabled ?? true,
  })

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: t.text },
    { value: 'number', label: t.number },
    { value: 'email', label: t.email },
    { value: 'phone', label: t.phone },
    { value: 'textarea', label: t.textarea },
    { value: 'select', label: t.select },
    { value: 'checkbox', label: t.checkbox },
    { value: 'date', label: t.date },
    { value: 'location', label: t.location },
  ]

  const needsOptions = fieldData.type === 'select' || fieldData.type === 'checkbox'

  useEffect(() => {
    if (field) {
      setFieldData({
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || '',
        options: (field.options as string[]) || [],
        enabled: field.enabled,
      })
    }
  }, [field])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const fieldPayload = {
      form_id: formId,
      label: fieldData.label,
      type: fieldData.type,
      required: fieldData.required,
      placeholder: fieldData.placeholder || null,
      options: needsOptions && fieldData.options.length > 0 ? fieldData.options : null,
      order: field?.order ?? nextOrder,
      enabled: fieldData.enabled,
    }

    try {
      if (field) {
        const { error } = await supabase
          .from('fields')
          .update(fieldPayload)
          .eq('id', field.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('fields')
          .insert(fieldPayload)

        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      console.error('Error saving field:', error)
      alert(`${t.fieldSaveFailed}: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddOption = () => {
    setFieldData({
      ...fieldData,
      options: [...fieldData.options, ''],
    })
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...fieldData.options]
    newOptions[index] = value
    setFieldData({ ...fieldData, options: newOptions })
  }

  const handleRemoveOption = (index: number) => {
    const newOptions = fieldData.options.filter((_, i) => i !== index)
    setFieldData({ ...fieldData, options: newOptions })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {field ? t.editField : t.addField}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div>
            <label htmlFor="label" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.fieldLabel} *
            </label>
            <input
              type="text"
              id="label"
              required
              value={fieldData.label}
              onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
              placeholder={t.fieldLabelPlaceholder}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-base transition-all"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.fieldType} *
            </label>
            <select
              id="type"
              required
              value={fieldData.type}
              onChange={(e) => setFieldData({ ...fieldData, type: e.target.value as FieldType, options: [] })}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-base transition-all bg-white"
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="placeholder" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.placeholder}
            </label>
            <input
              type="text"
              id="placeholder"
              value={fieldData.placeholder}
              onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
              placeholder={t.placeholder}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-base transition-all"
            />
          </div>

          {needsOptions && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t.options} *
              </label>
              {fieldData.options.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">{t.addFirstOption}</p>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    {t.addOption}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {fieldData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`${t.optionPlaceholder} ${index + 1}`}
                        required
                        className="flex-1 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-3 py-2 text-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        {t.remove}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="w-full mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-2 border-blue-200"
                  >
                    + {t.addOption}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={fieldData.required}
                onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="mr-3 text-sm font-medium text-gray-700">{t.required}</span>
            </label>

            <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={fieldData.enabled}
                onChange={(e) => setFieldData({ ...fieldData, enabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="mr-3 text-sm font-medium text-gray-700">{t.enabled}</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || (needsOptions && fieldData.options.length === 0)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? t.loading : t.saveField}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
