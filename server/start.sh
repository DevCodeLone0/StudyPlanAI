#!/bin/bash
set -e

echo "🔄 Running database migrations..."

# Fix for Supabase/pgbouncer: disable prepared statements
export PRISMA_DISABLE_PREPARED_STATEMENTS="true"

# Retry logic with exponential backoff
MAX_RETRIES=5
RETRY_DELAY=10
TIMEOUT=120
MIGRATION_SUCCESS=false

for i in $(seq 1 $MAX_RETRIES); do
  echo "🔄 Migration attempt $i/$MAX_RETRIES..."

  if timeout ${TIMEOUT}s npx prisma migrate deploy --schema=prisma/schema.prisma 2>&1; then
    echo "✅ Migration successful"
    MIGRATION_SUCCESS=true
    break
  else
    echo "⚠️ Migration attempt $i failed"

    if [ $i -eq $MAX_RETRIES ]; then
      echo "⚠️ All migration attempts failed. Starting anyway..."
    else
      echo "⏳ Retrying in ${RETRY_DELAY}s..."
      sleep $RETRY_DELAY
      RETRY_DELAY=$((RETRY_DELAY + 10))
    fi
  fi
done

if [ "$MIGRATION_SUCCESS" = true ]; then
  echo "✅ Database migrations completed successfully"
else
  echo "⚠️ Database migrations failed or skipped"
  echo "📝 The application will start anyway..."
  echo "📝 Note: Schema should already be in sync from previous deploys"
fi

echo "🚀 Starting server on port $PORT..."

# Iniciar el servidor en segundo plano
node dist/index.js &
SERVER_PID=$!

# Esperar 5 segundos y verificar si el proceso sigue vivo
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
echo "✅ Server started successfully (PID: $SERVER_PID)"
# Esperar a que el proceso termine
wait $SERVER_PID
else
echo "❌ Server failed to start"
exit 1
fi
