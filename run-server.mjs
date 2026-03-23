import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Find tsx
const tsx = require('tsx')

// Run the server
tsx.run('./src/index.ts')
