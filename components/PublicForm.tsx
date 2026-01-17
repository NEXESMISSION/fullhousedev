'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { ar as t } from '@/lib/translations'
import MediaDisplay from './MediaDisplay'
import LocationPickerFree from './LocationPickerFree'
import { tunisiaGovernorates, tunisiaCities, getCitiesForGovernorate } from '@/lib/tunisia-data'

// Tutorial Video Component
function TutorialVideoDisplay({ videoUrl }: { videoUrl: string }) {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const getVimeoId = (url: string) => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(videoUrl)
  const vimeoId = getVimeoId(videoUrl)

  if (youtubeId) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title="فيديو توضيحي"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (vimeoId) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title="فيديو توضيحي"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black">
      <video src={videoUrl} controls className="w-full h-auto max-h-96">
        متصفحك لا يدعم تشغيل الفيديو
      </video>
    </div>
  )
}

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
  const [submitted, setSubmitted] = useState(false)
  
  // Track which fields should be visible based on conditional logic
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set(fields.map(f => f.id)))

  // Check if a field should be visible based on conditional logic
  const shouldShowField = (field: Field): boolean => {
    // Conditional field: "في صورة نعم، قيمة القسط الشهري" shows only when "هل يوجد قرض حالي؟" is "نعم"
    if (field.label === 'في صورة نعم، قيمة القسط الشهري') {
      const loanField = fields.find(f => f.label === 'هل يوجد قرض حالي؟')
      if (loanField) {
        const loanValue = formData[loanField.id]
        return loanValue === 'نعم'
      }
      return false
    }
    return true
  }

  // Update visible fields when form data changes
  useEffect(() => {
    const visible = new Set<string>()
    fields.forEach(field => {
      if (shouldShowField(field)) {
        visible.add(field.id)
      }
    })
    setVisibleFields(visible)
  }, [formData, fields])

  const handleChange = (fieldId: string, value: string) => {
    const field = fields.find(f => f.id === fieldId)
    
    // Clear city field if governorate changes
    if (field?.label === 'الولاية الحالية') {
      const cityField = fields.find(f => f.label === 'المدينة / المعتمدية')
      if (cityField) {
        setFormData(prev => {
          const newData = { ...prev, [fieldId]: value }
          delete newData[cityField.id]
          return newData
        })
        if (errors[cityField.id]) {
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[cityField.id]
            return newErrors
          })
        }
        return
      }
    }
    
    setFormData({ ...formData, [fieldId]: value })
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' })
    }
    
    // Clear dependent field if parent field changes
    if (field?.label === 'هل يوجد قرض حالي؟' && value !== 'نعم') {
      const dependentField = fields.find(f => f.label === 'في صورة نعم، قيمة القسط الشهري')
      if (dependentField) {
        setFormData(prev => {
          const newData = { ...prev }
          delete newData[dependentField.id]
          return newData
        })
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      // Only validate if field is visible and required
      if (field.required && visibleFields.has(field.id) && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} ${t.requiredField}`
      }

      if (formData[field.id]) {
        const value = formData[field.id].trim()

        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field.id] = t.invalidEmail
        }

        if (field.type === 'number' && isNaN(Number(value))) {
          newErrors[field.id] = t.invalidNumber
        }

        if (field.type === 'phone' && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          newErrors[field.id] = t.invalidPhone
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
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        // @ts-ignore - Supabase type inference issue
        .insert({ form_id: form.id })
        .select()
        .single()

      if (submissionError) throw submissionError

      const submissionTyped = submission as { id: string }
      const submissionValues = fields
        .filter((field) => formData[field.id])
        .map((field) => ({
          submission_id: submissionTyped.id,
          field_id: field.id,
          value: Array.isArray(formData[field.id])
            ? (formData[field.id] as any).join(', ')
            : formData[field.id],
        }))

      if (submissionValues.length > 0) {
        const { error: valuesError } = await supabase
          .from('submission_values')
          // @ts-ignore - Supabase type inference issue
          .insert(submissionValues)

        if (valuesError) throw valuesError
      }

      setSubmitted(true)
    } catch (error: any) {
      console.error('Error submitting form:', error)
      alert(`فشل إرسال النموذج: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  const renderField = (field: Field) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]
    const options = field.options as string[] | null

    const baseInputClass = `mt-2 block w-full rounded-xl border-2 transition-all duration-200 focus:ring-2 focus:ring-offset-0 text-base px-4 py-3 ${
      error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200 bg-white hover:border-gray-300'
    }`

    // Handle dynamic city options based on governorate selection
    let displayOptions = options || []
    if (field.label === 'المدينة / المعتمدية') {
      const currentGovField = fields.find(f => f.label === 'الولاية الحالية')
      if (currentGovField) {
        const selectedGov = formData[currentGovField.id]
        if (selectedGov) {
          const gov = tunisiaGovernorates.find(g => g.name === selectedGov)
          if (gov) {
            displayOptions = tunisiaCities[gov.id] || []
          }
        } else {
          displayOptions = []
        }
      }
    }

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required && visibleFields.has(field.id)}
            rows={5}
            className={baseInputClass}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required && visibleFields.has(field.id)}
            className={baseInputClass}
          >
            <option value="">-- {t.selectForm} --</option>
            {displayOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="mt-2 space-y-3">
            {options?.map((option, index) => {
              const currentValues = (formData[field.id] || '').split(', ').filter(Boolean)
              const isChecked = currentValues.includes(option)
              return (
                <label key={index} className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all bg-white">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v) => v !== option)
                      handleChange(field.id, newValues.join(', '))
                    }}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-3"
                  />
                  <span className="text-gray-900 font-medium">{option}</span>
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
            required={field.required && visibleFields.has(field.id)}
            className={baseInputClass}
          />
        )

      case 'location':
        return (
          <LocationPickerFree
            value={value}
            onChange={(val) => handleChange(field.id, val)}
            required={field.required && visibleFields.has(field.id)}
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
            required={field.required && visibleFields.has(field.id)}
            className={baseInputClass}
          />
        )
    }
  }

  const handleFillAgain = () => {
    setSubmitted(false)
    setFormData({})
    setErrors({})
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Media Display */}
          <MediaDisplay 
            mediaType={form.media_type || 'none'} 
            mediaUrl={form.media_url} 
            formName={form.name}
          />
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{form.name}</h1>
            {form.description && (
              <p className="text-blue-100 text-sm sm:text-base">{form.description}</p>
            )}
            
            {/* Tutorial Video - On top with title and description */}
            {(form as any).tutorial_video_url && (
              <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>🎥</span>
                  <span>فيديو توضيحي</span>
                </h3>
                <TutorialVideoDisplay videoUrl={(form as any).tutorial_video_url} />
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {fields.map((field, index) => {
              // Only render field if it should be visible
              if (!visibleFields.has(field.id)) {
                return null
              }
              
              return (
                <div key={field.id} className="space-y-2">
                  <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700">
                    {field.label}
                    {field.required && visibleFields.has(field.id) && (
                      <span className="text-red-500 mr-1">*</span>
                    )}
                  </label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <span>⚠️</span>
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              )
            })}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t.submitting}</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>{t.submit}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Popup Modal */}
      {submitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleFillAgain}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              تم الإرسال بنجاح!
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              شكراً لك! تم استلام طلبك بنجاح وسنتواصل معك قريباً.
            </p>
            <button
              onClick={handleFillAgain}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ملء النموذج مرة أخرى
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
