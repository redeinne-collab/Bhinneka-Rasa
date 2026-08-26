#!/bin/sh
# Railway clones repo ke /app — struktur: /app/backend/dist/
BACKEND="/app/backend"

echo "✅ Starting backend from: $BACKEND"
echo "📁 Contents of /app:"
ls /app

cd "$BACKEND" || { echo "❌ Cannot cd to $BACKEND"; exit 1; }

echo "📁 Contents of $BACKEND:"
ls .

echo "⚙️ Running initDb..."
node dist/scripts/initDb.js

echo "🚀 Starting server..."
node dist/server.js
