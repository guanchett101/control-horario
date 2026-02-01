#!/bin/bash

echo "🚀 Iniciando Control de Horarios en modo local..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ Node.js y npm detectados"
echo ""

# Instalar dependencias del backend si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    npm install
fi

# Instalar dependencias del frontend si es necesario
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "🔧 Iniciando servidores..."
echo ""

# Iniciar backend en segundo plano
echo "▶️  Backend iniciando en puerto 3001..."
npm start > backend.log 2>&1 &
BACKEND_PID=$!

# Esperar 2 segundos
sleep 2

# Iniciar frontend en segundo plano
echo "▶️  Frontend iniciando en puerto 3000..."
cd frontend && npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar a que los servidores inicien
echo ""
echo "⏳ Esperando que los servidores inicien..."
sleep 8

echo ""
echo "✅ ¡Servidores iniciados!"
echo ""
echo "📋 Información:"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Abriendo navegador en http://localhost:3000..."
echo ""

# Abrir navegador según el sistema operativo
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v gnome-open &> /dev/null; then
    gnome-open http://localhost:3000
elif command -v firefox &> /dev/null; then
    firefox http://localhost:3000 &
elif command -v google-chrome &> /dev/null; then
    google-chrome http://localhost:3000 &
fi

echo "📝 Logs guardados en:"
echo "   - backend.log"
echo "   - frontend.log"
echo ""
echo "⚠️  Para detener los servidores, ejecuta: ./detener-local.sh"
echo "   O presiona Ctrl+C y luego ejecuta: killall node"
echo ""

# Guardar PIDs en archivo
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Mantener el script corriendo
echo "✨ Sistema corriendo. Presiona Ctrl+C para salir..."
wait
