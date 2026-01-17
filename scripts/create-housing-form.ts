/**
 * Script to create the Housing Ownership Request Form for Renters
 * Run this in the browser console when logged in as admin, or create an API route to run it
 */

import { createClient } from '@/lib/supabase/client'
import { tunisiaGovernorates, tunisiaCities } from '@/lib/tunisia-data'

interface FieldDefinition {
  label: string
  type: 'text' | 'number' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date'
  required: boolean
  placeholder?: string
  options?: string[]
  order: number
  section: string
  conditional?: {
    dependsOn: string // field label to depend on
    showWhen: string // value to show when
  }
}

export async function createHousingForm() {
  const supabase = createClient()
  
  // First, create the form
  const formName = 'نموذج طلب امتلاك مسكن (للمكتريين)'
  const publicUrl = `housing-request-${Date.now()}`
  
  const { data: form, error: formError } = await supabase
    .from('forms')
    // @ts-ignore - Supabase type inference issue
    .insert({
      name: formName,
      description: 'نموذج شامل لطلب امتلاك مسكن للمستأجرين',
      status: 'active',
      public_url: publicUrl,
      media_type: 'none',
    })
    .select()
    .single()

  if (formError) {
    console.error('Error creating form:', formError)
    return { error: formError }
  }

  const formTypedForLog = form as { id: string; public_url: string }
  console.log('Form created:', formTypedForLog.id, formTypedForLog.public_url)

  // Define all fields
  const fields: FieldDefinition[] = [
    // Section 1: Personal Information
    { label: 'الاسم الكامل', type: 'text', required: true, placeholder: 'أدخل اسمك الكامل', order: 1, section: 'personal' },
    { label: 'رقم الهاتف', type: 'phone', required: true, placeholder: '+216 XX XXX XXX', order: 2, section: 'personal' },
    { label: 'البريد الإلكتروني', type: 'email', required: true, placeholder: 'example@email.com', order: 3, section: 'personal' },
    { 
      label: 'الحالة العائلية', 
      type: 'select', 
      required: true, 
      options: ['أعزب', 'متزوج', 'مطلق', 'أرمل'], 
      order: 4, 
      section: 'personal' 
    },
    { label: 'عدد أفراد الأسرة', type: 'number', required: true, placeholder: 'عدد أفراد الأسرة', order: 5, section: 'personal' },

    // Section 2: Current Housing Information
    { 
      label: 'الولاية الحالية', 
      type: 'select', 
      required: true, 
      options: tunisiaGovernorates.map(g => g.name), 
      order: 6, 
      section: 'current' 
    },
    { 
      label: 'المدينة / المعتمدية', 
      type: 'select', 
      required: true, 
      options: [], // Will be populated dynamically
      order: 7, 
      section: 'current',
      conditional: { dependsOn: 'الولاية الحالية', showWhen: 'any' }
    },
    { 
      label: 'نوع السكن الحالي', 
      type: 'select', 
      required: true, 
      options: ['كراء', 'سكن عائلي', 'سكن وظيفي'], 
      order: 8, 
      section: 'current' 
    },
    { label: 'قيمة الكراء الشهري', type: 'number', required: true, placeholder: 'بالدينار التونسي', order: 9, section: 'current' },
    { 
      label: 'مدة الكراء الحالية', 
      type: 'select', 
      required: true, 
      options: ['أقل من سنة', '1–3 سنوات', 'أكثر من 3 سنوات'], 
      order: 10, 
      section: 'current' 
    },

    // Section 3: Desired Future Housing
    { 
      label: 'الولاية المرغوبة لاقتناء المسكن', 
      type: 'select', 
      required: true, 
      options: tunisiaGovernorates.map(g => g.name), 
      order: 11, 
      section: 'desired' 
    },
    { 
      label: 'المدينة / المنطقة المرغوبة', 
      type: 'text', 
      required: true, 
      placeholder: 'أدخل المدينة أو المنطقة', 
      order: 12, 
      section: 'desired' 
    },
    { 
      label: 'نوع المسكن المطلوب', 
      type: 'checkbox', 
      required: true, 
      options: ['شقة', 'منزل', 'فيلا', 'قطعة أرض'], 
      order: 13, 
      section: 'desired' 
    },
    { 
      label: 'الغرض من السكن', 
      type: 'select', 
      required: true, 
      options: ['سكن شخصي', 'استثمار', 'الاثنين'], 
      order: 14, 
      section: 'desired' 
    },

    // Section 4: Budget and Financial Capacity
    { label: 'الميزانية القصوى المتوقعة', type: 'number', required: true, placeholder: 'بالدينار التونسي', order: 15, section: 'budget' },
    { 
      label: 'طريقة التمويل', 
      type: 'checkbox', 
      required: true, 
      options: ['تمويل بنكي', 'دفع ذاتي', 'الاثنين'], 
      order: 16, 
      section: 'budget' 
    },
    { label: 'الدخل الشهري التقريبي', type: 'number', required: true, placeholder: 'بالدينار التونسي', order: 17, section: 'budget' },
    { 
      label: 'هل يوجد قرض حالي؟', 
      type: 'select', 
      required: true, 
      options: ['نعم', 'لا'], 
      order: 18, 
      section: 'budget' 
    },
    { 
      label: 'في صورة نعم، قيمة القسط الشهري', 
      type: 'number', 
      required: false, 
      placeholder: 'بالدينار التونسي', 
      order: 19, 
      section: 'budget',
      conditional: { dependsOn: 'هل يوجد قرض حالي؟', showWhen: 'نعم' }
    },

    // Section 5: Readiness and Seriousness
    { 
      label: 'متى تنوي اقتناء المسكن؟', 
      type: 'select', 
      required: true, 
      options: ['أقل من 6 أشهر', '6–12 شهر', 'أكثر من سنة'], 
      order: 20, 
      section: 'readiness' 
    },
    { 
      label: 'هل سبق لك التقدم بطلب تمويل؟', 
      type: 'select', 
      required: true, 
      options: ['نعم', 'لا'], 
      order: 21, 
      section: 'readiness' 
    },
    { 
      label: 'هل ترغب في التواصل مع مستشار؟', 
      type: 'select', 
      required: true, 
      options: ['نعم', 'لا'], 
      order: 22, 
      section: 'readiness' 
    },

    // Section 6: Additional Information
    { 
      label: 'متطلبات خاصة (قرب مدارس، نقل، عمل…)', 
      type: 'textarea', 
      required: false, 
      placeholder: 'اذكر أي متطلبات خاصة', 
      order: 23, 
      section: 'additional' 
    },
    { 
      label: 'ملاحظات إضافية', 
      type: 'textarea', 
      required: false, 
      placeholder: 'أي ملاحظات أخرى', 
      order: 24, 
      section: 'additional' 
    },
  ]

  // Insert all fields
  const fieldsToInsert = fields.map(field => ({
    form_id: formTypedForLog.id,
    label: field.label,
    type: field.type,
    required: field.required,
    placeholder: field.placeholder || null,
    options: field.options ? field.options : null,
    order: field.order,
    enabled: true,
  }))

  const { data: createdFields, error: fieldsError } = await supabase
    .from('fields')
    // @ts-ignore - Supabase type inference issue
    .insert(fieldsToInsert)
    .select()

  if (fieldsError) {
    console.error('Error creating fields:', fieldsError)
    return { error: fieldsError, form }
  }

  console.log(`Created ${createdFields?.length || 0} fields`)

  const formTypedForReturn = form as { id: string; public_url: string }
  return {
    success: true,
    form,
    fields: createdFields,
    publicUrl: `/form/${formTypedForReturn.public_url}`,
  }
}

// Export for use in admin page or API route
export default createHousingForm

