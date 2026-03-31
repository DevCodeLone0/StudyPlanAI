// Health check endpoint simple y sin dependencias
import express from 'express'
const app = express()
const PORT = process.env.PORT || 3000

app.get('/health', (req, res) => {
res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/ready', (req, res) => {
res.json({ status: 'ready', uptime: process.uptime() })
})

app.listen(PORT, () => {
console.log(`Health check server running on port ${PORT}`)
})
