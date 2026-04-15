# Dockerfile para NeuroAsistente TDAH - Coolify
FROM node:22-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache git python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package.json ./
COPY frontend/package.json ./frontend/

# Instalar dependencias globales y de desarrollo
RUN npm install -g typescript
RUN npm install

# Copiar todo el código
COPY . .

# Construir frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Stage de producción
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
