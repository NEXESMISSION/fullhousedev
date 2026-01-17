'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { tunisiaGovernorates, tunisiaCities } from '@/lib/tunisia-data'
import { Database } from '@/lib/supabase/database.types'

type FormInsert = Database['public']['Tables']['forms']['Insert']

export default function CreateHousingFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formUrl, setFormUrl] = useState('')

  const handleCreate = async () => {
    setLoading(true)
    setSuccess(false)

    try {
      const supabase = createClient()
      // Create the form
      const formName = 'نموذج طلب امتلاك مسكن (للمكتريين)'
      const publicUrl = `housing-request-${Date.now()}`

      const formData: FormInsert = {
        name: formName,
        description: 'نموذج شامل لطلب امتلاك مسكن للمستأجرين',
        status: 'active',
        public_url: publicUrl,
        media_type: 'none',
      }

      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert(formData as any)
        .select()
        .single() as { data: { id: string } | null; error: any }

      if (formError || !form) throw formError || new Error('Failed to create form')
      
      const createdForm = form as { id: string; public_url: string }

      // Define all fields
      const fields = [
        // Section 1: Personal Information
        { label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل اسمك الكامل', order: 1 },
        { label: 'رقم الهاتف', type: 'phone', required: true, placeholder: '+216 XX XXX XXX', order: 2 },
        { label: 'البريد الإلكتروني', type: 'email', required: true, placeholder: 'example@email.com', order: 3 },
        { label: 'الحالة العائلية', type: 'select', required: true, options: ['أعزب', 'متزوج', 'مطلق', 'أرمل'], order: 4 },
        { label: 'عدد أفراد الأسرة', type: 'number', required: true, placeholder: 'عدد أفراد الأسرة', order: 5 },

        // Section 2: Current Housing Information
        { label: 'موقع السكن الحالي', type: 'location', required: true, placeholder: 'اضغط على الخريطة لتحديد موقع سكنك الحالي بدقة', order: 6 },
        { label: 'نوع السكن الحالي', type: 'select', required: true, options: ['كراء', 'سكن عائلي', 'سكن وظيفي'], order: 7 },
        { label: 'قيمة الكراء الشهري', type: 'number', required: true, placeholder: 'بالدينار التونسي', order: 8 },
        { label: 'مدة الكراء الحالية', type: 'select', required: true, options: ['أقل من سنة', '1–3 سنوات', 'أكثر من 3 سنوات'], order: 9 },

        // Section 3: Desired Future Housing
        { label: 'الموقع المرغوب لاقتناء المسكن', type: 'location', required: true, placeholder: 'اضغط على الخريطة لتحديد الموقع المرغوب لاقتناء المسكن بدقة', order: 10 },
        { label: 'نوع المسكن المطلوب', type: 'checkbox', required: true, options: ['شقة', 'منزل', 'فيلا', 'قطعة أرض'], order: 11 },
        { label: 'الغرض من السكن', type: 'select', required: true, options: ['سكن شخصي', 'استثمار', 'الاثنين'], order: 12 },

        // Section 4: Budget and Financial Capacity
        { label: 'الميزانية القصوى المتوقعة', type: 'number', required: true, placeholder: 'بالدينار التونسي', order: 13 },
        { label: 'طريقة التمويل', type: 'checkbox', required: true, options: ['تمويل بنكي', 'دفع ذاتي', 'الاثنين'], order: 14 },
        { label: 'الدخل الشهري التقريبي', type: 'number', required: true, placeholder: 'بالدينار التونسي', order: 15 },
        { label: 'هل يوجد قرض حالي؟', type: 'select', required: true, options: ['نعم', 'لا'], order: 16 },
        { label: 'في صورة نعم، قيمة القسط الشهري', type: 'number', required: false, placeholder: 'بالدينار التونسي', order: 17 },

        // Section 5: Readiness and Seriousness
        { label: 'متى تنوي اقتناء المسكن؟', type: 'select', required: true, options: ['أقل من 6 أشهر', '6–12 شهر', 'أكثر من سنة'], order: 18 },
        { label: 'هل سبق لك التقدم بطلب تمويل؟', type: 'select', required: true, options: ['نعم', 'لا'], order: 19 },
        { label: 'هل ترغب في التواصل مع مستشار؟', type: 'select', required: true, options: ['نعم', 'لا'], order: 20 },

        // Section 6: Additional Information
        { label: 'متطلبات خاصة (قرب مدارس، نقل، عمل…)', type: 'textarea', required: false, placeholder: 'اذكر أي متطلبات خاصة', order: 21 },
        { label: 'ملاحظات إضافية', type: 'textarea', required: false, placeholder: 'أي ملاحظات أخرى', order: 22 },
      ]

      // Insert all fields
      const fieldsToInsert = fields.map((field: any) => ({
        form_id: createdForm.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || null,
        options: field.options || null,
        order: field.order,
        enabled: true,
      }))

      const { error: fieldsError } = await supabase
        .from('fields')
        .insert(fieldsToInsert as any)

      if (fieldsError) throw fieldsError

      setSuccess(true)
      setFormUrl(`/form/${createdForm.public_url}`)
      
      // Redirect to form editor after 2 seconds
      setTimeout(() => {
        router.push(`/admin/forms/${createdForm.id}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error creating form:', error)
      alert(`فشل إنشاء النموذج: ${error?.message || 'خطأ غير معروف'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إنشاء نموذج طلب امتلاك مسكن</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">سيتم إنشاء نموذج شامل لطلب امتلاك مسكن للمستأجرين</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8">
        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">تم إنشاء النموذج بنجاح!</h2>
            <p className="text-gray-600 mb-6">سيتم توجيهك إلى صفحة تعديل النموذج...</p>
            <a
              href={formUrl}
              target="_blank"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
            >
              عرض النموذج العام
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">محتوى النموذج:</h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>المعلومات الشخصية (7 حقول - مع الفئة العمرية والمهنة)</li>
                <li>معلومات السكن الحالي (6 حقول - مع التحديات وسبب الانتقال)</li>
                <li>الرغبة في السكن المستقبلي (6 حقول - مع الأولويات والمساحة)</li>
                <li>الميزانية والقدرة المالية (6 حقول - مع نسبة الدفعة الأولى)</li>
                <li>الجاهزية والجدية (4 حقول - مع طريقة التواصل المفضلة)</li>
                <li>معلومات إضافية (2 حقول)</li>
                <li className="mt-2 font-semibold text-blue-900">المجموع: 31 حقل (30 حقل + 2 خرائط تفاعلية)</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء النموذج'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
