# 🚀 Guía Visual: Deploy en Vercel PASO A PASO

## 📋 **PASO 1: Ir a Vercel**
1. Abre: **[vercel.com](https://vercel.com)**
2. Inicia sesión con tu cuenta de GitHub

## 📋 **PASO 2: Importar Proyecto**
1. Haz clic en **"New Project"** (botón grande)
2. Selecciona **"Import Git Repository"**
3. Busca: `cuervoc-openclaw/TDAH-DASHBOARD`
4. Haz clic en **"Import"**

![Paso 2](https://vercel.com/_next/static/media/create-new-project.44f6c0a7.png)

## 📋 **PASO 3: Configurar Proyecto**
**Vercel detectará automáticamente:**
- ✅ Framework: Vite (React)
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Root Directory: `frontend`

**NO cambies nada**, solo haz clic en **"Deploy"**

## 📋 **PASO 4: Variables de Entorno (OPCIONAL para demo)**
**Si quieres probar la API también:**
1. En la sección **"Environment Variables"**
2. Agrega estas variables:

```
DATABASE_URL=file:memory:?cache=shared
JWT_SECRET=neuroasistente_secreto_demo_2024
NODE_ENV=production
```

3. Haz clic en **"Add"** para cada una

## 📋 **PASO 5: ¡Deploy!
1. Haz clic en **"Deploy"** (botón azul)
2. Espera 2-5 minutos
3. Vercel te dará una URL como: `https://neuroasistente-tdah.vercel.app`

## 🎯 **¿Qué deberías ver?**

### **Durante el deploy:**
```
✓ Cloning repository...
✓ Installing dependencies...
✓ Building project...
✓ Deploying to Vercel...
✓ Success! Your site is live
```

### **Si hay errores:**
- **Error de build:** Revisa los logs
- **Error de dependencias:** Vercel las instala automáticamente
- **Error de configuración:** Usa la configuración por defecto

## 🔧 **Solución de Problemas Comunes**

### **Problema 1: "No se encuentra el repositorio"**
- Verifica que estés logueado con la cuenta correcta de GitHub
- Asegúrate de que el repo sea público (o tengas acceso)

### **Problema 2: "Build failed"**
- Haz clic en **"View Logs"**
- Cópialos y compártelos conmigo
- Puedo arreglar cualquier error

### **Problema 3: "No carga la página"**
- Espera 1-2 minutos después del deploy
- Refresca la página
- Prueba en modo incógnito

## 📱 **Para probar después del deploy:**

### **1. Frontend:**
```
https://[tu-url].vercel.app
```
- Debería cargar la interfaz de NeuroAsistente
- Puedes probar el Pomodoro timer
- La navegación debería funcionar

### **2. API (si configuraste variables):**
```
https://[tu-url].vercel.app/health
```
- Debería responder: `{"status":"healthy",...}`

### **3. Demo endpoint:**
```
https://[tu-url].vercel.app/api/demo
```
- Información del proyecto

## 🆘 **Si necesitas ayuda:**

### **Compárteme:**
1. **URL** que te dio Vercel
2. **Captura de pantalla** del error (si hay)
3. **Mensajes** que aparecieron

### **Yo puedo:**
✅ Verificar la configuración remota
✅ Arreglar errores de build
✅ Actualizar el código si es necesario
✅ Guiarte paso a paso

## 🎉 **¡Listo para intentarlo!**

**Resumen rápido:**
1. **Vercel.com** → Login con GitHub
2. **New Project** → Importar `cuervoc-openclaw/TDAH-DASHBOARD`
3. **Deploy** (sin cambiar configuración)
4. **Compartir URL** conmigo
5. **¡Probar!**

**¿Listo para el intento #2?** 🚀