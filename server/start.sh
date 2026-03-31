#!/bin/bash
# Start script with migration handling

echo "🔄 Running database migrations..."

# Try to run migrations with timeout
timeout 10s npx prisma migrate deploy || {
  echo "⚠️  Migration skipped or failed (timeout or connection issue)"
  echo "📝 The application will start anyway..."
}

echo "🚀 Starting server..."
node dist/index.js
