import { useEffect, useState } from 'react'
import { Card, CardContent, Button } from '@/components/ui'
import { PlanView } from '@/components/features/planner/PlanView'
import { PlanGenerator } from '@/components/features/planner/PlanGenerator'
import { usePlanStore } from '@/stores/planStore'
import { planService } from '@/services/planService'
import { useTranslation } from '@/hooks/useTranslation'

export function PlannerPage() {
  const { activePlan, setActivePlan, setPlans, setLoading, isLoading } = usePlanStore()
  const [showGenerator, setShowGenerator] = useState(false)
  useTranslation()

  const loadPlans = async () => {
    setLoading(true)
    try {
      const plansData = await planService.getPlans()
      setPlans(plansData)
      const active = plansData.find(p => p.isActive) || plansData[0]
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

  useEffect(() => {
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

  if (showGenerator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Plan</h1>
          <Button variant="ghost" onClick={() => setShowGenerator(false)}>
            ← Volver a Planes
          </Button>
        </div>
        <PlanGenerator onCreated={() => {
          setShowGenerator(false)
          loadPlans()
        }} />
      </div>
    )
  }

  if (activePlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Planificador de Estudio</h1>
          <Button onClick={() => setShowGenerator(true)}>
            + Nuevo Plan
          </Button>
        </div>
        <PlanView />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Planificador de Estudio</h1>
      </div>

      <PlanGenerator />
    </div>
  )
}
