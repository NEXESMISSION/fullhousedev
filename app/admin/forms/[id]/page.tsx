import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormEditor from '@/components/FormEditor'

// Force dynamic rendering for pages that use cookies/authentication
export const dynamic = 'force-dynamic'

export default async function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    // Handle NOT_FOUND or other expected errors gracefully
    if (formError) {
      const isNotFoundError = formError.code === 'PGRST116' || 
                              formError.code === 'NOT_FOUND' ||
                              formError.message?.toLowerCase().includes('not found')
      
      if (isNotFoundError || !form) {
        notFound()
      }
      
      // Log unexpected errors
      console.error('[Edit Form] Error loading form:', {
        message: formError.message,
        code: formError.code,
        id: id,
      })
      notFound()
    }

    if (!form) {
      notFound()
    }

    const { data: fields, error: fieldsError } = await supabase
      .from('fields')
      .select('*')
      .eq('form_id', id)
      .order('order', { ascending: true })

    if (fieldsError) {
      console.error('[Edit Form] Error loading fields:', fieldsError)
    }

    return <FormEditor form={form} initialFields={fields || []} />
  } catch (error) {
    console.error('[Edit Form] Unexpected error:', error)
    notFound()
  }
}

