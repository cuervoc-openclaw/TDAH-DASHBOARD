# NeuroAsistente TDAH - Dashboard Personalizado

![Neurodiversity](https://img.shields.io/badge/Neurodiversity-Friendly-FF6B6B)
![Accessibility](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-4ECDC4)
![PWA](https://img.shields.io/badge/PWA-✓-45B7D1)
![Open Source](https://github.com/cuervoc-openclaw/TDAH-DASHBOARD.git)

Dashboard web progresivo (PWA) minimalista y altamente personalizable diseñado específicamente para adultos con TDAH. Desarrollado por un equipo de 15 agentes autónomos de IA utilizando OpenClaw.

## 🎯 Características Principales

### 🧠 Diseñado para Neurodiversidad
- **Interfaz minimalista** para reducir sobrecarga cognitiva
- **Personalización profunda** (temas, tamaños, reducción de movimiento)
- **Feedback inmediato** y confirmaciones visuales
- **Patrones de interacción predecibles**

### 📋 Funcionalidades Esenciales
- **Vista "Hoy"** - Solo tareas prioritarias del día
- **Temporizador Pomodoro integrado** - Técnica de gestión del tiempo
- **Sistema de tareas inteligente** - Con desglose automático
- **Registro de hábitos** - Seguimiento de rachas y estadísticas
- **Sección de logros** - Refuerzo positivo visual
- **Recordatorios multiplataforma** - Push, email, WhatsApp

### 🔧 Tecnología
- **Frontend:** React 18+ con TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + Prisma ORM
- **Base de datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **PWA:** Funcionamiento offline + instalación en dispositivo
- **Hosting:** Vercel (frontend) + Railway (backend)

## 🚀 Comenzar

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/cuervoc-openclaw/TDAH-DASHBOARD.git
cd TDAH-DASHBOARD

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar base de datos (SQLite)
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

```env
# Backend (.env)
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_secreto_jwt"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Frontend (.env.local)
VITE_API_URL="http://localhost:3001"
VITE_ONESIGNAL_APP_ID="tu_app_id"
```

## 📁 Estructura del Proyecto

```
/neuroasistente-tdah
├── /docs                    # Documentación del proyecto
├── /frontend               # Aplicación React PWA
│   ├── /public            # Assets estáticos
│   └── /src               # Código fuente
│       ├── /components    # Componentes reutilizables
│       ├── /pages         # Páginas de la aplicación
│       ├── /hooks         # Custom hooks
│       ├── /stores        # Estado global (Zustand)
│       ├── /services      # Servicios API
│       ├── /utils         # Utilidades
│       └── /styles        # Estilos globales
├── /backend               # API Node.js
│   └── /src
│       ├── /controllers   # Controladores
│       ├── /models        # Modelos Prisma
│       ├── /routes        # Rutas API
│       ├── /middlewares   # Middlewares
│       ├── /services      # Lógica de negocio
│       └── /utils         # Utilidades
├── /agents                # Definiciones de agentes OpenClaw
│   ├── /souls            # "Almas"/personalidades
│   └── /definitions      # Definiciones completas
├── /scripts              # Scripts de automatización
├── .env.example          # Variables de entorno
├── docker-compose.yml    # Orquestación Docker
└── README.md            # Este archivo
```

## 🤖 Sistema de Agentes OpenClaw

El proyecto utiliza 15 agentes autónomos de IA especializados:

1. **Coordinador General** - Supervisión y asignación de tareas
2. **Investigador Científico** - Análisis continuo de TDAH
3. **Diseñador UX/UI** - Interfaces amigables para neurodiversidad
4. **Desarrollador Frontend** - Implementación de interfaz
5. **Desarrollador Backend** - Lógica del servidor
6. **Especialista en Integraciones** - WhatsApp/Telegram APIs
7. **Especialista en Recordatorios** - Sistema de notificaciones
8. **Analista de Datos** - Procesamiento de información
9. **Redactor de Contenidos** - Mensajes motivacionales
10. **Tester de Calidad** - Control de calidad
11. **Experto en SEO/Accesibilidad** - Optimización y accesibilidad
12. **Community Manager** - Gestión de comunidad
13. **Abogado/Asesor Legal** - Cumplimiento normativo
14. **DevOps** - Despliegue e infraestructura
15. **Soporte Técnico** - Atención a incidencias

### Ejecutar Agentes

```bash
# Desde el directorio del proyecto
node scripts/orquestador.js --agent researcher --task "Investigar nuevas estrategias TDAH"
```

## 📊 Roadmap

### Fase 1: Diseño y Arquitectura ✅
- [x] Análisis inicial de necesidades TDAH
- [x] Diseño de arquitectura técnica
- [x] Definición de 15 agentes OpenClaw
- [x] Wireframes y prototipos

### Fase 2: Desarrollo MVP (En progreso)
- [ ] Setup inicial del proyecto
- [ ] Autenticación básica
- [ ] CRUD de tareas
- [ ] Vista "Hoy" con Pomodoro
- [ ] Sistema de hábitos
- [ ] Personalización básica

### Fase 3: Mejoras y Integraciones
- [ ] Notificaciones push
- [ ] Integración WhatsApp
- [ ] PWA features completas
- [ ] Analytics y métricas

### Fase 4: Investigación Continua
- [ ] Sistema de actualización mensual automática
- [ ] Análisis de nuevas estrategias TDAH
- [ ] Mejoras basadas en investigación

## 🌐 Despliegue

### Frontend (Vercel)
```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
# Instalar CLI de Railway
npm i -g @railway/cli

# Desplegar
cd backend
railway up
```

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues:** [GitHub Issues](https://github.com/cuervoc-openclaw/TDAH-DASHBOARD/issues)
- **Documentación:** [docs/](docs/)
- **Comunidad:** [Discord OpenClaw](https://discord.com/invite/clawd)

## 🙏 Agradecimientos

- Comunidad TDAH de habla hispana por su feedback invaluable
- OpenClaw por el framework de agentes autónomos
- Todos los contribuidores y testers

---

**Desarrollado con ❤️ para la comunidad neurodivergente**

*"La neurodiversidad no es un bug, es una feature"*