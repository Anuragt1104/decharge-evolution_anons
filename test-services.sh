#!/bin/bash

echo "🧪 Testing DeCharge Evolution Services..."
echo ""

# Test Gateway
echo "1. Testing Gateway (http://localhost:8787)..."
GATEWAY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/api/health 2>/dev/null)
if [ "$GATEWAY_RESPONSE" == "200" ]; then
    echo "   ✅ Gateway is running"
else
    echo "   ❌ Gateway not responding (start it with: cd services/gateway && pnpm run dev)"
fi
echo ""

# Test Web App
echo "2. Testing Web App (http://localhost:3000)..."
WEBAPP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$WEBAPP_RESPONSE" == "200" ] || [ "$WEBAPP_RESPONSE" == "500" ]; then
    echo "   ✅ Web app is running"
else
    echo "   ❌ Web app not responding (start it with: cd apps/web-app && pnpm run dev)"
fi
echo ""

# Test WebSocket
echo "3. Testing Gateway WebSocket..."
if command -v wscat &> /dev/null; then
    timeout 2 wscat -c ws://localhost:8787/stream &>/dev/null && echo "   ✅ WebSocket working" || echo "   ⚠️  WebSocket check skipped (install wscat to test)"
else
    echo "   ⚠️  WebSocket check skipped (install wscat with: npm i -g wscat)"
fi
echo ""

# Check for Simulator logs
echo "4. Checking if Simulator is running..."
if pgrep -f "simulator.*dev" > /dev/null; then
    echo "   ✅ Simulator process found"
else
    echo "   ❌ Simulator not running (start it with: cd simulator && pnpm run dev)"
fi
echo ""

echo "================================================"
echo "Quick Start Commands (if services not running):"
echo "================================================"
echo ""
echo "Terminal 1 (Gateway):"
echo "  cd services/gateway && pnpm run dev"
echo ""
echo "Terminal 2 (Simulator):"
echo "  cd simulator && pnpm run dev"
echo ""
echo "Terminal 3 (Web App):"
echo "  cd apps/web-app && pnpm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
