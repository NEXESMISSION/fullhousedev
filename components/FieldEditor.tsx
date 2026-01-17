'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

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
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select (Dropdown)' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
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

    try {
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
    } catch (error) {
      console.error('Error saving field:', error)
      alert('Failed to save field. Please try again.')
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {field ? 'Edit Field' : 'Add New Field'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                Label *
              </label>
              <input
                type="text"
                id="label"
                required
                value={fieldData.label}
                onChange={(e) => setFieldData({ ...fieldData, label: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="Field label"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Field Type *
              </label>
              <select
                id="type"
                required
                value={fieldData.type}
                onChange={(e) => setFieldData({ ...fieldData, type: e.target.value as FieldType, options: [] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700">
                Placeholder
              </label>
              <input
                type="text"
                id="placeholder"
                value={fieldData.placeholder}
                onChange={(e) => setFieldData({ ...fieldData, placeholder: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                placeholder="Placeholder text"
              />
            </div>

            {needsOptions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options *
                </label>
                {fieldData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-900 border border-blue-600 rounded-md"
                >
                  Add Option
                </button>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fieldData.required}
                  onChange={(e) => setFieldData({ ...fieldData, required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Required</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fieldData.enabled}
                  onChange={(e) => setFieldData({ ...fieldData, enabled: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Enabled</span>
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (needsOptions && fieldData.options.length === 0)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Field'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

