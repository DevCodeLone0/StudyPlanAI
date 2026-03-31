import { Card, CardHeader, CardTitle, CardContent, ProgressBar, LevelBadge, Badge } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getLevelProgress } from '@/stores/gamificationStore'
import { StreakDisplay, ActivityCalendar, CelebrationModal } from '@/components/gamification'
import { useEffect, useState } from 'react'
import { gamificationService } from '@/services/gamificationService'
import { clsx } from 'clsx'

export function DashboardPage() {
const { user } = useAuthStore()
const [activityData, setActivityData] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [celebration, setCelebration] = useState<{ type: string; data: any } | null>(null)

useEffect(() => {
const loadActivity = async () => {
try {
const data = await gamificationService.getActivityCalendar(30)
setActivityData(data)
} catch (error) {
console.error('Failed to load activity:', error)
} finally {
setLoading(false)
}
}
loadActivity()
}, [])

// Mock data for MVP
const mockPlan = {
title: 'Spanish B2 Mastery',
progress: 35,
currentModule: 'Verb Conjugation',
nextMilestone: 'Practice subjunctive mood',
estimatedDays: 45,
}

const mockStreak = {
current: user?.currentStreak || 0,
longest: user?.longestStreak || 0,
}

const progress = user ? getLevelProgress(user.xp, user.level) : { current: 0, needed: 100, percentage: 0 }

const handleCelebrationClose = () => {
setCelebration(null)
}
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">Ready to continue your learning journey?</p>
        </div>
        
        {user && (
          <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border">
            <LevelBadge level={user.level} size="lg" />
            <div>
              <p className="font-bold text-gray-900">Level {user.level}</p>
              <p className="text-sm text-gray-500">{progress.current} / {progress.needed} XP</p>
            </div>
          </div>
        )}
      </div>
      
{/* Stats Grid */}
<div className="grid md:grid-cols-4 gap-4">
<Card>
<div className="flex items-center gap-3">
<span className="text-3xl">⭐</span>
<div>
<p className="text-sm text-gray-500">Total XP</p>
<p className="font-bold text-gray-900">{user?.xp.toLocaleString() || '0'}</p>
<p className="text-xs text-gray-400">Keep earning!</p>
</div>
</div>
</Card>
<StatCard
icon="📚"
label="Active Plan"
value={mockPlan.title}
subLabel="Keep going"
/>
<StatCard
icon="🎯"
label="Progress"
value={`${mockPlan.progress}%`}
subLabel="of plan completed"
/>
<Card className="md:col-span-1">
<CardContent className="p-4">
{user && (
<StreakDisplay
currentStreak={user.currentStreak || 0}
longestStreak={user.longestStreak || 0}
showHistory
/>
)}
</CardContent>
</Card>
</div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>📖 Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{mockPlan.title}</h3>
                <Badge variant="primary">{mockPlan.currentModule}</Badge>
              </div>
              
              <ProgressBar value={mockPlan.progress} showLabel animated />
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Next up:</p>
                <p className="font-medium text-gray-900">{mockPlan.nextMilestone}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-500">
                  Estimated completion: ~{mockPlan.estimatedDays} days
                </p>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Plan →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <QuickAction
                icon="✅"
                label="Complete Milestone"
                description="Mark today's task done"
              />
              <QuickAction
                icon="💬"
                label="Chat with Tutor"
                description="Ask any question"
              />
              <QuickAction
                icon="📊"
                label="View Statistics"
                description="See your progress"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
{/* Activity Calendar */}
<Card>
<CardHeader>
<CardTitle>📅 Study Activity</CardTitle>
</CardHeader>
<CardContent>
{loading ? (
<div className="h-32 flex items-center justify-center">
<div className="animate-pulse text-gray-400">Loading...</div>
</div>
) : (
<ActivityCalendar days={30} />
)}
</CardContent>
</Card>

{/* Celebration Modal */}
{celebration && (
<CelebrationModal
type={celebration.type as any}
data={celebration.data}
onClose={handleCelebrationClose}
/>
)}
</div>
)
}

function StatCard({ icon, label, value, subLabel }: {
icon: string
label: string
value: string
subLabel: string
}) {
return (
<Card>
<div className="flex items-center gap-3">
<span className="text-3xl">{icon}</span>
<div>
<p className="text-sm text-gray-500">{label}</p>
<p className="font-bold text-gray-900">{value}</p>
<p className="text-xs text-gray-400">{subLabel}</p>
</div>
</div>
</Card>
)
}

function QuickAction({ icon, label, description }: {
  icon: string
  label: string
  description: string
}) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  )
}
