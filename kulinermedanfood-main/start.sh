#!/bin/sh
# Auto-detect backend directory path
if [ -d "/app/kulinermedanfood-main/backend/dist" ]; then
  BACKEND="/app/kulinermedanfood-main/backend"
elif [ -d "/app/backend/dist" ]; then
  BACKEND="/app/backend"
else
  echo "❌ Cannot find backend/dist directory. Build may have failed."
  echo "Contents of /app:"
  ls /app
  exit 1
fi

echo "✅ Found backend at: $BACKEND"
cd "$BACKEND"
node dist/scripts/initDb.js
node dist/server.js
