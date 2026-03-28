import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, ProgressBar, LevelBadge, Badge } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { usePlanData } from '@/hooks/usePlanData'
import { getLevelProgress } from '@/stores/gamificationStore'
import { StreakDisplay } from '@/components/gamification/StreakDisplay'
import { ActivityCalendar } from '@/components/gamification/ActivityCalendar'
import { gamificationService, type ActivityCalendarData } from '@/services/gamificationService'
import type { Module } from '@/types'

function getPlanProgress(modules: Module[] | undefined): number {
  if (!modules || modules.length === 0) return 0
  const total = modules.reduce((s, m) => s + (m.milestones?.length ?? 0), 0)
  if (total === 0) return 0
  const done = modules.reduce(
    (s, m) => s + (m.milestones?.filter((ms) => ms.completedAt).length ?? 0),
    0
  )
  return Math.round((done / total) * 100)
}

function getNextMilestone(modules: Module[] | undefined) {
  if (!modules) return null
  for (const mod of modules) {
    for (const ms of mod.milestones ?? []) {
      if (!ms.completedAt) return { module: mod, milestone: ms }
    }
  }
  return null
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const { activePlan } = usePlanData()
  const navigate = useNavigate()

  const [activityData, setActivityData] = useState<ActivityCalendarData[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setActivityLoading(true)
        setActivityError(null)
        const data = await gamificationService.getActivityCalendar(30)
        setActivityData(data)
      } catch (err) {
        setActivityError('Failed to load activity calendar')
        console.error('Failed to fetch activity calendar:', err)
      } finally {
        setActivityLoading(false)
      }
    }

    if (user) {
      fetchActivityData()
    }
  }, [user])

  const streak = {
    current: user?.currentStreak ?? 0,
    longest: user?.longestStreak ?? 0,
  }

  const xpProgress = user
    ? getLevelProgress(user.xp, user.level)
    : { current: 0, needed: 100, percentage: 0 }

  const modules = activePlan?.modules
  const planProgress = getPlanProgress(modules)
  const nextUp = getNextMilestone(modules)

  const handleActivityDateClick = (date: string) => {
    navigate(`/app/profile?date=${date}`)
  }

  const handleStreakHistoryClick = () => {
    navigate('/app/profile#streaks')
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
              <p className="text-sm text-gray-500">
                {xpProgress.current} / {xpProgress.needed} XP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${streak.current} days`}
          subLabel={streak.current > 0 ? `Best: ${streak.longest}` : 'Start today!'}
        />
        <StatCard
          icon="⭐"
          label="Total XP"
          value={user?.xp.toLocaleString() || '0'}
          subLabel="Keep earning!"
        />
        <StatCard
          icon="📚"
          label="Active Plan"
          value={activePlan?.title || 'None yet'}
          subLabel={activePlan ? 'Keep going' : 'Create one'}
        />
        <StatCard
          icon="🎯"
          label="Progress"
          value={activePlan ? `${planProgress}%` : '0%'}
          subLabel="of plan completed"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Plan Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>📖 Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {activePlan ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activePlan.title}
                  </h3>
                  {nextUp && <Badge variant="primary">{nextUp.module.title}</Badge>}
                </div>

                <ProgressBar value={planProgress} showLabel animated />

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Next up:</p>
                  <p className="font-medium text-gray-900">
                    {nextUp ? nextUp.milestone.title : 'All milestones completed! 🎉'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500">
                    Duration: {activePlan.duration} · {activePlan.dailyTime}/day
                  </p>
                  <button
                    onClick={() => navigate('/app/planner')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Plan →
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <span className="text-4xl mb-3 block">📚</span>
                <p className="text-gray-600 mb-4">You don't have an active plan yet.</p>
                <button
                  onClick={() => navigate('/app/planner')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
                >
                  Create a Plan
                </button>
              </div>
            )}
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
              onClick={() => navigate('/app/planner')}
            />
            <QuickAction
              icon="💬"
              label="Chat with Tutor"
              description="Ask any question"
              onClick={() => navigate('/app/tutor')}
            />
            <QuickAction
              icon="📊"
              label="View Statistics"
              description="See your progress"
              onClick={() => navigate('/app/profile')}
            />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Gamification Section */}
    <div className="grid lg:grid-cols-2 gap-6">
      <StreakDisplay
        currentStreak={streak.current}
        longestStreak={streak.longest}
        lastActiveAt={user?.lastActiveAt}
        showHistory
        onHistoryClick={handleStreakHistoryClick}
      />

      {activityLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Activity Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </CardContent>
        </Card>
      ) : activityError ? (
        <Card>
          <CardHeader>
            <CardTitle>Activity Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <span className="text-4xl mb-3">⚠️</span>
              <p className="text-gray-600">{activityError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ActivityCalendar
          data={activityData}
          days={30}
          onDateClick={handleActivityDateClick}
        />
      )}
    </div>
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

function QuickAction({ icon, label, description, onClick }: {
  icon: string
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  )
}
