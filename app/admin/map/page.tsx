import { createClient } from '@/lib/supabase/server'
import TunisiaMapFree from '@/components/TunisiaMapFree'

export default async function MapPage() {
  const supabase = await createClient()

  // Get all submissions with location fields
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id,
      created_at,
      form_id,
      forms:form_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Get all location values with field labels
  const locationData: Array<{
    lat: number
    lng: number
    address?: string
    formName: string
    submissionId: string
    createdAt: string
    fieldLabel: string
  }> = []

  if (submissions) {
    for (const submission of submissions) {
      // Get fields for this form
      const submissionTyped = submission as { form_id: string; id: string; created_at: string; forms?: any }
      const { data: fields } = await supabase
        .from('fields')
        .select('id, label, type')
        .eq('form_id', submissionTyped.form_id)
        .eq('type', 'location')

      if (fields && fields.length > 0) {
        // Get submission values for location fields
        for (const field of fields) {
          const fieldTyped = field as { id: string; label: string } 
          const { data: values } = await supabase
            .from('submission_values')
            .select('value')
            .eq('submission_id', submissionTyped.id)
            .eq('field_id', fieldTyped.id)
            .single()

          const valuesTyped = values as { value: string } | null
          if (valuesTyped?.value) {
            try {
              const location = JSON.parse(valuesTyped.value)
              if (location.lat && location.lng) {
                locationData.push({
                  lat: location.lat,
                  lng: location.lng,
                  address: location.address,
                  formName: submissionTyped.forms?.name || 'نموذج غير معروف',
                  submissionId: submissionTyped.id,
                  createdAt: submissionTyped.created_at,
                  fieldLabel: fieldTyped.label,
                })
              }
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      }
    }
  }

  return <TunisiaMapFree locations={locationData} />
}

