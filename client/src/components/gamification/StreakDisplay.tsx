import { clsx } from 'clsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getDaysUntilStreakMilestone, getStreakMilestoneMessage } from '@/services/gamificationService'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  lastActiveAt?: string | null
  showHistory?: boolean
  onHistoryClick?: () => void
  className?: string
}

const MILESTONES = [7, 14, 30, 60, 100, 365]

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastActiveAt,
  showHistory = false,
  onHistoryClick,
  className,
}: StreakDisplayProps) {
  const isPersonalBest = currentStreak === longestStreak && currentStreak > 0
  const nextMilestone = MILESTONES.find((m) => m > currentStreak)
  const daysUntilNextMilestone = nextMilestone
    ? getDaysUntilStreakMilestone(currentStreak, nextMilestone)
    : null

  const milestoneMessage = getStreakMilestoneMessage(currentStreak)

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '❄️'
    if (streak >= 100) return '🔥🔥🔥'
    if (streak >= 30) return '🔥🔥'
    if (streak >= 7) return '🔥'
    return '⚡'
  }

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'from-blue-400 to-blue-600'
    if (streak >= 100) return 'from-red-500 to-orange-600'
    if (streak >= 30) return 'from-orange-400 to-red-500'
    if (streak >= 7) return 'from-yellow-400 to-orange-500'
    return 'from-green-400 to-green-600'
  }

  const getWarningMessage = () => {
    if (!lastActiveAt) return null

    const lastActive = new Date(lastActiveAt)
    const now = new Date()
    const diffMs = now.getTime() - lastActive.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours > 24) {
      return '⚠️ Your streak is at risk! Check in today to keep it going.'
    }

    if (diffHours > 12) {
      const hoursLeft = Math.ceil(24 - diffHours)
      return `⚠️ Check in within ${hoursLeft} hours to maintain your streak!`
    }

    return null
  }

  const warningMessage = getWarningMessage()

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'Never'

    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStreakEmoji(currentStreak)} Current Streak
          </CardTitle>
          {showHistory && (
            <button
              onClick={onHistoryClick}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View History
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div
            className={clsx(
              'w-32 h-32 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center shadow-lg',
              getStreakColor(currentStreak)
            )}
          >
            <span className="text-5xl font-bold text-white">{currentStreak}</span>
            <span className="text-white/90 text-sm font-medium">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {isPersonalBest && (
          <div className="flex justify-center">
            <Badge variant="warning" size="md" className="animate-pulse">
              🏆 Personal Best!
            </Badge>
          </div>
        )}

        {milestoneMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <span className="text-yellow-800 text-sm font-medium">{milestoneMessage}</span>
          </div>
        )}

        {warningMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <span className="text-red-700 text-sm font-medium">{warningMessage}</span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Personal Best:</span>
            <span className="font-semibold text-gray-900">{longestStreak} days</span>
          </div>

          {daysUntilNextMilestone !== null && nextMilestone && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Next Milestone:</span>
              <span className="font-semibold text-gray-900">
                {daysUntilNextMilestone} days ({nextMilestone})
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Last Active:</span>
            <span className="font-semibold text-gray-900">{formatLastActive(lastActiveAt)}</span>
          </div>
        </div>

        {currentStreak > 0 && currentStreak < 7 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <span className="text-blue-700 text-sm">
              Keep going! {7 - currentStreak} more {7 - currentStreak === 1 ? 'day' : 'days'} to unlock your first fire emoji! 🔥
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
