import { createPublicClient } from '@/lib/supabase/public-client'
import { notFound } from 'next/navigation'
import PublicForm from '@/components/PublicForm'

// Force dynamic rendering for dynamic routes
export const dynamic = 'force-dynamic'

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = createPublicClient()
    
    console.log('[Public Form] Loading form with slug:', slug)
    
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('public_url', slug)
      .eq('status', 'active')
      .maybeSingle()

    // Handle missing form gracefully - maybeSingle returns null instead of error
    if (formError) {
      // Only log unexpected errors (404/PGRST116/NOT_FOUND is expected when form doesn't exist)
      const isNotFoundError = formError.code === 'PGRST116' || 
                              formError.code === 'NOT_FOUND' ||
                              formError.message?.toLowerCase().includes('not found') ||
                              formError.message?.toLowerCase().includes('no rows returned')
      
      if (!isNotFoundError) {
        console.error('[Public Form] Error loading form:', {
          message: formError.message,
          code: formError.code,
          slug: slug,
        })
      }
      notFound()
    }

    if (!form) {
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
  } catch (error) {
    console.error('[Public Form] Unexpected error:', error)
    // If there's an unexpected error (like missing env vars), show 404
    notFound()
  }
}

