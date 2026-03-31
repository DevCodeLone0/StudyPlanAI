import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

import { authRouter } from './routes/auth.js'
import { userRouter } from './routes/users.js'
import { planRouter } from './routes/plans.js'
import { aiRouter } from './routes/ai.js'
import { adminRouter } from './routes/admin.js'
import { gamificationRouter } from './routes/gamification.js'
import { badgeRouter } from './routes/badges.js'
import { rewardRouter } from './routes/rewards.js'
import { activityRouter } from './routes/activity.js'
import { streakRouter } from './routes/streaks.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const HOST = '0.0.0.0'

// Security middleware
const allowedOrigins = [
'http://localhost:5173',
'https://study-plan-ai.vercel.app',
]

// Helper function to check if origin is allowed
const isAllowedOrigin = (origin: string | undefined) => {
if (!origin) return false
// Allow exact matches
if (allowedOrigins.includes(origin)) return true
// Allow any vercel.app subdomain
if (origin.endsWith('.vercel.app')) return true
// Allow custom CORS_ORIGIN from env
if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return true
return false
}

app.use(helmet())
app.use(cors({
origin: isAllowedOrigin,
credentials: true,
}))

// Rate limiting
app.set('trust proxy', 1)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api', limiter)

// Body parsing
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/plans', planRouter)
app.use('/api/v1/modules', planRouter)
app.use('/api/v1/milestones', planRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/gamification', gamificationRouter)
app.use('/api/v1/badges', badgeRouter)
app.use('/api/v1/rewards', rewardRouter)
app.use('/api/v1/activity', activityRouter)
app.use('/api/v1/streaks', streakRouter)

// Error handling
app.use(errorHandler)

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`)
  console.log(`📚 API docs: http://${HOST}:${PORT}/api/v1`)
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✅ PORT: ${PORT}`)
  console.log(`✅ HOST: ${HOST}`)
})

server.on('error', (error: any) => {
  console.error('❌ Server error:', error.message)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

export default app
