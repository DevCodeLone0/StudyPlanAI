import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Change to server directory
process.chdir(join(__dirname, 'server'))

// Find and run tsx
const { run } = await import('tsx')
await run('./src/index.ts')
