import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui'
import { PlanView } from '@/components/features/planner/PlanView'
import { PlanGenerator } from '@/components/features/planner/PlanGenerator'
import { usePlanStore } from '@/stores/planStore'
import { planService } from '@/services/planService'

export function PlannerPage() {
  const { activePlan, setActivePlan, setPlans, setLoading, isLoading } = usePlanStore()

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true)
      try {
        const plans = await planService.getPlans()
        setPlans(plans)
        const active = plans.find(p => p.isActive) || plans[0]
        if (active) {
          const fullPlan = await planService.getPlan(active.id)
          setActivePlan(fullPlan)
        }
      } catch (err) {
        console.error('Failed to load plans:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activePlan) {
    return <PlanView />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
      </div>

      <PlanGenerator />
    </div>
  )
}
