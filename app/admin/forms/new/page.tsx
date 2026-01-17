'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ar as t } from '@/lib/translations'

// Form templates
const formTemplates = {
  housing: {
    name: 'نموذج طلب امتلاك مسكن',
    description: 'نموذج شامل لجمع معلومات المستأجرين الراغبين في امتلاك مسكن',
    fields: [
      { label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل اسمك الكامل' },
      { label: 'رقم الهاتف', type: 'phone', required: true, placeholder: '+216 XX XXX XXX' },
      { label: 'البريد الإلكتروني', type: 'email', required: true, placeholder: 'example@email.com' },
      { label: 'الفئة العمرية', type: 'select', required: true, options: ['أقل من 25', '25-35', '36-45', '46-55', 'أكثر من 55'] },
      { label: 'الحالة العائلية', type: 'select', required: true, options: ['أعزب', 'متزوج', 'مطلق', 'أرمل'] },
      { label: 'عدد أفراد الأسرة', type: 'number', required: true, placeholder: 'عدد أفراد الأسرة' },
      { label: 'المهنة / القطاع', type: 'select', required: true, options: ['موظف حكومي', 'موظف خاص', 'صاحب عمل', 'طالب', 'متقاعد', 'غير ذلك'] },
      { label: 'موقع السكن الحالي', type: 'location', required: true, placeholder: 'اضغط على الخريطة لتحديد موقع سكنك الحالي' },
      { label: 'نوع السكن الحالي', type: 'select', required: true, options: ['كراء', 'سكن عائلي', 'سكن وظيفي'] },
      { label: 'قيمة الكراء الشهري', type: 'number', required: true, placeholder: 'بالدينار التونسي' },
      { label: 'الموقع المرغوب لاقتناء المسكن', type: 'location', required: true, placeholder: 'اضغط على الخريطة لتحديد الموقع المرغوب' },
      { label: 'نوع المسكن المطلوب', type: 'checkbox', required: true, options: ['شقة', 'منزل', 'فيلا', 'قطعة أرض'] },
      { label: 'الميزانية القصوى المتوقعة', type: 'number', required: true, placeholder: 'بالدينار التونسي' },
      { label: 'طريقة التمويل', type: 'checkbox', required: true, options: ['تمويل بنكي', 'دفع ذاتي', 'الاثنين'] },
      { label: 'الدخل الشهري التقريبي', type: 'number', required: true, placeholder: 'بالدينار التونسي' },
      { label: 'هل يوجد قرض حالي؟', type: 'select', required: true, options: ['نعم', 'لا'] },
      { label: 'متى تنوي اقتناء المسكن؟', type: 'select', required: true, options: ['فوراً', 'خلال 6 أشهر', 'خلال سنة', 'أكثر من سنة'] },
      { label: 'هل ترغب في التواصل مع مستشار؟', type: 'select', required: true, options: ['نعم', 'لا'] },
      { label: 'ملاحظات إضافية', type: 'textarea', required: false, placeholder: 'أي ملاحظات أخرى' },
    ]
  },
  contact: {
    name: 'نموذج تواصل',
    description: 'نموذج بسيط لجمع معلومات التواصل من العملاء',
    fields: [
      { label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل اسمك الكامل' },
      { label: 'البريد الإلكتروني', type: 'email', required: true, placeholder: 'example@email.com' },
      { label: 'رقم الهاتف', type: 'phone', required: true, placeholder: '+216 XX XXX XXX' },
      { label: 'الموضوع', type: 'select', required: true, options: ['استفسار', 'شكوى', 'اقتراح', 'طلب خدمة'] },
      { label: 'الرسالة', type: 'textarea', required: true, placeholder: 'اكتب رسالتك هنا' },
    ]
  },
  jobApplication: {
    name: 'نموذج طلب توظيف',
    description: 'نموذج شامل لطلبات التوظيف',
    fields: [
      { label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل اسمك الكامل' },
      { label: 'البريد الإلكتروني', type: 'email', required: true, placeholder: 'example@email.com' },
      { label: 'رقم الهاتف', type: 'phone', required: true, placeholder: '+216 XX XXX XXX' },
      { label: 'العنوان', type: 'text', required: true, placeholder: 'العنوان الكامل' },
      { label: 'المؤهل العلمي', type: 'select', required: true, options: ['ثانوي', 'بكالوريوس', 'ماستر', 'دكتوراه'] },
      { label: 'سنوات الخبرة', type: 'number', required: true, placeholder: 'عدد سنوات الخبرة' },
      { label: 'الوظيفة المطلوبة', type: 'text', required: true, placeholder: 'اسم الوظيفة' },
      { label: 'المهارات', type: 'textarea', required: true, placeholder: 'اذكر مهاراتك الرئيسية' },
      { label: 'ملاحظات إضافية', type: 'textarea', required: false, placeholder: 'أي معلومات إضافية' },
    ]
  }
}

export default function NewFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'manual' | 'template'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof formTemplates | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as 'draft' | 'active' | 'disabled',
    media_type: 'none' as 'none' | 'image' | 'video' | 'logo',
    media_url: '',
  })

  const generatePublicUrl = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleTemplateSelect = async (templateKey: keyof typeof formTemplates) => {
    const template = formTemplates[templateKey]
    setSelectedTemplate(templateKey)
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const publicUrl = generatePublicUrl()
      const payload = {
        ...formData,
        public_url: publicUrl,
        media_url: formData.media_url || null,
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert(payload as any)
        .select()
        .single()

      if (formError) {
        console.error('[Form Creation] Error:', formError)
        alert(`فشل إنشاء النموذج: ${formError.message || 'خطأ غير معروف'}`)
        return
      }

      if (!form) {
        alert('فشل إنشاء النموذج')
        return
      }

      const createdForm = form as { id: string }

      // If a template is selected, create the fields
      if (selectedTemplate && mode === 'template') {
        const template = formTemplates[selectedTemplate]
        const fieldsToInsert = template.fields.map((field, index) => ({ 
          form_id: createdForm.id,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder || null,
          options: field.options ? JSON.stringify(field.options) : null,
          order: index + 1,
          enabled: true,
        }))

        const { error: fieldsError } = await supabase
          .from('fields')
          .insert(fieldsToInsert as any)

        if (fieldsError) {
          console.error('[Fields Creation] Error:', fieldsError)
          alert(`تم إنشاء النموذج ولكن فشل إضافة الحقول: ${fieldsError.message}`)
          router.push(`/admin/forms/${createdForm.id}`)
          return
        }
      }

      router.push(`/admin/forms/${createdForm.id}`)
    } catch (error: any) {
      console.error('[Form Creation] Error caught:', error)
      alert(`فشل إنشاء النموذج: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.createNewForm}</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">اختر قالباً جاهزاً أو أنشئ نموذجاً من الصفر</p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('template')
              setSelectedTemplate(null)
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              mode === 'template'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            من قالب جاهز
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('manual')
              setSelectedTemplate(null)
            }}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              mode === 'manual'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            إنشاء يدوي
          </button>
        </div>

        {mode === 'template' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(formTemplates).map(([key, template]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleTemplateSelect(key as keyof typeof formTemplates)}
                className={`p-6 rounded-xl border-2 transition-all text-right ${
                  selectedTemplate === key
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <p className="text-xs text-gray-500">
                    {template.fields.length} حقل
                  </p>
                </div>
                {selectedTemplate === key && (
                  <div className="text-blue-600 text-sm font-semibold">✓ محدّد</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form Creation Form */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.formName} *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.formNamePlaceholder}
                className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-base transition-all"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                {t.status}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-base transition-all bg-white"
              >
                <option value="draft">{t.draft}</option>
                <option value="active">{t.active}</option>
                <option value="disabled">{t.disabled}</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.description}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.descriptionPlaceholder}
              rows={3}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 text-base transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الإنشاء...' : mode === 'template' && selectedTemplate ? `إنشاء النموذج من قالب ${formTemplates[selectedTemplate].name}` : 'إنشاء النموذج'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}