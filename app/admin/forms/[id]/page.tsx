import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormEditor from '@/components/FormEditor'

export default async function EditFormPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: form, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !form) {
    notFound()
  }

  const { data: fields } = await supabase
    .from('fields')
    .select('*')
    .eq('form_id', params.id)
    .order('order', { ascending: true })

  return <FormEditor form={form} initialFields={fields || []} />
}

