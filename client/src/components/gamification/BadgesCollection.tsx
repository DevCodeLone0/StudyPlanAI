import { clsx } from 'clsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { BadgeWithStatus } from '@/services/gamificationService'

interface BadgesCollectionProps {
  badges: BadgeWithStatus[]
  isLoading?: boolean
  className?: string
}

export function BadgesCollection({
  badges,
  isLoading = false,
  className,
}: BadgesCollectionProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>🏆 Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="text-center p-4 rounded-lg bg-gray-100 animate-pulse"
              >
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🏆 Badges</CardTitle>
          <Badge variant="primary" size="md">
            {earnedCount} / {badges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={clsx(
                'text-center p-4 rounded-lg transition-all duration-200',
                badge.earned
                  ? 'bg-primary-50 border-2 border-primary-200 hover:scale-105'
                  : 'bg-gray-50 opacity-50 grayscale'
              )}
            >
              <span className="text-4xl block mb-2">{badge.icon}</span>
              <p className="text-sm font-medium text-gray-900">{badge.name}</p>
              {badge.earned && badge.earnedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
