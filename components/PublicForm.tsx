'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Form = Database['public']['Tables']['forms']['Row']
type Field = Database['public']['Tables']['fields']['Row']

interface PublicFormProps {
  form: Form
  fields: Field[]
}

export default function PublicForm({ form, fields }: PublicFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (fieldId: string, value: string) => {
    setFormData({ ...formData, [fieldId]: value })
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`
      }

      if (formData[field.id]) {
        const value = formData[field.id].trim()

        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.id] = 'Please enter a valid email address'
        }

        if (field.type === 'number' && isNaN(Number(value))) {
          newErrors[field.id] = 'Please enter a valid number'
        }

        if (field.type === 'phone' && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          newErrors[field.id] = 'Please enter a valid phone number'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      // Create submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({ form_id: form.id })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Create submission values
      const submissionValues = fields
        .filter((field) => formData[field.id])
        .map((field) => ({
          submission_id: submission.id,
          field_id: field.id,
          value: Array.isArray(formData[field.id])
            ? (formData[field.id] as any).join(', ')
            : formData[field.id],
        }))

      if (submissionValues.length > 0) {
        const { error: valuesError } = await supabase
          .from('submission_values')
          .insert(submissionValues)

        if (valuesError) throw valuesError
      }

      alert('Form submitted successfully! Thank you.')
      router.push('/')
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: Field) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]
    const options = field.options as string[] | null

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            rows={4}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${
              error ? 'border-red-500' : ''
            }`}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${
              error ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select an option...</option>
            {options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="mt-1 space-y-2">
            {options?.map((option, index) => {
              const currentValues = (formData[field.id] || '').split(', ').filter(Boolean)
              const isChecked = currentValues.includes(option)
              return (
                <label key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option)
                      handleChange(field.id, newValues.join(', '))
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              )
            })}
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${
              error ? 'border-red-500' : ''
            }`}
          />
        )

      default:
        return (
          <input
            type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border ${
              error ? 'border-red-500' : ''
            }`}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.name}</h1>
          {form.description && (
            <p className="text-gray-600 mb-8">{form.description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
                )}
              </div>
            ))}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

