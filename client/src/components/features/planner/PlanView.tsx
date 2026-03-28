import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Badge, ProgressBar } from '@/components/ui'
import { XPNotification } from '@/components/ui/XPNotification'
import { usePlanStore } from '@/stores/planStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useCelebrationStore, isStreakMilestone } from '@/stores/celebrationStore'
import { planService } from '@/services/planService'
import type { Plan, Module, Milestone } from '@/types'

function getModuleProgress(mod: Module): number {
  const milestones = mod.milestones ?? []
  if (milestones.length === 0) return 0
  const completed = milestones.filter((m) => m.completedAt).length
  return Math.round((completed / milestones.length) * 100)
}

function getPlanProgress(plan: Plan): number {
  const modules = plan.modules ?? []
  if (modules.length === 0) return 0

  const totalMilestones = modules.reduce((sum, m) => sum + (m.milestones?.length ?? 0), 0)
  if (totalMilestones === 0) return 0

  const completedMilestones = modules.reduce(
    (sum, m) => sum + (m.milestones?.filter((ms) => ms.completedAt).length ?? 0),
    0
  )
  return Math.round((completedMilestones / totalMilestones) * 100)
}

function ModuleCard({ module: mod }: { module: Module }) {
  const [expanded, setExpanded] = useState(mod.status === 'IN_PROGRESS')
  const [completingId, setCompletingId] = useState<string | null>(null)
  const { completeMilestone: completeInStore } = usePlanStore()
  const { addXP, showXPChange, clearXPChange, setStreak, setLevel } = useGamificationStore()
  const { triggerCelebration } = useCelebrationStore()

  const progress = getModuleProgress(mod)

  const handleCompleteMilestone = async (milestone: Milestone) => {
    if (milestone.completedAt || completingId) return

    setCompletingId(milestone.id)

    try {
      const result = await planService.completeMilestone(milestone.id)
      completeInStore(result.milestone.id)
      addXP(result.xpEarned)
      showXPChange(result.xpEarned)

      if (result.streakUpdated) {
        setStreak(result.streakUpdated.current, result.streakUpdated.longest)
        if (isStreakMilestone(result.streakUpdated.current)) {
          triggerCelebration('streak_milestone', {
            streak: result.streakUpdated.current,
            xpEarned: result.xpEarned,
          })
        }
      }

      if (result.newBadge) {
        triggerCelebration('badge_earned', {
          badge: result.newBadge.badge,
          xpEarned: result.xpEarned,
        })
      }

      if (result.levelUp) {
        const newLevel = Math.floor((result.totalXp / 100) + 1)
        setLevel(newLevel)
        triggerCelebration('level_up', {
          level: newLevel,
          xpEarned: result.xpEarned,
        })
      }

      const moduleAfter = mod.milestones?.map(m => 
        m.id === result.milestone.id ? { ...m, completedAt: new Date().toISOString() } : m
      )
      const allCompleted = moduleAfter?.every(m => m.completedAt)
      if (allCompleted && mod.milestones && mod.milestones.length > 0) {
        triggerCelebration('module_complete', {
          moduleName: mod.title,
          xpEarned: result.xpEarned,
        })
      }

      setTimeout(() => clearXPChange(), 2000)
    } catch (err) {
      console.error('Failed to complete milestone:', err)
    } finally {
      setCompletingId(null)
    }
  }

  const statusBadge = {
    LOCKED: <Badge variant="default">Locked</Badge>,
    IN_PROGRESS: <Badge variant="primary">In Progress</Badge>,
    COMPLETED: <Badge variant="success">Completed</Badge>,
  }

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                mod.status === 'COMPLETED'
                  ? 'bg-success-100 text-success-700'
                  : mod.status === 'IN_PROGRESS'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {mod.order}
            </span>
            <div>
              <h4 className="font-semibold text-gray-900">{mod.title}</h4>
              {mod.description && (
                <p className="text-sm text-gray-500 mt-0.5">{mod.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge[mod.status]}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={progress} size="sm" variant={progress === 100 ? 'success' : 'default'} />
        </div>
      </button>

      {expanded && mod.milestones && mod.milestones.length > 0 && (
        <div className="border-t divide-y">
          {mod.milestones.map((milestone) => {
            const isCompleted = !!milestone.completedAt
            const isCompleting = completingId === milestone.id

            return (
              <div
                key={milestone.id}
                className={`flex items-center gap-3 p-4 ${isCompleted ? 'bg-success-50/50' : ''}`}
              >
                <button
                  onClick={() => handleCompleteMilestone(milestone)}
                  disabled={isCompleted || isCompleting}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCompleted
                      ? 'border-success-500 bg-success-500 text-white'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isCompleting && (
                    <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {milestone.title}
                  </p>
                  {milestone.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{milestone.description}</p>
                  )}
                </div>

                {!isCompleted && (
                  <Badge variant="warning" size="sm">
                    +{milestone.xpReward} XP
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export function PlanView() {
  const { activePlan } = usePlanStore()

  if (!activePlan) return null

  const modules = activePlan.modules ?? []
  const progress = getPlanProgress(activePlan)

  return (
    <div className="space-y-6">
      <XPNotification />

      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{activePlan.title}</CardTitle>
              {activePlan.description && (
                <p className="text-gray-600 mt-1">{activePlan.description}</p>
              )}
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Goal</p>
              <p className="font-medium text-gray-900">{activePlan.goal}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium text-gray-900">{activePlan.duration}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Daily Time</p>
              <p className="font-medium text-gray-900">{activePlan.dailyTime}</p>
            </div>
          </div>
          <ProgressBar value={progress} showLabel animated />
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Modules ({modules.length})
        </h3>
        {modules.length > 0 ? (
          modules.map((mod) => <ModuleCard key={mod.id} module={mod} />)
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No modules in this plan yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
