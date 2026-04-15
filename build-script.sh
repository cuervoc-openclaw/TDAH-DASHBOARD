#!/bin/bash
# Build script para Coolify/Nixpacks
cd /app

# Instalar TypeScript globalmente si no está
if ! command -v tsc &> /dev/null; then
    npm install -g typescript
fi

# Instalar dependencias del frontend
cd frontend
npm install

# Build
npm run build

# Mover archivos a ubicación esperada
mkdir -p /app/dist
cp -r dist/* /app/dist/
