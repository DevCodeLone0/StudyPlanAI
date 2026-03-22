# Technical Design: StudyPlanAI

> Generated: 2026-03-22
> Version: 1.0

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Dashboard │  │  Planner │  │ AI Tutor │  │   Admin     │   │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └──────┬───────┘   │
│        └─────────────┴──────────────┴────────────────┘          │
│                           │ Zustand Store                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST + WebSocket
┌───────────────────────────┼─────────────────────────────────────┐
│                      API GATEWAY                                 │
│                    (Express Router)                             │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│   Auth        │  │   Plans       │  │   AI          │
│   Service     │  │   Service     │  │   Service     │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                   │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│   Users       │  │   Modules     │  │   OpenRouter   │
│   Service     │  │   Service     │  │   API          │
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                   │
┌───────▼───────┐  ┌───────▼───────┐
│  PostgreSQL   │  │  Gamification  │
│  Database     │  │  Service       │
└───────────────┘  └───────────────┘
```

---

## 2. Architecture Decisions

### AD-01: Full-Stack Monolith with Clear Boundaries

| Aspect | Decision |
|--------|----------|
| **Choice** | Monolithic modular architecture (monorepo with `client/` and `server/` directories) |
| **Alternatives** | Separate repos, microservices |
| **Rationale** | Simpler deployment, shared types, faster iteration for MVP. Microservices add complexity without benefit at this scale. |

### AD-02: Zustand for State Management

| Aspect | Decision |
|--------|----------|
| **Choice** | Zustand (lightweight, TypeScript-native) |
| **Alternatives** | Redux Toolkit, React Context, Jotai |
| **Rationale** | Less boilerplate than Redux, better DX than Context, simpler than Jotai. Perfect for moderate state needs. |

### AD-03: Prisma ORM

| Aspect | Decision |
|--------|----------|
| **Choice** | Prisma ORM with PostgreSQL |
| **Alternatives** | TypeORM, raw SQL, Drizzle |
| **Rationale** | Best TypeScript integration, auto-generated types, excellent migrations, great DX. Drizzle is faster but less mature. |

### AD-04: OpenRouter for AI (Free Tier)

| Aspect | Decision |
|--------|----------|
| **Choice** | OpenRouter API with free models (Llama, Mistral) |
| **Alternatives** | Local Ollama, OpenAI paid, Anthropic |
| **Rationale** | Free tier available, multiple free models, no local GPU needed, easy API. Ollama is great but requires local setup. |

### AD-05: JWT with Refresh Tokens

| Aspect | Decision |
|--------|----------|
| **Choice** | JWT access tokens (15min) + HTTP-only refresh tokens (7 days) |
| **Alternatives** | Session-based, OAuth only |
| **Rationale** | Stateless, scalable, secure with refresh rotation. OAuth adds complexity without need. |

---

## 3. Data Model (Prisma Schema)

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(STUDENT)
  xp            Int       @default(0)
  level         Int       @default(1)
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  plans         Plan[]
  badges        UserBadge[]
  activities    Activity[]
  
  @@map("users")
}

enum Role {
  STUDENT
  ADMIN
}

model Plan {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      PlanStatus @default(ACTIVE)
  isActive    Boolean   @default(false)
  version     Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  modules     Module[]
  
  @@map("plans")
}

enum PlanStatus {
  DRAFT
  ACTIVE
  COMPLETED
  ABANDONED
}

model Module {
  id          String    @id @default(cuid())
  title       String
  description String?
  order       Int
  status      ModuleStatus @default(LOCKED)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  planId      String
  plan        Plan      @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  milestones  Milestone[]
  
  @@map("modules")
}

enum ModuleStatus {
  LOCKED
  IN_PROGRESS
  COMPLETED
}

model Milestone {
  id          String    @id @default(cuid())
  title       String
  description String?
  order       Int
  xpReward    Int       @default(50)
  dueDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  moduleId    String
  module      Module    @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  resources   Resource[]
  
  @@map("milestones")
}

model Resource {
  id          String       @id @default(cuid())
  type        ResourceType
  title       String
  url         String?
  content     String?
  createdAt   DateTime     @default(now())
  
  milestoneId String
  milestone   Milestone    @relation(fields: [milestoneId], references: [id], onDelete: Cascade)
  
  @@map("resources")
}

enum ResourceType {
  LINK
  NOTE
  FILE
}

model Badge {
  id          String    @id @default(cuid())
  code        String    @unique  // e.g., "FIRST_STEPS", "WEEK_WARRIOR"
  name        String
  description String
  icon        String    // emoji or icon name
  requirement String    // JSON describing unlock criteria
  
  users       UserBadge[]
  
  @@map("badges")
}

model UserBadge {
  id          String    @id @default(cuid())
  earnedAt    DateTime  @default(now())
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  badgeId     String
  badge       Badge     @relation(fields: [badgeId], references: [id])
  
  @@unique([userId, badgeId])
  @@map("user_badges")
}

model Activity {
  id          String    @id @default(cuid())
  type        ActivityType
  metadata    Json?     // flexible data storage
  createdAt   DateTime  @default(now())
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@map("activities")
}

enum ActivityType {
  MILESTONE_COMPLETED
  PLAN_CREATED
  PLAN_COMPLETED
  STREAK_MAINTENED
  STREAK_BROKEN
  BADGE_EARNED
  LEVEL_UP
}
```

---

## 4. API Design

### Base URL
```
/api/v1
```

### Authentication
```
POST   /auth/register        # Create account
POST   /auth/login           # Get tokens
POST   /auth/refresh         # Refresh access token
POST   /auth/logout          # Invalidate refresh token
```

### Users
```
GET    /users/me             # Get current user profile
PATCH  /users/me             # Update profile
GET    /users/me/stats       # Get user statistics
```

### Plans
```
GET    /plans                # List user's plans
POST   /plans                # Create new plan
GET    /plans/:id            # Get plan details
PATCH  /plans/:id            # Update plan
DELETE /plans/:id            # Delete plan
POST   /plans/:id/activate   # Set as active plan
GET    /plans/:id/history     # Get version history
POST   /plans/:id/restore/:v  # Restore version
```

### Modules
```
GET    /plans/:planId/modules           # List modules
POST   /plans/:planId/modules           # Create module
PATCH  /modules/:id                     # Update module
DELETE /modules/:id                     # Delete module
POST   /plans/:planId/modules/reorder   # Reorder modules
```

### Milestones
```
GET    /modules/:moduleId/milestones    # List milestones
POST   /modules/:moduleId/milestones    # Create milestone
PATCH  /milestones/:id                  # Update milestone
DELETE /milestones/:id                  # Delete milestone
POST   /milestones/:id/complete         # Mark complete
POST   /milestones/:id/resources        # Add resource
```

### AI Tutor
```
POST   /ai/generate-plan     # Generate study plan
POST   /ai/chat              # Chat with tutor
POST   /ai/adjust            # Adjust plan based on feedback
GET    /ai/summary/:planId   # Get weekly summary
```

### Admin
```
GET    /admin/users                # List all users
PATCH  /admin/users/:id            # Update user
DELETE /admin/users/:id            # Deactivate user
GET    /admin/analytics            # System analytics
GET    /admin/analytics/export     # Export data
PATCH  /admin/ai-config            # Update AI settings
```

### Gamification
```
GET    /me/badges              # Get earned badges
GET    /me/leaderboard         # Get leaderboard (future)
```

---

## 5. Request/Response Examples

### POST /api/v1/ai/generate-plan
```typescript
// Request
{
  "goal": "Learn Spanish to B2 level",
  "duration": "6 months",
  "dailyTime": "2 hours",
  "topics": ["grammar", "conversation", "vocabulary"]
}

// Response
{
  "plan": {
    "id": "clx123...",
    "title": "Spanish B2 Mastery Plan",
    "modules": [
      {
        "id": "mod1",
        "title": "A1 Foundations",
        "order": 1,
        "milestones": [
          {
            "id": "ms1",
            "title": "Greetings and Basic Phrases",
            "description": "Learn essential greetings...",
            "xpReward": 50,
            "estimatedDuration": "2 days"
          }
        ]
      }
    ]
  },
  "estimatedCompletion": "2026-09-22"
}
```

### POST /api/v1/milestones/:id/complete
```typescript
// Response
{
  "milestone": { ... },
  "xpEarned": 50,
  "totalXp": 450,
  "levelUp": false,
  "newBadge": null,
  "streakUpdated": {
    "current": 7,
    "longest": 12
  }
}
```

---

## 6. Frontend Structure

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base components (Button, Input, Card)
│   │   ├── layout/          # Header, Sidebar, Footer
│   │   └── features/        # Feature-specific components
│   │       ├── dashboard/
│   │       ├── planner/
│   │       ├── gamification/
│   │       └── admin/
│   │
│   ├── pages/               # Route components
│   │   ├── Dashboard.tsx
│   │   ├── Planner.tsx
│   │   ├── Tutor.tsx
│   │   ├── Profile.tsx
│   │   └── admin/
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePlan.ts
│   │   └── useGamification.ts
│   │
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── planStore.ts
│   │   └── gamificationStore.ts
│   │
│   ├── services/            # API client
│   │   ├── api.ts           # Axios instance
│   │   ├── authService.ts
│   │   ├── planService.ts
│   │   └── aiService.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   │
│   └── utils/               # Utilities
│       ├── constants.ts
│       └── helpers.ts
│
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

---

## 7. Backend Structure

```
server/
├── src/
│   ├── config/              # Configuration
│   │   └── index.ts
│   │
│   ├── controllers/          # Route handlers
│   │   ├── authController.ts
│   │   ├── planController.ts
│   │   ├── moduleController.ts
│   │   ├── milestoneController.ts
│   │   ├── aiController.ts
│   │   └── adminController.ts
│   │
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── planService.ts
│   │   ├── gamificationService.ts
│   │   └── aiService.ts
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT verification
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   │
│   ├── routes/              # Express routes
│   │   └── index.ts
│   │
│   ├── prisma/              # Database
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── utils/               # Utilities
│       └── jwt.ts
│
├── package.json
└── tsconfig.json
```

---

## 8. AI Integration (OpenRouter)

### Configuration
```typescript
// server/src/services/aiService.ts
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const FREE_MODELS = [
  'meta-llama/llama-3-8b-instruct',  // Best overall
  'mistralai/mistral-7b-instruct',   // Fast
  'openchat/openchat-7b',            // Good for chat
];

interface AIGenerationRequest {
  goal: string;
  duration: string;
  dailyTime: string;
  topics?: string[];
}

interface AIPlanResponse {
  title: string;
  modules: Array<{
    title: string;
    description: string;
    milestones: Array<{
      title: string;
      description: string;
      estimatedDuration: string;
    }>;
  }>;
}
```

### Prompt Templates
```typescript
const PLAN_GENERATION_PROMPT = `You are an expert curriculum designer. Create a personalized study plan based on:
- Goal: {goal}
- Duration: {duration}
- Daily time available: {dailyTime}
- Topics: {topics}

Return a JSON plan with:
{
  "title": "Plan title",
  "modules": [{
    "title": "Module name",
    "description": "Brief description",
    "milestones": [{
      "title": "Milestone name",
      "description": "What to accomplish",
      "estimatedDuration": "X days"
    }]
  }]
}

Rules:
- 6-12 modules
- 3-5 milestones per module
- Progressive difficulty
- Practical, achievable milestones
- Return ONLY valid JSON`;

const TUTOR_PROMPT = `You are a friendly, encouraging AI tutor named "TutorAI". 
You help students with their study plans. Be:
- Supportive and motivating
- Clear and concise
- Patient with questions
- Able to provide examples
- Aware of the student's current plan context

Current context: {context}`;
```

---

## 9. Security Considerations

| Layer | Measure |
|-------|---------|
| Auth | JWT with short expiry (15min), refresh token rotation |
| Password | bcrypt with salt rounds = 12 |
| API | Rate limiting (100 req/min), input validation with Zod |
| CORS | Configured for specific origins |
| SQL | Prisma parameterized queries (no raw SQL with user input) |
| XSS | React auto-escapes, CSP headers |
| AI | Prompt injection prevention, output sanitization |

---

## 10. File Changes Summary

| Path | Action | Description |
|------|--------|-------------|
| `client/` | Create | React + Vite frontend scaffold |
| `client/package.json` | Create | Dependencies: React, Zustand, React Router, Axios, Tailwind |
| `client/vite.config.ts` | Create | Vite configuration with proxy |
| `client/src/` | Create | Components, pages, stores, services |
| `server/` | Create | Node.js + Express backend scaffold |
| `server/package.json` | Create | Dependencies: Express, Prisma, JWT, Zod, Axios |
| `server/prisma/schema.prisma` | Create | Full database schema |
| `server/src/` | Create | Controllers, services, middleware, routes |
| `.env.example` | Create | Environment variables template |
| `docker-compose.yml` | Create | PostgreSQL + app setup |

---

## 11. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Vitest (frontend), Jest (backend) | 80% |
| Integration | Supertest (API routes) | 70% |
| E2E | Playwright | Critical flows |

### Critical Test Flows
1. Register → Login → Generate Plan → Complete Milestone
2. Streak maintenance over multiple days
3. AI plan generation and adjustment
4. Admin user management

---

## 12. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/studyplanai"

# Auth
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-super-secret-key-min-32-chars"

# AI
OPENROUTER_API_KEY="sk-or-v1-..."

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 13. Open Questions

- [ ] **Database choice**: PostgreSQL confirmed, but consider Supabase for easier setup?
- [ ] **Real-time features**: WebSocket for AI chat? Or polling for MVP?
- [ ] **File uploads**: How to handle milestone attachments? S3? Base64?
- [ ] **AI cost management**: Rate limiting strategy? Cache AI responses?
- [ ] **Email notifications**: For streak warnings? Weekly summaries?
- [ ] **Deployment target**: Vercel + Railway? Docker on VPS?

---

## 14. Estimated MVP Scope

For initial release, focus on:

### Must Have (MVP)
1. User auth (register/login/logout)
2. AI plan generation (basic prompt)
3. Module/Milestone CRUD
4. Progress tracking (mark complete)
5. XP + Level system
6. Basic dashboard

### Nice to Have (Post-MVP)
1. AI chat with tutor
2. Streak protection (freezes)
3. Admin panel
4. Analytics
5. Plan history/restore
6. AI plan adjustment

---

*(End of document)*
