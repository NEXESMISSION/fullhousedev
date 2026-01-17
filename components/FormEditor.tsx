'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FieldEditor from './FieldEditor'
import type { Database } from '@/lib/supabase/database.types'
import { ar as t } from '@/lib/translations'

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
    media_type: (form.media_type || 'none') as 'none' | 'image' | 'video' | 'logo',
    media_url: form.media_url || '',
    tutorial_video_url: (form as any).tutorial_video_url || '',
  })
  const [showFieldEditor, setShowFieldEditor] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)

  const handleFormUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('forms')
        // @ts-ignore - Supabase type inference issue
        .update({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          media_type: formData.media_type,
          media_url: formData.media_url || null,
          tutorial_video_url: formData.tutorial_video_url || null,
        })
        .eq('id', form.id)

      if (error) throw error
      alert(t.formUpdated)
    } catch (error: any) {
      console.error('Error updating form:', error)
      alert(`${t.formUpdateFailed}: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteForm = async () => {
    if (!confirm(t.confirmDeleteForm)) return

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', form.id)

      if (error) throw error
      router.push('/admin/forms')
    } catch (error: any) {
      console.error('Error deleting form:', error)
      alert(`${t.formDeleteFailed}: ${error?.message || 'خطأ غير معروف'}`)
    }
  }

  const refreshFields = async () => {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('form_id', form.id)
      .order('order', { ascending: true })
    
    if (!error && data) {
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
    if (!confirm(t.confirmDeleteField)) return

    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId)

      if (error) throw error
      refreshFields()
    } catch (error: any) {
      console.error('Error deleting field:', error)
      alert(`${t.fieldDeleteFailed}: ${error?.message || 'خطأ غير معروف'}`)
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
      await (supabase.from('fields') as any).update({ order: swapField.order }).eq('id', field.id)
      await (supabase.from('fields') as any).update({ order: field.order }).eq('id', swapField.id)
      refreshFields()
    } catch (error) {
      console.error('Error reordering fields:', error)
      alert('فشل إعادة ترتيب الحقول')
    }
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="mb-3 sm:mb-6">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">{t.editForm}</h1>
        <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600">{t.manageFormSettings}</p>
      </div>

      {/* Form Settings Card */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 p-3 sm:p-6 md:p-8">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-6 text-gray-900">{t.formSettings}</h2>
        <form onSubmit={handleFormUpdate} className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                {t.formName} *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.formNamePlaceholder}
                className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm md:text-base transition-all"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                {t.status}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm md:text-base transition-all bg-white"
              >
                <option value="draft">{t.draft}</option>
                <option value="active">{t.active}</option>
                <option value="disabled">{t.disabled}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t.description}
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.descriptionPlaceholder}
              className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm md:text-base transition-all resize-none"
            />
          </div>

          {/* Media Settings */}
          <div className="border-t border-gray-200 pt-3 sm:pt-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">{t.mediaSettings}</h3>
            <div className="space-y-2 sm:space-y-4">
              <div>
                <label htmlFor="media_type" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  {t.mediaType}
                </label>
                <select
                  id="media_type"
                  value={formData.media_type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    media_type: e.target.value as any,
                    media_url: e.target.value === 'none' ? '' : formData.media_url
                  })}
                  className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm md:text-base transition-all bg-white"
                >
                  <option value="none">{t.noMedia}</option>
                  <option value="logo">{t.logo}</option>
                  <option value="image">{t.image}</option>
                  <option value="video">{t.video}</option>
                </select>
              </div>

              {formData.media_type !== 'none' && (
                <div>
                  <label htmlFor="media_url" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    {t.mediaUrl}
                  </label>
                  <input
                    type="url"
                    id="media_url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    placeholder={t.mediaUrlPlaceholder}
                    className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm md:text-base transition-all"
                  />
                  {formData.media_url && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">معاينة:</p>
                      {formData.media_type === 'image' || formData.media_type === 'logo' ? (
                        <img 
                          src={formData.media_url} 
                          alt="Preview" 
                          className="max-w-full h-32 object-contain rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : formData.media_type === 'video' && (
                        <div className="text-xs text-gray-500">
                          سيتم عرض الفيديو في صفحة النموذج
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tutorial Video Link */}
          <div className="border-t border-gray-200 pt-3 sm:pt-6">
            <label htmlFor="tutorial_video_url" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              رابط فيديو توضيحي (اختياري)
            </label>
            <input
              type="url"
              id="tutorial_video_url"
              value={formData.tutorial_video_url}
              onChange={(e) => setFormData({ ...formData, tutorial_video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... أو رابط فيديو آخر"
              className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm md:text-base transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">رابط فيديو يوضح كيفية ملء النموذج (YouTube, Vimeo, إلخ)</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              {t.publicUrlLabel}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-xs sm:text-sm text-gray-600 font-mono break-all">/form/{form.public_url}</span>
              <a
                href={`/form/${form.public_url}`}
                target="_blank"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <span>🔗</span>
                {t.viewForm}
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDeleteForm}
              className="px-3 sm:px-6 py-2 sm:py-3 border-2 border-red-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-red-700 bg-white hover:bg-red-50 transition-all"
            >
              {t.deleteForm}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? t.loading : t.saveChanges}
            </button>
          </div>
        </form>
      </div>

      {/* Fields Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t.fields}</h2>
          <button
            onClick={() => {
              setEditingField(null)
              setShowFieldEditor(true)
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>➕</span>
            {t.addField}
          </button>
        </div>

        {fields.length > 0 ? (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all gap-3"
              >
                <div className="flex-1 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-base font-semibold text-gray-900">{field.label}</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">{field.type}</span>
                  {field.required && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg">{t.required}</span>
                  )}
                  {!field.enabled && (
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-500 rounded-lg">{t.disabled}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReorder(field.id, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-all"
                    title={t.moveUp}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleReorder(field.id, 'down')}
                    disabled={index === fields.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-all"
                    title={t.moveDown}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleEditField(field)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => handleDeleteField(field.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                  >
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">{t.noFieldsMessage}</p>
          </div>
        )}
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
