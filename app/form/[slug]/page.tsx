import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicForm from '@/components/PublicForm'

export default async function PublicFormPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('public_url', params.slug)
    .eq('status', 'active')
    .single()

  if (error || !form) {
    notFound()
  }

  const { data: fields } = await supabase
    .from('fields')
    .select('*')
    .eq('form_id', form.id)
    .eq('enabled', true)
    .order('order', { ascending: true })

  return <PublicForm form={form} fields={fields || []} />
}

