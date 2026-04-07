import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, LevelBadge, Badge, ProgressBar } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getLevelProgress } from '@/stores/gamificationStore'
import { BadgesCollection, RewardsShop } from '@/components/gamification'
import { gamificationService, type BadgeWithStatus, type Reward, type UserReward } from '@/services/gamificationService'
import { useTranslation } from '@/hooks/useTranslation'

export function ProfilePage() {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState<BadgeWithStatus[]>([])
  const [purchasedRewards, setPurchasedRewards] = useState<UserReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [badgesData, purchasedData] = await Promise.all([
          gamificationService.getBadges(),
          gamificationService.getPurchasedRewards(),
        ])
        setBadges(badgesData)
        setPurchasedRewards(purchasedData)
      } catch (err) {
        console.error('Failed to fetch profile data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePurchaseReward = async (reward: Reward) => {
    if (!user) return
    try {
      const purchased = await gamificationService.purchaseReward(reward.id)
      setPurchasedRewards((prev) => [...prev, purchased])
    } catch (err) {
      console.error('Failed to purchase reward:', err)
    }
  }

  if (!user) return null

  const progress = getLevelProgress(user.xp, user.level)
  const purchasedIds = purchasedRewards.map((pr) => pr.reward.id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tu Perfil</h1>

      {/* Profile Card */}
      <Card>
        <CardContent className="flex items-center gap-6">
          <LevelBadge level={user.level} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <Badge variant="primary" className="mt-2">{user.role === 'ADMIN' ? 'Administrador' : 'Estudiante'}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-primary-600">{user.xp.toLocaleString()}</p>
            <p className="text-gray-600">XP Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-warning-500">{user.currentStreak}</p>
            <p className="text-gray-600">Días de racha</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-success-500">{user.longestStreak}</p>
            <p className="text-gray-600">Mejor racha</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Nivel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Nivel {user.level}</span>
            <span className="text-gray-600">{progress.current} / {progress.needed} XP</span>
          </div>
          <ProgressBar value={progress.current} max={progress.needed} size="lg" animated />
          <p className="text-sm text-gray-500 mt-2">
            Faltan {progress.needed - progress.current} XP para el Nivel {user.level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Badges Collection */}
      <BadgesCollection badges={badges} isLoading={isLoading} className="mt-6" />

      {/* Rewards Shop */}
      <RewardsShop
        userXP={user.xp}
        purchasedRewardIds={purchasedIds}
        onPurchase={handlePurchaseReward}
        className="mt-6"
      />
    </div>
  )
}
