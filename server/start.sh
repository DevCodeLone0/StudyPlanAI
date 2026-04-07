#!/bin/bash

# Fix for Supabase/pgbouncer: disable prepared statements
export PRISMA_DISABLE_PREPARED_STATEMENTS="true"

echo "🚀 Starting server on port $PORT..."

# Start server FIRST (background process)
node dist/index.js &
SERVER_PID=$!

# Give server time to bind to port
sleep 3

# Check if server started
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "❌ Server failed to start"
  exit 1
fi

echo "✅ Server started successfully (PID: $SERVER_PID)"

# Now run migrations in background (non-blocking)
echo "🔄 Running database migrations in background..."
(
  MAX_RETRIES=3
  RETRY_DELAY=5
  
  for i in $(seq 1 $MAX_RETRIES); do
    echo "🔄 Migration attempt $i/$MAX_RETRIES..."
    
    if npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1; then
      echo "✅ Migration successful"
      break
    else
      echo "⚠️ Migration attempt $i failed"
      
      if [ $i -eq $MAX_RETRIES ]; then
        echo "⚠️ All migration attempts failed. Schema may already be in sync."
      else
        echo "⏳ Retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
      fi
    fi
  done
) &

# Wait for server process
wait $SERVER_PID
