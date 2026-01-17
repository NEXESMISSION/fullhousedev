'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FieldEditor from './FieldEditor'
import type { Database } from '@/lib/supabase/database.types'

type Form = Database['public']['Tables']['forms']['Row']
type Field = Database['public']['Tables']['fields']['Row']

interface FormEditorProps {
  form: Form
  initialFields: Field[]
}

export default function FormEditor({ form, initialFields }: FormEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState<Field[]>(initialFields)
  const [formData, setFormData] = useState({
    name: form.name,
    description: form.description || '',
    status: form.status,
  })
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)

  const handleFormUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('forms')
        .update({
          name: formData.name,
          description: formData.description,
          status: formData.status,
        })
        .eq('id', form.id)

      if (error) throw error
      alert('Form updated successfully!')
    } catch (error) {
      console.error('Error updating form:', error)
      alert('Failed to update form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', form.id)

      if (error) throw error
      router.push('/admin/forms')
    } catch (error) {
      console.error('Error deleting form:', error)
      alert('Failed to delete form. Please try again.')
    }
  }

  const refreshFields = async () => {
    const { data } = await supabase
      .from('fields')
      .select('*')
      .eq('form_id', form.id)
      .order('order', { ascending: true })
    
    if (data) {
      setFields(data)
    }
  }

  const handleFieldSaved = () => {
    setShowFieldEditor(false)
    setEditingField(null)
    refreshFields()
  }

  const handleEditField = (field: Field) => {
    setEditingField(field)
    setShowFieldEditor(true)
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId)

      if (error) throw error
      refreshFields()
    } catch (error) {
      console.error('Error deleting field:', error)
      alert('Failed to delete field. Please try again.')
    }
  }

  const handleReorder = async (fieldId: string, direction: 'up' | 'down') => {
    const fieldIndex = fields.findIndex(f => f.id === fieldId)
    if (fieldIndex === -1) return

    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1
    if (newIndex < 0 || newIndex >= fields.length) return

    const field = fields[fieldIndex]
    const swapField = fields[newIndex]

    try {
      await supabase
        .from('fields')
        .update({ order: swapField.order })
        .eq('id', field.id)

      await supabase
        .from('fields')
        .update({ order: field.order })
        .eq('id', swapField.id)

      refreshFields()
    } catch (error) {
      console.error('Error reordering fields:', error)
      alert('Failed to reorder fields. Please try again.')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Form</h1>
        <p className="mt-2 text-gray-600">Manage form settings and fields</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Form Settings</h2>
          <form onSubmit={handleFormUpdate} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Form Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Public URL
              </label>
              <div className="mt-1 flex items-center">
                <span className="text-sm text-gray-500">
                  /form/{form.public_url}
                </span>
                <a
                  href={`/form/${form.public_url}`}
                  target="_blank"
                  className="ml-4 text-sm text-blue-600 hover:text-blue-900"
                >
                  View Form
                </a>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleDeleteForm}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                Delete Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Fields</h2>
            <button
              onClick={() => {
                setEditingField(null)
                setShowFieldEditor(true)
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Field
            </button>
          </div>

          {fields.length > 0 ? (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{field.label}</span>
                      <span className="text-xs text-gray-500">({field.type})</span>
                      {field.required && (
                        <span className="text-xs text-red-600">Required</span>
                      )}
                      {!field.enabled && (
                        <span className="text-xs text-gray-400">Disabled</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReorder(field.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(field.id, 'down')}
                      disabled={index === fields.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEditField(field)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No fields yet. Add your first field to get started.</p>
          )}
        </div>
      </div>

      {showFieldEditor && (
        <FieldEditor
          formId={form.id}
          field={editingField}
          onSave={handleFieldSaved}
          onCancel={() => {
            setShowFieldEditor(false)
            setEditingField(null)
          }}
          nextOrder={fields.length}
        />
      )}
    </div>
  )
}

