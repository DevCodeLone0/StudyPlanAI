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
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
app.use('/api/v1/modules', planRouter)
app.use('/api/v1/milestones', planRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/admin', adminRouter)

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API docs: http://localhost:${PORT}/api/v1`)
})

export default app
