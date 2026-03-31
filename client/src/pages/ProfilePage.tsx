import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, LevelBadge, Badge, ProgressBar } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getLevelProgress } from '@/stores/gamificationStore'
import { BadgesCollection } from '@/components/gamification/BadgesCollection'
import { RewardsShop } from '@/components/gamification/RewardsShop'
import { gamificationService } from '@/services/gamificationService'
import api from '@/services/api'
import type { BadgeWithStatus, Reward, UserReward } from '@/services/gamificationService'

interface UserStats {
	xp: number
	level: number
	currentStreak: number
	longestStreak: number
	plansCount: number
	completedMilestones: number
	totalMilestones: number
	badgesCount: number
	modulesCompleted: number
	percentile: number
}

export function ProfilePage() {
	const { user } = useAuthStore()
	const [badges, setBadges] = useState<BadgeWithStatus[]>([])
	const [purchasedRewards, setPurchasedRewards] = useState<UserReward[]>([])
	const [isLoadingBadges, setIsLoadingBadges] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [stats, setStats] = useState<UserStats | null>(null)
	const [isLoadingStats, setIsLoadingStats] = useState(true)

	useEffect(() => {
		if (!user) return

		const fetchData = async () => {
			setIsLoadingBadges(true)
			setIsLoadingStats(true)
			setError(null)

			try {
				const [badgesData, purchasedData, statsData] = await Promise.all([
					gamificationService.getBadges(),
					gamificationService.getPurchasedRewards(),
					api.get<UserStats>('/users/me/stats').then(res => res.data),
				])
				setBadges(badgesData)
				setPurchasedRewards(purchasedData)
				setStats(statsData)
			} catch (err) {
				setError('Failed to load gamification data')
				console.error(err)
			} finally {
				setIsLoadingBadges(false)
				setIsLoadingStats(false)
			}
		}

		fetchData()
	}, [user])

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
  const purchasedRewardIds = purchasedRewards.map((pr) => pr.reward.id)
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
      
      {/* Profile Card */}
      <Card>
        <CardContent className="flex items-center gap-6">
          <LevelBadge level={user.level} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <Badge variant="primary" className="mt-2">{user.role}</Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-primary-600">{user.xp.toLocaleString()}</p>
            <p className="text-gray-600">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-warning-500">{user.currentStreak}</p>
            <p className="text-gray-600">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-success-500">{user.longestStreak}</p>
            <p className="text-gray-600">Best Streak</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Level {user.level}</span>
            <span className="text-gray-600">{progress.current} / {progress.needed} XP</span>
          </div>
          <ProgressBar value={progress.current} max={progress.needed} size="lg" animated />
          <p className="text-sm text-gray-500 mt-2">
            {progress.needed - progress.current} XP to Level {user.level + 1}
          </p>
		</CardContent>
	</Card>

	{/* Motivational Stats */}
	{isLoadingStats ? (
		<Card>
			<CardContent className="py-8">
				<div className="animate-pulse flex flex-col items-center gap-4">
					<div className="h-8 bg-gray-200 rounded w-48"></div>
					<div className="h-4 bg-gray-200 rounded w-32"></div>
				</div>
			</CardContent>
		</Card>
	) : stats && (
		<Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
			<CardContent className="py-6">
				<div className="text-center mb-4">
					<p className="text-2xl font-bold text-primary-700">
						🌟 You're in the top {100 - stats.percentile}% of learners!
					</p>
					<p className="text-sm text-primary-600 mt-1">
						Keep up the amazing work!
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
					<div className="text-center">
						<p className="text-2xl font-bold text-gray-900">{stats.modulesCompleted}</p>
						<p className="text-xs text-gray-600">Modules Completed</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-gray-900">
							{stats.completedMilestones}/{stats.totalMilestones}
						</p>
						<p className="text-xs text-gray-600">Milestones</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-gray-900">{stats.badgesCount}</p>
						<p className="text-xs text-gray-600">Badges Earned</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-gray-900">{stats.plansCount}</p>
						<p className="text-xs text-gray-600">Plans Created</p>
					</div>
				</div>

				{stats.totalMilestones > 0 && (
					<div className="mt-4">
						<ProgressBar 
							value={stats.completedMilestones} 
							max={stats.totalMilestones} 
							size="sm"
							showLabel
						/>
					</div>
				)}
			</CardContent>
		</Card>
	)}

	{/* Badges */}
    {error && (
      <Card>
        <CardContent className="text-center text-red-500 py-4">
          {error}
        </CardContent>
      </Card>
    )}

    <BadgesCollection
      badges={badges}
      isLoading={isLoadingBadges}
    />

    {/* Rewards Shop */}
    <RewardsShop
      userXP={user.xp}
      purchasedRewardIds={purchasedRewardIds}
      onPurchase={handlePurchaseReward}
    />
  </div>
  )
}
