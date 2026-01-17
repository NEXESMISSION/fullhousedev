'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SubmissionCount({ formId }: { formId: string }) {
  const [count, setCount] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadCount = async () => {
      const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId)

      setCount(count || 0)
    }

    loadCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId])

  if (count === null) {
    return <span className="text-gray-400">-</span>
  }

  return <span>{count}</span>
}

