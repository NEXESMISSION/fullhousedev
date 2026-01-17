import { createClient } from '@/lib/supabase/server'
import SubmissionsView from '@/components/SubmissionsView'

export default async function SubmissionsPage() {
  const supabase = await createClient()
  
  const { data: forms } = await supabase
    .from('forms')
    .select('id, name')
    .order('name', { ascending: true })

  return <SubmissionsView forms={forms || []} />
}

