#!/bin/bash

echo "🚀 Script de Deploy para NeuroAsistente TDAH"
echo "============================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: No se encuentra el proyecto. Ejecuta desde la raíz del proyecto."
    exit 1
fi

echo "📦 Instalando dependencias..."
cd frontend && npm install
cd ../backend && npm install
cd ..

echo "🔧 Configurando variables de entorno..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Archivo .env creado. Edita backend/.env con tus valores."
fi

echo "📊 Configurando base de datos..."
cd backend
npx prisma generate
npx prisma migrate dev --name init
cd ..

echo "🌐 Configurando para Vercel..."
echo ""
echo "📋 PASOS MANUALES PARA COMPLETAR:"
echo ""
echo "1. Ve a https://vercel.com y crea cuenta con GitHub"
echo "2. Haz clic en 'New Project'"
echo "3. Importa el repositorio: cuervoc-openclaw/TDAH-DASHBOARD"
echo "4. En 'Environment Variables', agrega:"
echo "   - DATABASE_URL: sqlite:./dev.db"
echo "   - JWT_SECRET: tu_secreto_aqui"
echo "5. Haz clic en 'Deploy'"
echo ""
echo "🔗 Tu app estará disponible en: https://neuroasistente-tdah.vercel.app"
echo ""
echo "💡 Para desarrollo local:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo "   Navegador: http://localhost:3000"
echo ""
echo "✅ Script completado. ¡Sigue los pasos arriba!"