#!/bin/bash
# Start script with migration handling

echo "🔄 Running database migrations..."

# Try to run migrations with timeout (non-blocking)
timeout 15s npx prisma migrate deploy || {
echo "⚠️ Migration skipped or failed (timeout or connection issue)"
echo "📝 The application will start anyway..."
}

echo "🚀 Starting server on port $PORT..."
node dist/index.js
