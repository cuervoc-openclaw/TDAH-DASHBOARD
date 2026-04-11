#!/bin/bash

echo "🔍 Verificador de Deploy en Vercel"
echo "=================================="

# Pedir URL si no se proporciona como argumento
if [ -z "$1" ]; then
    echo "❓ Por favor, proporciona la URL de Vercel:"
    echo "   Ejemplo: ./check-vercel-deploy.sh https://neuroasistente-tdah.vercel.app"
    exit 1
fi

VERCEL_URL="$1"
echo "🔗 Verificando: $VERCEL_URL"
echo ""

# Función para verificar endpoint
check_endpoint() {
    local endpoint="$1"
    local url="${VERCEL_URL}${endpoint}"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        echo "🔄 Probando: $endpoint"
        
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
        
        if [ "$response" = "200" ]; then
            content=$(curl -s "$url")
            echo "✅ HTTP $response - OK"
            
            # Mostrar contenido para endpoints importantes
            if [ "$endpoint" = "/health" ] || [ "$endpoint" = "/api/demo" ]; then
                echo "📄 Contenido:"
                echo "$content" | python3 -m json.tool 2>/dev/null || echo "$content"
            fi
            return 0
        elif [ "$response" = "000" ]; then
            echo "❌ No hay respuesta (servidor no disponible)"
        else
            echo "⚠️  HTTP $response"
        fi
        
        retry_count=$((retry_count + 1))
        
        if [ $retry_count -lt $max_retries ]; then
            echo "⏳ Reintentando en 3 segundos..."
            sleep 3
        fi
    done
    
    echo "❌ Falló después de $max_retries intentos"
    return 1
}

# Verificar endpoints principales
echo "📊 Verificando endpoints del frontend..."
check_endpoint "/"

echo ""
echo "📊 Verificando API..."
check_endpoint "/health"
check_endpoint "/api/demo"

echo ""
echo "🔧 Verificando PWA..."
check_endpoint "/manifest.json"
check_endpoint "/service-worker.js"

echo ""
echo "🌐 Verificando CORS..."
echo "🔄 Probando CORS headers..."
cors_check=$(curl -s -I "${VERCEL_URL}/health" | grep -i "access-control-allow-origin" || echo "No CORS headers found")

if [[ $cors_check == *"*"* ]] || [[ $cors_check == *"${VERCEL_URL}"* ]]; then
    echo "✅ CORS configurado correctamente"
else
    echo "⚠️  CORS podría necesitar configuración: $cors_check"
fi

echo ""
echo "📈 Resumen del deploy:"
echo "----------------------"

# Verificar tiempos de respuesta
echo "⏱️  Tiempos de respuesta:"
for endpoint in "/" "/health" "/api/demo"; do
    time_output=$(curl -s -w "Tiempo total: %{time_total}s\\n" -o /dev/null "${VERCEL_URL}${endpoint}" 2>/dev/null || echo "Error")
    echo "  $endpoint: $time_output"
done

echo ""
echo "🎯 Recomendaciones:"
echo "-------------------"

# Verificar si es HTTPS
if [[ $VERCEL_URL == https://* ]]; then
    echo "✅ HTTPS activado (seguro)"
else
    echo "⚠️  Considera usar HTTPS para producción"
fi

# Verificar redirección www
if [[ $VERCEL_URL != *"www."* ]]; then
    echo "ℹ️  Vercel maneja automáticamente www y non-www"
fi

echo ""
echo "🚀 Para probar manualmente:"
echo "1. Abre: $VERCEL_URL"
echo "2. Verifica que cargue la interfaz"
echo "3. Prueba el Pomodoro timer"
echo "4. Intenta registrarte (demo)"
echo ""
echo "🔧 Si hay problemas:"
echo "1. Revisa los logs en Vercel Dashboard"
echo "2. Verifica variables de entorno"
echo "3. Asegúrate de que DATABASE_URL esté configurada"
echo "4. Contacta para ayuda técnica"

echo ""
echo "✅ Verificación completada"