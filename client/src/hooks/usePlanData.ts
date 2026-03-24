import { useState, useEffect, useCallback } from 'react'
import { usePlanStore } from '@/stores/planStore'
import { planService } from '@/services/planService'

import type { Plan } from '@/types'

interface UsePlanDataReturn {
  activePlan: Plan | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePlanData(): UsePlanDataReturn {
  const { activePlan, setActivePlan, setLoading, setError } = usePlanStore()
  const [isLoading, setIsLoadingLocal] = useState(false)
  const [error, setErrorLocal] = useState<string | null>(null)

  const fetchActivePlan = useCallback(async () => {
    setIsLoadingLocal(true)
    setErrorLocal(null)
    setLoading(true)

    try {
      const plans = await planService.getPlans()
      const active = plans.find((p) => p.isActive)
      setActivePlan(active ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plan'
      setErrorLocal(message)
      setError(message)
    } finally {
      setIsLoadingLocal(false)
      setLoading(false)
    }
  }, [setActivePlan, setLoading, setError])

  useEffect(() => {
    fetchActivePlan()
  }, [fetchActivePlan])

  return { activePlan, isLoading, error, refetch: fetchActivePlan }
}
