# 🚀 Deploy del NeuroAsistente TDAH

## Opción 1: Vercel (Recomendado para desarrollo y preview)

Vercel es la opción más fácil y rápida para ver el proyecto funcionando en tiempo real.

### Pasos para deploy en Vercel:

1. **Crear cuenta en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con tu cuenta de GitHub

2. **Importar proyecto:**
   - Haz clic en "New Project"
   - Selecciona el repositorio `cuervoc-openclaw/TDAH-DASHBOARD`
   - Vercel detectará automáticamente la configuración

3. **Configurar variables de entorno:**
   - En la sección "Environment Variables" agrega:
     ```
     DATABASE_URL=sqlite:./dev.db (para desarrollo)
     JWT_SECRET=tu_secreto_jwt_aqui
     ```

4. **Deploy automático:**
   - Vercel hará deploy automáticamente
   - Cada push a `main` actualizará el sitio

5. **URL de preview:**
   - Obtendrás una URL como: `https://neuroasistente-tdah.vercel.app`

### Estructura de deploy:

- **Frontend:** `https://neuroasistente-tdah.vercel.app`
- **Backend:** `https://neuroasistente-tdah-api.vercel.app/api`

## Opción 2: Netlify (Alternativa)

1. **Crear cuenta en Netlify:**
   - Ve a [netlify.com](https://netlify.com)
   - Regístrate con GitHub

2. **Deploy desde GitHub:**
   - "New site from Git"
   - Selecciona el repositorio
   - Configuración:
     - Build command: `cd frontend && npm run build`
     - Publish directory: `frontend/dist`

3. **Configurar funciones:**
   - Para el backend, necesitarás configurar Netlify Functions

## Opción 3: CPanel (Para producción final)

Cuando el proyecto esté 100% terminado, puedes subirlo a CPanel:

### Preparación para CPanel:

1. **Build del proyecto:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Backend para CPanel:**
   - CPanel generalmente soporta Node.js
   - Sube la carpeta `backend` completa
   - Configura Node.js en el panel de control

3. **Base de datos:**
   - CPanel incluye MySQL/PostgreSQL
   - Actualiza `DATABASE_URL` en las variables

### Pasos específicos para CPanel:

1. **Subir archivos:**
   - Usa File Manager o FTP
   - Sube todo el contenido de `frontend/dist` a `public_html`

2. **Configurar Node.js:**
   - En CPanel, busca "Setup Node.js App"
   - Especifica la versión (Node.js 18+)
   - Punto de entrada: `backend/src/index.ts`

3. **Base de datos MySQL:**
   - Crea base de datos y usuario
   - Importa el schema desde `backend/prisma/schema.prisma`

## 🛠️ Configuración Local para Desarrollo

```bash
# 1. Clonar repositorio
git clone https://github.com/cuervoc-openclaw/TDAH-DASHBOARD.git
cd TDAH-DASHBOARD

# 2. Instalar dependencias
cd frontend && npm install
cd ../backend && npm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# 4. Iniciar base de datos
cd backend
npx prisma migrate dev
npx prisma db seed

# 5. Iniciar servidores
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev

# 6. Abrir en navegador
# http://localhost:3000
```

## 🔧 Variables de Entorno Requeridas

### Backend (.env):
```env
DATABASE_URL="sqlite:./dev.db"  # o PostgreSQL para producción
JWT_SECRET="tu_secreto_jwt_muy_seguro"
PORT=3001
NODE_ENV="development"
```

### Frontend (.env):
```env
VITE_API_URL="http://localhost:3001"  # Local
# Para producción:
# VITE_API_URL="https://neuroasistente-tdah-api.vercel.app/api"
```

## 📦 Build para Producción

```bash
# Frontend
cd frontend
npm run build
# Los archivos estarán en frontend/dist

# Backend
cd backend
npm run build
# Los archivos TypeScript se compilarán a JavaScript
```

## 🔄 CI/CD Automático

El proyecto está configurado para:
- **Deploy automático** en Vercel con cada push a `main`
- **Build optimizado** para producción
- **PWA ready** - Instalable como app nativa
- **Responsive** - Funciona en móvil y desktop

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error de base de datos:
```bash
cd backend
npx prisma generate
npx prisma migrate reset
```

### Error en Vercel:
- Verifica las variables de entorno
- Revisa los logs en Vercel Dashboard
- Asegúrate de que `vercel.json` esté configurado correctamente

## 📞 Soporte

Para problemas con el deploy:
1. Revisa los logs de error
2. Verifica variables de entorno
3. Asegúrate de que todas las dependencias estén instaladas
4. Contacta si necesitas ayuda específica con CPanel

---

**Nota:** Para desarrollo y testing, usa Vercel. Para producción final con tu propio dominio, usa CPanel.