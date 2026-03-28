# Frontend Gamification Components - Sprint 2

> Created: 2026-03-27
> Sprint: 2 - Gamification Complete
> Status: Planning

---

## Overview

Este documento especifica los componentes de gamificación a implementar en el frontend para el Sprint 2.

---

## 1. Services Layer

### `client/src/services/gamificationService.ts`

```typescript
import api from './api'
import type {
  Badge,
  UserBadge,
  CompleteMilestoneResponse,
} from '@/types'

// Types for new gamification features
export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  category: 'theme' | 'avatar' | 'title' | 'effect'
}

export interface UserReward {
  id: string
  purchasedAt: string
  reward: Reward
}

export interface ActivityCalendarData {
  date: string
  count: number
  type: 'MILESTONE_COMPLETED' | 'PLAN_CREATED' | 'STREAK_MAINTENED' | 'BADGE_EARNED'
}

export interface StreakHistory {
  date: string
  streak: number
  broken: boolean
}

export const gamificationService = {
  // Badges
  async getBadges(): Promise<{ badges: Badge[]; earned: UserBadge[] }> {
    const response = await api.get('/badges')
    return response.data
  },

  async getEarnedBadges(): Promise<UserBadge[]> {
    const response = await api.get('/badges/earned')
    return response.data
  },

  async shareBadge(badgeId: string): Promise<{ shareUrl: string }> {
    const response = await api.post(`/badges/${badgeId}/share`)
    return response.data
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const response = await api.get('/rewards')
    return response.data
  },

  async getPurchasedRewards(): Promise<UserReward[]> {
    const response = await api.get('/rewards/purchased')
    return response.data
  },

  async purchaseReward(rewardId: string): Promise<UserReward> {
    const response = await api.post(`/rewards/${rewardId}/purchase`)
    return response.data
  },

  // Activity Calendar
  async getActivityCalendar(days: number = 30): Promise<ActivityCalendarData[]> {
    const response = await api.get(`/activity/calendar?days=${days}`)
    return response.data
  },

  // Streaks
  async getStreakHistory(): Promise<StreakHistory[]> {
    const response = await api.get('/streaks/history')
    return response.data
  },

  async checkStreak(): Promise<{ current: number; longest: number; maintained: boolean }> {
    const response = await api.post('/streaks/check')
    return response.data
  },
}
```

---

## 2. Components Specification

### 2.1 BadgesCollection.tsx

**Purpose**: Display a grid of all badges with earned/locked status

**Props**:
```typescript
interface BadgesCollectionProps {
  showLocked?: boolean
  onBadgeClick?: (badge: Badge) => void
  className?: string
}
```

**Features**:
- Grid layout responsive (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Badges earned: full color, animated, clickable
- Badges locked: grayscale, opacity 0.5, show "???" or lock icon
- Hover effects: scale up, show tooltip with description
- Filter toggle: Show/Hide locked badges
- Empty state: "No badges earned yet. Keep studying!"

**UI Structure**:
```
┌─────────────────────────────────────┐
│  Badges Collection        [Toggle]  │
├─────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │ 🏆  │  │ 🔥  │  │ ⭐  │  │ 🔒  │ │
│  │First│  │Week │  │Level│  │???? │ │
│  │Steps│  │Warrior│5   │      │ │
│  └─────┘  └─────┘  └─────┘  └─────┘ │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │ 🎯  │  │ 📚  │  │ 🔒  │  │ 🔒  │ │
│  │Plan │  │10   │      │      │ │
│  │Master│Milestones│   │      │ │
│  └─────┘  └─────┘  └─────┘  └─────┘ │
└─────────────────────────────────────┘
```

**Badges to display** (from backend):
- `FIRST_STEPS` - 🏆 Complete first milestone
- `WEEK_WARRIOR` - 🔥 7-day streak
- `MONTH_MASTER` - 🌟 30-day streak
- `LEVEL_UP_5` - ⭐ Reach level 5
- `LEVEL_UP_10` - 🌟 Reach level 10
- `PLAN_MASTER` - 🎯 Complete first plan
- `MILESTONE_10` - 📚 Complete 10 milestones
- `MILESTONE_50` - 🏆 Complete 50 milestones

---

### 2.2 RewardsShop.tsx

**Purpose**: Display available rewards and allow purchase with XP

**Props**:
```typescript
interface RewardsShopProps {
  userXP: number
  onPurchase?: (reward: Reward) => void
  className?: string
}
```

**Features**:
- Grid layout of rewards
- Show reward cost in XP
- Disable purchase if user doesn't have enough XP
- Show "Purchased" badge for already owned rewards
- Filter by category (theme, avatar, title, effect)
- Purchase confirmation modal
- Success animation after purchase

**UI Structure**:
```
┌─────────────────────────────────────┐
│  Rewards Shop          XP: 1,250    │
├─────────────────────────────────────┤
│  [All] [Theme] [Avatar] [Title]     │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │  🎨     │  │  👤     │  │  🏅     ││
│  │ Dark    │  │ Avatar  │  │ "Master"││
│  │ Theme   │  │ Pack    │  │  Title  ││
│  │  500 XP │  │ 1000 XP │  │ 2000 XP ││
│  │ [Buy]   │  │ [Buy]   │  │ [Buy]   ││
│  └─────────┘  └─────────┘  └─────────┘│
└─────────────────────────────────────┘
```

**Sample Rewards**:
- Dark Theme - 500 XP
- Avatar Pack - 1000 XP
- "Master" Title - 2000 XP
- Confetti Effect - 1500 XP
- Custom Badge Frame - 3000 XP

---

### 2.3 ActivityCalendar.tsx

**Purpose**: Display 30-day activity heatmap (GitHub-style)

**Props**:
```typescript
interface ActivityCalendarProps {
  days?: number
  onDateClick?: (date: string) => void
  className?: string
}
```

**Features**:
- 30-day grid (6 rows x 5 cols or similar)
- Color intensity based on activity count
- Tooltip on hover showing date and count
- Legend for activity levels
- Responsive layout

**UI Structure**:
```
┌─────────────────────────────────────┐
│  Activity Calendar (Last 30 Days)   │
├─────────────────────────────────────┤
│  Mar 27  Mar 28  Mar 29  Mar 30  ... │
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐       │
│  │🟢 │   │🟢 │   │⚪ │   │🟢 │       │
│  └───┘   └───┘   └───┘   └───┘       │
│  ┌───┐   ┌───┐   ┌───┐   ┌───┐       │
│  │🟢 │   │🟡 │   │🟢 │   │⚪ │       │
│  └───┘   └───┘   └───┘   └───┘       │
│  ...                                  │
├─────────────────────────────────────┤
│  Less  ⚪ 🟢 🟡 🟠 🔴  More          │
└─────────────────────────────────────┘
```

**Color mapping**:
- ⚪ No activity
- 🟢 1-2 activities
- 🟡 3-5 activities
- 🟠 6-10 activities
- 🔴 10+ activities

---

### 2.4 StreakDisplay.tsx

**Purpose**: Display current streak with visual feedback

**Props**:
```typescript
interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  showHistory?: boolean
  onHistoryClick?: () => void
  className?: string
}
```

**Features**:
- Large display of current streak number
- Fire/emoji animation for active streaks
- Show "Personal Best" badge if current == longest
- Show days until next milestone (7, 30, 100)
- Warning icon if streak at risk (< 12h remaining)
- Optional history view toggle

**UI Structure**:
```
┌─────────────────────────────────────┐
│  🔥 Current Streak                   │
│                                      │
│         ┌─────────┐                  │
│         │    7    │                  │
│         │  days   │                  │
│         └─────────┘                  │
│                                      │
│  🏆 Personal Best: 12 days           │
│  📅 Next milestone: 30 days          │
│  ⚠️ Check in before 6 PM tomorrow!   │
└─────────────────────────────────────┘
```

---

### 2.5 CelebrationModal.tsx

**Purpose**: Display celebration modal with confetti and sound effects

**Props**:
```typescript
interface CelebrationModalProps {
  type: 'level_up' | 'badge_earned' | 'streak_milestone' | 'plan_completed'
  data: {
    level?: number
    badge?: Badge
    streak?: number
    xpEarned?: number
  }
  onClose: () => void
  autoClose?: boolean
  className?: string
}
```

**Features**:
- Confetti animation (canvas-canvas-confetti or similar)
- Sound effects (level up, badge unlock, streak)
- Different layouts based on celebration type
- XP earned display
- "Share" button for social media
- Auto-close after 5 seconds (configurable)

**UI Structure (Level Up)**:
```
┌─────────────────────────────────────┐
│                                      │
│         🎉 LEVEL UP! 🎉              │
│                                      │
│         ┌─────────┐                  │
│         │    5    │                  │
│         └─────────┘                  │
│                                      │
│  +150 XP earned                     │
│  [Share]  [Continue]                │
│                                      │
└─────────────────────────────────────┘
```

**Sound effects to include**:
- Level up: ascending chime
- Badge earned: magical sparkle
- Streak milestone: fire crackle
- Plan completed: victory fanfare

---

## 3. Integration Points

### 3.1 Dashboard Integration

Add to `client/src/pages/Dashboard.tsx`:
```typescript
import { StreakDisplay } from '@/components/gamification/StreakDisplay'
import { ActivityCalendar } from '@/components/gamification/ActivityCalendar'
import { CelebrationModal } from '@/components/gamification/CelebrationModal'

// In dashboard layout:
<StreakDisplay
  currentStreak={user.currentStreak}
  longestStreak={user.longestStreak}
/>

<ActivityCalendar days={30} />

<CelebrationModal
  type={celebrationType}
  data={celebrationData}
  onClose={handleCloseCelebration}
/>
```

### 3.2 Profile Page Integration

Add to profile page:
```typescript
import { BadgesCollection } from '@/components/gamification/BadgesCollection'
import { RewardsShop } from '@/components/gamification/RewardsShop'

// In profile layout:
<BadgesCollection showLocked={false} />

<RewardsShop userXP={user.xp} />
```

### 3.3 Milestone Completion Integration

Update `completeMilestone` in `planService.ts`:
```typescript
async completeMilestone(id: string): Promise<CompleteMilestoneResponse> {
  const response = await api.post<CompleteMilestoneResponse>(
    `/milestones/${id}/complete`
  )

  // Trigger celebration if needed
  if (response.data.levelUp) {
    triggerCelebration('level_up', { level: response.data.newLevel })
  }

  if (response.data.newBadge) {
    triggerCelebration('badge_earned', { badge: response.data.newBadge.badge })
  }

  return response.data
}
```

---

## 4. Dependencies

### Required Packages

```bash
# Confetti
npm install canvas-confetti

# Sound effects (optional - can use browser Audio API)
npm install howler

# Date utilities
npm install date-fns
```

### Existing Dependencies

- Zustand (state management)
- Tailwind CSS (styling)
- Axios (API calls)
- React Router (navigation)

---

## 5. Testing Checklist

- [ ] BadgesCollection displays earned badges correctly
- [ ] BadgesCollection shows locked badges when toggle enabled
- [ ] RewardsShop shows correct XP balance
- [ ] RewardsShop disables purchase when insufficient XP
- [ ] ActivityCalendar displays correct heatmap colors
- [ ] ActivityCalendar shows tooltip on hover
- [ ] StreakDisplay shows current streak correctly
- [ ] StreakDisplay shows warning when streak at risk
- [ ] CelebrationModal shows confetti animation
- [ ] CelebrationModal plays sound effects
- [ ] All components responsive on mobile/tablet/desktop
- [ ] All components handle loading states
- [ ] All components handle error states

---

## 6. Next Steps

1. Wait for backend gamification endpoints to be ready
2. Create `gamificationService.ts` with all API calls
3. Implement components one by one (BadgesCollection → RewardsShop → ActivityCalendar → StreakDisplay → CelebrationModal)
4. Integrate components into Dashboard and Profile pages
5. Add confetti and sound effects
6. Test end-to-end with real backend data
7. Polish animations and transitions

---

**Status**: Planning - Backend in progress, Frontend ready to start
**Priority**: High - Core Sprint 2 feature
**Estimated Effort**: 2-3 days for all components
