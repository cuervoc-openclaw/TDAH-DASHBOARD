#!/bin/bash
# levantar-tdah.sh — Levanta el backend y frontend del TDAH Dashboard
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Levantando TDAH Dashboard ==="

# 1. Matar instancias previas
pkill -f "tsx" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# 2. Generar Prisma
cd "$DIR/backend"
npx prisma generate 2>&1 | tail -1

# 3. Backend
echo "→ Backend..."
nohup npx tsx src/index.ts > /tmp/tdah-backend.log 2>&1 &
echo "  PID: $!"
sleep 3

# 4. Frontend
echo "→ Frontend..."
cd "$DIR/frontend"
nohup npx vite --host 0.0.0.0 --port 3000 > /tmp/tdah-frontend.log 2>&1 &
echo "  PID: $!"

sleep 2
echo ""
echo "=== URLs ==="
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"
echo ""
echo "Logs: tail -f /tmp/tdah-backend.log"
echo "      tail -f /tmp/tdah-frontend.log"
echo ""
echo "Para detener: pkill -f 'tsx' && pkill -f 'vite'
