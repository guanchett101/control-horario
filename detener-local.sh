#!/bin/bash

echo "🛑 Deteniendo Control de Horarios..."
echo ""

# Leer PIDs si existen
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "🔴 Deteniendo backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "🔴 Deteniendo frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
fi

# Matar todos los procesos de node relacionados (por si acaso)
echo "🧹 Limpiando procesos de Node.js..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "node server.js" 2>/dev/null

echo ""
echo "✅ Servidores detenidos"
echo ""
