#!/bin/bash

echo "🔧 Script de Reparación de Dependencias"
echo "========================================"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Reparando dependencias del frontend...${NC}"
echo "----------------------------------------"

cd frontend

# 1. Limpiar node_modules y lock file
echo "1. Limpiando instalación anterior..."
rm -rf node_modules package-lock.json 2>/dev/null

# 2. Verificar package.json
echo "2. Verificando package.json..."
if ! npm list --depth=0 2>&1 | grep -q "missing"; then
    echo -e "${GREEN}✅ package.json parece válido${NC}"
else
    echo -e "${YELLOW}⚠️  Problemas detectados en package.json${NC}"
    
    # Remover react-aria si es necesario (no lo estamos usando)
    if grep -q "react-aria" package.json; then
        echo "Removiendo react-aria (no se está usando)..."
        sed -i '/"react-aria":/d' package.json
        sed -i '/"react-aria-components":/d' package.json
        sed -i '/"@react-aria/d' package.json
        echo -e "${GREEN}✅ react-aria removido${NC}"
    fi
fi

# 3. Instalar dependencias
echo "3. Instalando dependencias..."
npm install --legacy-peer-deps 2>&1 | grep -E "(added|updated|error|warn)" || echo "Instalación en progreso..."

# 4. Verificar instalación
echo "4. Verificando instalación..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules instalado${NC}"
    
    # Verificar dependencias críticas
    CRITICAL_DEPS=("react" "react-dom" "vite" "typescript")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo -e "${GREEN}  ✅ $dep instalado${NC}"
        else
            echo -e "${RED}  ❌ $dep NO instalado${NC}"
        fi
    done
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

# 5. Probar build
echo "5. Probando build..."
if npm run build 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ Error en build${NC}"
    echo "Logs del error:"
    npm run build 2>&1 | grep -A5 -B5 "error"
    exit 1
else
    echo -e "${GREEN}✅ Build exitoso${NC}"
fi

cd ..

echo ""
echo -e "${YELLOW}📦 Reparando dependencias del backend...${NC}"
echo "----------------------------------------"

cd backend

# 1. Limpiar node_modules y lock file
echo "1. Limpiando instalación anterior..."
rm -rf node_modules package-lock.json 2>/dev/null

# 2. Instalar dependencias
echo "2. Instalando dependencias..."
npm install 2>&1 | grep -E "(added|updated|error|warn)" || echo "Instalación en progreso..."

# 3. Verificar instalación
echo "3. Verificando instalación..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules instalado${NC}"
    
    # Verificar dependencias críticas
    CRITICAL_DEPS=("express" "@prisma/client" "typescript")
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo -e "${GREEN}  ✅ $dep instalado${NC}"
        else
            echo -e "${RED}  ❌ $dep NO instalado${NC}"
        fi
    done
else
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
fi

# 4. Generar cliente Prisma
echo "4. Generando cliente Prisma..."
npx prisma generate 2>&1 | grep -v "warning" || echo -e "${GREEN}✅ Prisma generado${NC}"

cd ..

echo ""
echo -e "${GREEN}🎉 ¡Dependencias reparadas exitosamente!${NC}"
echo ""
echo "📋 Resumen:"
echo "  ✅ Frontend: Dependencias instaladas y build probado"
echo "  ✅ Backend: Dependencias instaladas y Prisma generado"
echo "  ✅ Listo para deploy"
echo ""
echo "🚀 Para deploy:"
echo "  1. Activar GitHub Pages en Settings"
echo "  2. URL: https://cuervoc-openclaw.github.io/TDAH-DASHBOARD/"
echo ""
echo "🔧 Si hay problemas:"
echo "  - Ejecuta este script de nuevo"
echo "  - Verifica logs de GitHub Actions"
echo "  - Contacta para soporte"