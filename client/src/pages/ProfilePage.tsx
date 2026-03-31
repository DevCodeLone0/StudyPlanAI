import { Card, CardHeader, CardTitle, CardContent, LevelBadge, Badge, ProgressBar } from '@/components/ui'
import { useAuthStore } from '@/stores/authStore'
import { getLevelProgress } from '@/stores/gamificationStore'

export function ProfilePage() {
const { user } = useAuthStore()

if (!user) return null

const progress = getLevelProgress(user.xp, user.level)

const badges = [
{ code: 'FIRST_STEPS', name: 'First Steps', icon: '👣', earned: true },
{ code: 'WEEK_WARRIOR', name: 'Week Warrior', icon: '7️⃣', earned: user.currentStreak >= 7 },
{ code: 'FAST_LEARNER', name: 'Fast Learner', icon: '⚡', earned: false },
{ code: 'DEDICATED', name: 'Dedicated', icon: '📚', earned: false },
{ code: 'MASTER', name: 'Study Master', icon: '👑', earned: false },
]

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

{/* Badges */}
<Card>
<CardHeader>
<CardTitle>🏆 Badges</CardTitle>
</CardHeader>
<CardContent>
<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
{badges.map((badge) => (
<div
key={badge.code}
className={`text-center p-4 rounded-lg ${
badge.earned
? 'bg-primary-50 border-2 border-primary-200'
: 'bg-gray-50 opacity-50'
}`}
>
<span className="text-4xl block mb-2">{badge.icon}</span>
<p className="text-sm font-medium">{badge.name}</p>
</div>
))}
</div>
</CardContent>
</Card>
</div>
)
}
