import { createPublicClient } from '@/lib/supabase/public-client'
import { notFound } from 'next/navigation'
import PublicForm from '@/components/PublicForm'

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createPublicClient()
  
  console.log('[Public Form] Loading form with slug:', slug)
  
  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('public_url', slug)
    .eq('status', 'active')
    .single()

  if (formError) {
    console.error('[Public Form] Error loading form:', {
      message: formError.message,
      details: formError.details,
      code: formError.code,
      slug: slug,
    })
    notFound()
  }

  if (!form) {
    console.log('[Public Form] Form not found for slug:', slug)
    notFound()
  }

  const formTyped = form as { id: string; name: string }
  console.log('[Public Form] Form found:', formTyped.id, formTyped.name)

  const { data: fields, error: fieldsError } = await supabase
    .from('fields')
    .select('*')
    .eq('form_id', formTyped.id)
    .eq('enabled', true)
    .order('order', { ascending: true })

  if (fieldsError) {
    console.error('[Public Form] Error loading fields:', fieldsError)
  }

  console.log('[Public Form] Loaded fields:', fields?.length || 0)

  return <PublicForm form={formTyped as any} fields={(fields || []) as any} />
}

