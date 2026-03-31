#!/bin/bash
echo "🔄 Running database migrations..."
timeout 15s npx prisma migrate deploy || {
echo "⚠️ Migration skipped or failed (timeout or connection issue)"
echo "📝 The application will start anyway..."
}

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
