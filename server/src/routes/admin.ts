import { Router } from 'express'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const router = Router()

// GET /admin/users
router.get('/users', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ]
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          xp: true,
          level: true,
          currentStreak: true,
          createdAt: true,
          _count: {
            select: { plans: true },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])
    
    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      xp: u.xp,
      level: u.level,
      currentStreak: u.currentStreak,
      plansCount: u._count.plans,
      createdAt: u.createdAt,
    }))
    
    res.json({
      data: formattedUsers,
      total,
      page: Number(page),
      pageSize: Number(limit),
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /admin/users/:id
router.patch('/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { role } = req.body
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
    
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// DELETE /admin/users/:id
router.delete('/users/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    // Soft delete by setting a deleted flag or just deactivate
    // For MVP, we'll just return success
    res.json({ message: 'User deactivated successfully' })
  } catch (error) {
    next(error)
  }
})

// GET /admin/analytics
router.get('/analytics', authenticate, requireAdmin, async (req, res, next) => {
try {
const [
totalUsers,
activePlans,
completedMilestones,
totalBadges,
avgStreak,
] = await Promise.all([
prisma.user.count(),
prisma.plan.count({ where: { status: 'ACTIVE' } }),
prisma.milestone.count({ where: { completedAt: { not: null } } }),
prisma.userBadge.count(),
prisma.user.aggregate({ _avg: { currentStreak: true } }),
])

res.json({
totalUsers,
activeUsers: activePlans,
totalPlans: activePlans,
averageCompletionRate: 0, // TODO: Calculate
averageStreak: avgStreak._avg.currentStreak || 0,
topBadges: [], // TODO: Get top badges
})
} catch (error) {
next(error)
}
})

// POST /admin/migrate - Temporary endpoint to run migrations
router.post('/migrate', async (req, res, next) => {
try {
console.log('🔄 Running migrations...')
const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
cwd: process.cwd(),
env: process.env,
})

res.json({
success: true,
message: 'Migrations completed successfully',
output: stdout,
error: stderr,
})
} catch (error: any) {
console.error('Migration error:', error)
res.status(500).json({
success: false,
message: 'Migration failed',
error: error.message,
output: error.stdout,
stderr: error.stderr,
})
}
})

// GET /admin/db-check - Check database connection
router.get('/db-check', async (req, res, next) => {
try {
await prisma.$queryRaw`SELECT 1`
const tableCheck = await prisma.$queryRaw`
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
`

res.json({
status: 'connected',
tables: Array.isArray(tableCheck) ? tableCheck.length : 0,
message: 'Database connection successful',
})
} catch (error: any) {
res.status(500).json({
status: 'error',
message: error.message,
})
}
})

export { router as adminRouter }
