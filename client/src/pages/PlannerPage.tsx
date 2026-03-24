import { usePlanData } from '@/hooks/usePlanData'
import { PlanGenerator } from '@/components/features/planner/PlanGenerator'
import { PlanView } from '@/components/features/planner/PlanView'

export function PlannerPage() {
  const { activePlan, isLoading, error } = usePlanData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        activePlan ? <PlanView /> : <PlanGenerator />
      )}
    </div>
  )
}
