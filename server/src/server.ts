// Server entry point - asegura que el servidor escuche ANTES de cargar routers pesados
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const HOST = '0.0.0.0'

// Security middleware
app.use(helmet())
app.use(cors({
origin: (origin, callback) => {
if (!origin) return callback(null, true)
if (origin.endsWith('.vercel.app')) return callback(null, true)
const allowed = [
'http://localhost:5173',
'https://study-plan-ai.vercel.app',
]
if (allowed.includes(origin)) return callback(null, true)
if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return callback(null, true)
callback(new Error('Not allowed by CORS'))
},
credentials: true,
}))

// Rate limiting
app.set('trust proxy', 1)
const limiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 100,
message: { error: 'Too many requests' },
})
app.use('/api', limiter)

app.use(express.json())

// Health check - ANTES de cualquier otra cosa
app.get('/health', (req, res) => {
res.json({ status: 'ok', timestamp: new Date().toISOString(), port: PORT })
})

app.get('/ready', (req, res) => {
res.json({ status: 'ready', uptime: process.uptime() })
})

console.log('✅ Health endpoints registered')

// Cargar routes dinámicamente
Promise.all([
import('./routes/auth.js'),
import('./routes/users.js'),
import('./routes/plans.js'),
import('./routes/ai.js'),
import('./routes/admin.js'),
import('./routes/gamification.js'),
import('./routes/badges.js'),
import('./routes/rewards.js'),
import('./routes/activity.js'),
import('./routes/streaks.js'),
import('./middleware/errorHandler.js'),
]).then(([
{ authRouter },
{ userRouter },
{ planRouter },
{ aiRouter },
{ adminRouter },
{ gamificationRouter },
{ badgeRouter },
{ rewardRouter },
{ activityRouter },
{ streakRouter },
{ errorHandler },
]) => {
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
app.use(errorHandler)

console.log('✅ All routes loaded')

// Start server
const server = app.listen(PORT, HOST, () => {
console.log(`🚀 Server running on http://${HOST}:${PORT}`)
console.log(`📚 API: http://${HOST}:${PORT}/api/v1`)
console.log(`✅ Health: http://${HOST}:${PORT}/health`)
})

server.on('error', (error: any) => {
console.error('❌ Server error:', error.message)
process.exit(1)
})

process.on('SIGTERM', () => {
server.close(() => process.exit(0))
})

}).catch(err => {
console.error('❌ Failed to load routes:', err)
process.exit(1)
})
