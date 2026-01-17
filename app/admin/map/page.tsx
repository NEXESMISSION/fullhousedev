import { createClient } from '@/lib/supabase/server'
import TunisiaMapFree from '@/components/TunisiaMapFree'

export default async function MapPage() {
  try {
    const supabase = await createClient()

    // Get all submissions with location fields
    const { data: submissions, error: submissionsError } = await supabase
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

    if (submissionsError) {
      console.error('[Map Page] Error loading submissions:', submissionsError)
    }

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
      const { data: fields, error: fieldsError } = await supabase
        .from('fields')
        .select('id, label, type')
        .eq('form_id', submissionTyped.form_id)
        .eq('type', 'location')

      if (fieldsError) {
        console.error('[Map Page] Error loading fields:', fieldsError)
        continue
      }

      if (fields && fields.length > 0) {
        // Get submission values for location fields
        for (const field of fields) {
          const fieldTyped = field as { id: string; label: string } 
          const { data: values, error: valuesError } = await supabase
            .from('submission_values')
            .select('value')
            .eq('submission_id', submissionTyped.id)
            .eq('field_id', fieldTyped.id)
            .maybeSingle()

          if (valuesError) {
            console.error('[Map Page] Error loading submission values:', valuesError)
            continue
          }

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
  } catch (error) {
    console.error('[Map Page] Unexpected error:', error)
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-red-800 mb-4">حدث خطأ في تحميل الخريطة. يرجى المحاولة مرة أخرى.</p>
          <TunisiaMapFree locations={[]} />
        </div>
      </div>
    )
  }
}

