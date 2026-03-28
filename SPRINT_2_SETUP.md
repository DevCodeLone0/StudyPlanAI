# Sprint 2: Gamification Complete - Setup Instructions

> Created: 2026-03-27
> Sprint: 2 - Gamification Complete
> Status: Backend Complete, Frontend In Progress

---

## Overview

Sprint 2 implementa el sistema completo de gamificación con badges, rewards shop, activity calendar, streaks, y celebraciones.

---

## Backend Status ✅ COMPLETED

### Archivos Creados/Modificados

**Rutas**:
- `server/src/routes/streaks.ts` - POST /check, GET /history
- `server/src/routes/badges.ts` - GET /, GET /earned, POST /:id/share
- `server/src/routes/rewards.ts` - GET /, GET /purchased, POST /:id/purchase
- `server/src/routes/activity.ts` - GET /calendar, GET /history

**Servicios**:
- `server/src/services/badgeService.ts` - checkAndUnlockBadges(), getBadgesForUser()

**Schema**:
- `server/prisma/schema.prisma` - Agregados Reward y UserReward models

**Seed**:
- `server/prisma/seed.ts` - 8 badges y 6 rewards

**Configuración**:
- `server/src/index.ts` - Nuevas rutas agregadas

### Endpoints Implementados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/streaks/check` | POST | Verifica y actualiza racha |
| `/api/v1/streaks/history` | GET | Historial de rachas |
| `/api/v1/badges` | GET | Todos los badges (earned/locked) |
| `/api/v1/badges/earned` | GET | Solo badges ganados |
| `/api/v1/badges/:id/share` | POST | Genera link para compartir |
| `/api/v1/rewards` | GET | Recompensas disponibles |
| `/api/v1/rewards/purchased` | GET | Recompensas compradas |
| `/api/v1/rewards/:id/purchase` | POST | Comprar recompensa |
| `/api/v1/activity/calendar` | GET | Datos para heatmap |
| `/api/v1/activity/history` | GET | Historial de actividades |

### Badges Implementados

| Código | Nombre | Icono | Requisito |
|-------|-------|-------|-----------|
| FIRST_STEPS | First Steps | 👣 | Completar primer milestone |
| WEEK_WARRIOR | Week Warrior | 🔥 | Racha de 7 días |
| MONTH_MASTER | Month Master | 🌟 | Racha de 30 días |
| LEVEL_UP_5 | Rising Star | ⭐ | Nivel 5 |
| LEVEL_UP_10 | Expert | 🌟 | Nivel 10 |
| PLAN_MASTER | Study Master | 👑 | Completar primer plan |
| MILESTONE_10 | Fast Learner | ⚡ | 10 milestones |
| MILESTONE_50 | Dedicated Scholar | 🏆 | 50 milestones |

### Rewards Implementados

| Nombre | Costo | Icono | Categoría |
|-------|-------|-------|-----------|
| Dark Theme | 500 XP | 🎨 | theme |
| Avatar Pack | 1000 XP | 👤 | avatar |
| "Master" Title | 2000 XP | 🏅 | title |
| Confetti Effect | 1500 XP | 🎊 | effect |
| Custom Badge Frame | 3000 XP | 🖼️ | effect |
| Neon Theme | 2500 XP | 💡 | theme |

---

## Frontend Status 🟡 IN PROGRESS

### Archivos Creados

**Servicios**:
- `client/src/services/gamificationService.ts` - Todos los endpoints de gamificación + funciones helper

**Componentes**:
- `client/src/components/gamification/BadgesCollection.tsx` ✅ COMPLETED
- `client/src/components/gamification/RewardsShop.tsx` 🟡 IN PROGRESS (delegado)
- `client/src/components/gamification/ActivityCalendar.tsx` 🟡 IN PROGRESS (delegado)
- `client/src/components/gamification/StreakDisplay.tsx` 🟡 IN PROGRESS (delegado)
- `client/src/components/gamification/CelebrationModal.tsx` 🟡 IN PROGRESS (delegado)

### Funciones Helper Implementadas

- `getLevelProgress()` - Calcula progreso al siguiente nivel
- `formatActivityType()` - Formatea tipo de actividad
- `getActivityTypeColor()` - Retorna color según tipo
- `getHeatmapColor()` - Retorna color para heatmap
- `canAffordReward()` - Verifica si puede comprar
- `getDaysUntilStreakMilestone()` - Días hasta milestone
- `getStreakMilestoneMessage()` - Mensaje motivacional

---

## Setup Instructions

### 1. Backend Setup

#### Ejecutar Migración de Prisma

```bash
cd server
npx prisma migrate dev --name add_rewards_models
```

#### Ejecutar Seed (requiere PostgreSQL corriendo)

```bash
cd server
npx prisma db seed
```

O manualmente con tsx:

```bash
cd server
node node_modules/.bin/tsx prisma/seed.ts
```

#### Iniciar Servidor

```bash
cd server
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

### 2. Frontend Setup

#### Instalar Dependencias

```bash
cd client
npm install canvas-confetti
# Opcional: npm install howler
```

#### Iniciar Cliente

```bash
cd client
npm run dev
```

El cliente estará corriendo en `http://localhost:5173`

---

## Integration Points

### Dashboard Integration

Agregar a `client/src/pages/Dashboard.tsx`:

```typescript
import { StreakDisplay } from '@/components/gamification/StreakDisplay'
import { ActivityCalendar } from '@/components/gamification/ActivityCalendar'
import { CelebrationModal } from '@/components/gamification/CelebrationModal'

// En el layout del dashboard:
<StreakDisplay
  currentStreak={user.currentStreak}
  longestStreak={user.longestStreak}
  lastActiveAt={user.lastActiveAt}
/>

<ActivityCalendar days={30} />

<CelebrationModal
  type={celebrationType}
  data={celebrationData}
  onClose={handleCloseCelebration}
  autoClose
/>
```

### Profile Page Integration

Agregar a `client/src/pages/Profile.tsx`:

```typescript
import { BadgesCollection } from '@/components/gamification/BadgesCollection'
import { RewardsShop } from '@/components/gamification/RewardsShop'

// En el layout del profile:
<BadgesCollection showLocked={false} />

<RewardsShop userXP={user.xp} />
```

### Milestone Completion Integration

Actualizar `completeMilestone` en `client/src/services/planService.ts`:

```typescript
async completeMilestone(id: string): Promise<CompleteMilestoneResponse> {
  const response = await api.post<CompleteMilestoneResponse>(
    `/milestones/${id}/complete`
  )

  // Trigger celebration si es necesario
  if (response.data.levelUp) {
    triggerCelebration('level_up', { level: response.data.newLevel })
  }

  if (response.data.newBadge) {
    triggerCelebration('badge_earned', { badge: response.data.newBadge.badge })
  }

  // Check streak
  await gamificationService.checkStreak()

  return response.data
}
```

---

## Testing Checklist

### Backend Testing

- [ ] POST /streaks/check actualiza racha correctamente
- [ ] GET /streaks/history retorna historial de rachas
- [ ] GET /badges retorna todos los badges con estado
- [ ] GET /badges/earned retorna solo badges ganados
- [ ] POST /badges/:id/share genera link de compartir
- [ ] GET /rewards retorna recompensas disponibles
- [ ] GET /rewards/purchased retorna recompensas compradas
- [ ] POST /rewards/:id/purchase compra recompensa y deduce XP
- [ ] GET /activity/calendar retorna datos para heatmap
- [ ] GET /activity/history retorna historial paginado
- [ ] Badges se desbloquean automáticamente al cumplir requisitos

### Frontend Testing

- [ ] BadgesCollection muestra badges earned correctamente
- [ ] BadgesCollection muestra badges locked cuando toggle activado
- [ ] BadgesCollection modal de detalle funciona
- [ ] BadgesCollection botón de compartir funciona
- [ ] RewardsShop muestra recompensas correctamente
- [ ] RewardsShop deshabilita compra cuando XP insuficiente
- [ ] RewardsShop muestra "Purchased" badge
- [ ] ActivityCalendar muestra heatmap con colores correctos
- [ ] ActivityCalendar muestra tooltip en hover
- [ ] StreakDisplay muestra racha actual correctamente
- [ ] StreakDisplay muestra warning cuando streak en riesgo
- [ ] CelebrationModal muestra confetti animation
- [ ] CelebrationModal reproduce sound effects
- [ ] Todos los componentes son responsive
- [ ] Todos los componentes manejan loading/error states

### End-to-End Testing

- [ ] Usuario completa milestone → gana XP → se desbloquea badge
- [ ] Usuario mantiene racha → se actualiza currentStreak
- [ ] Usuario rompe racha → se resetea a 1
- [ ] Usuario compra recompensa → se deduce XP → se agrega a purchased
- [ ] Activity calendar muestra actividad de últimos 30 días
- [ ] Celebration modal se muestra en level up
- [ ] Celebration modal se muestra al ganar badge

---

## Known Issues

1. **PostgreSQL no corriendo**: El seed requiere que PostgreSQL esté corriendo en `localhost:5432`. Asegúrate de iniciar el servicio de PostgreSQL antes de ejecutar el seed.

2. **npm no en PATH**: Si npm no está en PATH, usa el binario directamente o agrega node_modules/.bin al PATH.

3. **canvas-confetti no instalado**: Necesita instalación manual con `npm install canvas-confetti`.

---

## Next Steps

1. ✅ Backend completado
2. 🟡 Frontend en progreso (BadgesCollection completado, resto delegado)
3. ⏳ Instalar canvas-confetti
4. ⏳ Integrar componentes en Dashboard y Profile
5. ⏳ Testing end-to-end con backend corriendo
6. ⏳ Polish y optimización

---

**Status**: Backend Complete, Frontend In Progress
**Priority**: High - Core Sprint 2 Feature
**Estimated Completion**: 1-2 días para frontend restante + testing
