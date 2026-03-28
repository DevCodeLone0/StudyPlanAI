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
import { moduleRouter } from './routes/modules.js'
import { milestoneRouter } from './routes/milestones.js'
import { aiRouter } from './routes/ai.js'
import { adminRouter } from './routes/admin.js'
import { streakRouter } from './routes/streaks.js'
import { badgeRouter } from './routes/badges.js'
import { rewardRouter } from './routes/rewards.js'
import { activityRouter } from './routes/activity.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: process.env.NODE_ENV === 'development' ? false : { policy: 'same-origin' },
}))
// CORS configuration - normalize origin to handle trailing slash
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ''))
  : true

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
app.use('/api/v1/modules', moduleRouter)
app.use('/api/v1/milestones', milestoneRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/streaks', streakRouter)
app.use('/api/v1/badges', badgeRouter)
app.use('/api/v1/rewards', rewardRouter)
app.use('/api/v1/activity', activityRouter)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API docs: http://localhost:${PORT}/api/v1`)
})

export default app
