import { clsx } from 'clsx'
import type { AIContext } from '@/services/aiService'

interface ContextBannerProps {
  context: AIContext | null
  isLoading?: boolean
  className?: string
}

export function ContextBanner({ context, isLoading, className }: ContextBannerProps) {
  if (isLoading) {
    return (
      <div className={clsx('bg-gray-100 rounded-lg p-3 animate-pulse', className)}>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
    )
  }

  if (!context || !context.plan) {
    return (
      <div className={clsx('bg-primary-50 border border-primary-200 rounded-lg p-3', className)}>
        <p className="text-sm text-primary-700">
          📖 <span className="font-medium">No active plan</span> — Create a plan to get personalized tutoring!
        </p>
      </div>
    )
  }

  const moduleInfo = context.currentModule
    ? `${context.currentModule.title}`
    : 'Not started'

  const progressInfo = `${context.progress.completedMilestones}/${context.progress.totalMilestones}`

  const streakBadge = context.streak.current > 0 && (
    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
      🔥 {context.streak.current} days
    </span>
  )

  return (
    <div className={clsx('bg-primary-50 border border-primary-200 rounded-lg p-3', className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-base">📖</span>
          <span className="font-medium text-gray-900">{moduleInfo}</span>
        </div>

        <div className="flex items-center gap-1.5 text-gray-600">
          <span className="text-base">🎯</span>
          <span>{progressInfo} milestones</span>
          {context.progress.percentage > 0 && (
            <span className="text-xs text-gray-500">({context.progress.percentage}%)</span>
          )}
        </div>

        {streakBadge}
      </div>
    </div>
  )
}
