# StudyPlanAI Development Guide

## Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- OpenRouter API key (free tier)

## Quick Start

```bash
# Start PostgreSQL
docker-compose up -d

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Setup database
cp ../.env.example .env
# Edit .env with your values
npm run db:push
npm run db:seed

# Run development servers
npm run dev
```

## Development

### Client (http://localhost:5173)
```bash
cd client
npm run dev    # Vite dev server
npm run build  # Production build
```

### Server (http://localhost:3000)
```bash
cd server
npm run dev    # tsx watch
npm run build  # TypeScript compile
```

### Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to DB
npm run db:migrate  # Run migrations
npm run db:seed     # Seed data
npm run db:studio   # Prisma Studio
```

## Testing
```bash
# Client tests
cd client && npm test

# Server tests
cd server && npm test
```

## Project Structure

```
StudyPlanAI/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/      # Route pages
│   │   ├── stores/     # Zustand stores
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript types
│   └── ...
│
├── server/           # Express backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── ...
│   ├── prisma/         # Database schema
│   └── ...
│
├── docker-compose.yml # PostgreSQL
└── ...
```

## Environment Variables

See `.env.example` for all required variables.

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `OPENROUTER_API_KEY` - AI API key

## Deployment

### Client
```bash
cd client
npm run build
# Deploy dist/ to Vercel, Netlify, etc.
```

### Server
```bash
cd server
npm run build
# Deploy to Railway, Render, Fly.io, etc.
```

### Database
Use Supabase, Neon, or managed PostgreSQL.
