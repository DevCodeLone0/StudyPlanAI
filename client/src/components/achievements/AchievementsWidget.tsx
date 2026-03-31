import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { gamificationService, type UserBadge } from '@/services/gamificationService'

interface AchievementsWidgetProps {
  className?: string
  onBadgeClick?: (badge: UserBadge) => void
}

export function AchievementsWidget({ className, onBadgeClick }: AchievementsWidgetProps) {
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await gamificationService.getEarnedBadges()
        // Sort by earnedAt descending, take first 3
        const sorted = data
          .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
          .slice(0, 3)
        setBadges(sorted)
      } catch (err) {
        setError('Failed to load badges')
        console.error('Failed to fetch badges:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBadges()
  }, [])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🏆 Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 text-center p-3 rounded-lg bg-gray-100 animate-pulse"
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🏆 Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (badges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🏆 Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <span className="text-3xl mb-2 block">🏅</span>
            <p className="text-sm text-gray-500">
              Complete milestones to earn badges!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>🏆 Recent Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          {badges.map((userBadge) => (
            <button
              key={userBadge.id}
              onClick={() => onBadgeClick?.(userBadge)}
              className={clsx(
                'flex-1 text-center p-3 rounded-lg transition-all duration-200',
                'bg-primary-50 border-2 border-primary-200',
                'hover:scale-105 hover:shadow-md cursor-pointer'
              )}
            >
              <span className="text-3xl block mb-1">{userBadge.badge.icon}</span>
              <p className="text-xs font-medium text-gray-900 truncate">
                {userBadge.badge.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(userBadge.earnedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>

        {badges.length < 3 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            {3 - badges.length} more badge{(3 - badges.length) > 1 ? 's' : ''} to unlock
          </p>
        )}
      </CardContent>
    </Card>
  )
}
