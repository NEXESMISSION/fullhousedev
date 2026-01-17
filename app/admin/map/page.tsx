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

  // Get all location values
  const locationData: Array<{
    lat: number
    lng: number
    address?: string
    formName: string
    submissionId: string
    createdAt: string
  }> = []

  if (submissions) {
    for (const submission of submissions) {
      // Get fields for this form
      const { data: fields } = await supabase
        .from('fields')
        .select('id, label, type')
        .eq('form_id', submission.form_id)
        .eq('type', 'location')

      if (fields && fields.length > 0) {
        // Get submission values for location fields
        for (const field of fields) {
          const { data: values } = await supabase
            .from('submission_values')
            .select('value')
            .eq('submission_id', submission.id)
            .eq('field_id', field.id)
            .single()

          if (values?.value) {
            try {
              const location = JSON.parse(values.value)
              if (location.lat && location.lng) {
                locationData.push({
                  lat: location.lat,
                  lng: location.lng,
                  address: location.address,
                  formName: (submission.forms as any)?.name || 'نموذج غير معروف',
                  submissionId: submission.id,
                  createdAt: submission.created_at,
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

