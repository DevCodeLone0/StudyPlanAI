import { useState } from 'react'
import { clsx } from 'clsx'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { canAffordReward } from '@/services/gamificationService'
import type { Reward } from '@/services/gamificationService'

interface RewardsShopProps {
  userXP: number
  purchasedRewardIds?: string[]
  onPurchase?: (reward: Reward) => void
  className?: string
}

type CategoryFilter = 'all' | 'theme' | 'avatar' | 'title' | 'effect'

const SAMPLE_REWARDS: Reward[] = [
  {
    id: '1',
    name: 'Dark Theme',
    description: 'Dark mode theme for your dashboard',
    cost: 500,
    icon: '🎨',
    category: 'theme',
  },
  {
    id: '2',
    name: 'Avatar Pack',
    description: 'Premium avatar collection',
    cost: 1000,
    icon: '👤',
    category: 'avatar',
  },
  {
    id: '3',
    name: 'Master Title',
    description: 'Exclusive "Master" title badge',
    cost: 2000,
    icon: '🏅',
    category: 'title',
  },
  {
    id: '4',
    name: 'Confetti Effect',
    description: 'Celebratory confetti animation',
    cost: 1500,
    icon: '🎊',
    category: 'effect',
  },
  {
    id: '5',
    name: 'Custom Badge Frame',
    description: 'Customizable badge frame design',
    cost: 3000,
    icon: '🖼️',
    category: 'title',
  },
  {
    id: '6',
    name: 'Neon Theme',
    description: 'Neon cyberpunk theme',
    cost: 2500,
    icon: '✨',
    category: 'theme',
  },
]

export function RewardsShop({
  userXP,
  purchasedRewardIds = [],
  onPurchase,
  className,
}: RewardsShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const filteredRewards = SAMPLE_REWARDS.filter(
    (reward) => selectedCategory === 'all' || reward.category === selectedCategory
  )

  const handlePurchaseClick = (reward: Reward) => {
    setSelectedReward(reward)
    setShowConfirmModal(true)
  }

  const handleConfirmPurchase = () => {
    if (selectedReward && onPurchase) {
      onPurchase(selectedReward)
      setShowConfirmModal(false)
      setShowSuccessAnimation(true)
      setTimeout(() => setShowSuccessAnimation(false), 2000)
    }
  }

  const isPurchased = (rewardId: string) => purchasedRewardIds.includes(rewardId)
  const canAfford = (cost: number) => canAffordReward(userXP, cost)

  return (
    <div className={clsx('space-y-6', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rewards Shop</CardTitle>
            <Badge variant="primary" size="md">
              XP: {userXP.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {(['all', 'theme', 'avatar', 'title', 'effect'] as CategoryFilter[]).map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRewards.map((reward) => {
              const purchased = isPurchased(reward.id)
              const affordable = canAfford(reward.cost)

              return (
                <Card
                  key={reward.id}
                  variant="outlined"
                  padding="md"
                  className={clsx(
                    'relative transition-all duration-200',
                    !affordable && 'opacity-60',
                    showSuccessAnimation && selectedReward?.id === reward.id && 'scale-105'
                  )}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{reward.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{reward.description}</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant={affordable ? 'success' : 'warning'} size="sm">
                        {reward.cost} XP
                      </Badge>
                      {purchased && (
                        <Badge variant="primary" size="sm">
                          Purchased
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handlePurchaseClick(reward)}
                      disabled={!affordable || purchased}
                      variant={purchased ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                    >
                      {purchased ? 'Owned' : 'Buy'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {showConfirmModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Confirm Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedReward.icon}</div>
                <div>
                  <h4 className="font-semibold text-lg">{selectedReward.name}</h4>
                  <p className="text-sm text-gray-500">{selectedReward.description}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cost:</span>
                  <Badge variant="warning">{selectedReward.cost} XP</Badge>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Your Balance:</span>
                  <Badge variant="primary">{userXP.toLocaleString()} XP</Badge>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Remaining:</span>
                  <Badge variant="success">
                    {(userXP - selectedReward.cost).toLocaleString()} XP
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirmPurchase} variant="primary" className="flex-1">
                  Confirm Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
