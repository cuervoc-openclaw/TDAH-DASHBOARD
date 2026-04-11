#!/bin/bash
echo "🚀 Solucionando GitHub Pages para NeuroAsistente TDAH"
echo "====================================================="

# Opción 1: Mover archivos a frontend/dist (como estaba configurado)
echo "📦 Opción 1: Mover archivos a frontend/dist/"
mkdir -p frontend/dist
mv assets frontend/dist/ 2>/dev/null
mv index.html frontend/dist/ 2>/dev/null
mv manifest.json frontend/dist/ 2>/dev/null
mv manifest.webmanifest frontend/dist/ 2>/dev/null
mv registerSW.js frontend/dist/ 2>/dev/null
mv sw.js frontend/dist/ 2>/dev/null
mv workbox-8c29f6e4.js frontend/dist/ 2>/dev/null
mv test.html frontend/dist/ 2>/dev/null

# Opción 2: Dejar en root y cambiar configuración de Pages
echo "📦 Opción 2: Configurar Pages para servir desde root"
echo ""
echo "📋 INSTRUCCIONES PARA USUARIO:"
echo "1. Ve a: https://github.com/cuervoc-openclaw/TDAH-DASHBOARD/settings/pages"
echo "2. En 'Source', cambia:"
echo "   - Branch: main"
echo "   - Folder: / (root)"
echo "3. Haz clic en 'Save'"
echo "4. Espera 2-3 minutos"
echo ""
echo "🌐 URL después del cambio:"
echo "https://cuervoc-openclaw.github.io/TDAH-DASHBOARD/"

# Verificar estructura
echo ""
echo "📁 Estructura actual:"
if [ -d "frontend/dist" ]; then
    echo "✅ frontend/dist/ existe"
    ls -la frontend/dist/
else
    echo "📁 Archivos en root:"
    ls -la | grep -E "\.html$|\.js$|assets|manifest"
fi
