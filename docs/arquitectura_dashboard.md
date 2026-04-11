# Arquitectura del Dashboard TDAH - NeuroAsistente

**Agentes:** Arquitecto de Software & Diseñador UX/UI Especializado en Neurodivergencia  
**Fecha:** 11 de abril de 2026  
**Base:** Análisis inicial TDAH (docs/analisis_inicial_tdah.md)

---

## 1. Visión General del Sistema

### 1.1 Propósito
Dashboard web progresivo (PWA) minimalista, altamente personalizable y diseñado específicamente para minimizar la sobrecarga cognitiva en adultos con TDAH.

### 1.2 Principios de Diseño
1. **Minimalismo cognitivo:** Interfaz limpia, sin elementos superfluos
2. **Personalización profunda:** Adaptable a necesidades individuales
3. **Feedback inmediato:** Confirmaciones visuales/auditivas de todas las acciones
4. **Consistencia predictiva:** Patrones de interacción predecibles
5. **Tolerancia a errores:** Recuperación fácil de acciones accidentales

### 1.3 Público Objetivo
- Adultos con diagnóstico de TDAH
- Personas en proceso de diagnóstico
- Familiares que buscan herramientas de apoyo
- Profesionales de la salud mental como herramienta complementaria

---

## 2. Arquitectura Técnica

### 2.1 Stack Tecnológico

#### Frontend
- **Framework:** React 18+ con TypeScript
- **Estilos:** Tailwind CSS + CSS Modules
- **Estado:** Zustand (gestión de estado simple)
- **Enrutamiento:** React Router v6
- **PWA:** Workbox para service workers
- **Accesibilidad:** React Aria Components
- **Iconos:** Lucide React

#### Backend
- **Runtime:** Node.js 20+ con Express
- **Base de Datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **ORM:** Prisma
- **Autenticación:** JWT + refresh tokens
- **Validación:** Zod
- **Logging:** Winston

#### Infraestructura
- **Hosting:** Vercel (frontend) + Railway/Render (backend)
- **CI/CD:** GitHub Actions
- **Monitoreo:** Sentry (errores) + Plausible (analíticas)
- **Notificaciones:** OneSignal (push) + Twilio (SMS/WhatsApp)

### 2.2 Estructura del Proyecto

```
/neuroasistente-tdah
├── /docs                    # Documentación
├── /frontend               # Aplicación React
│   ├── /public            # Assets estáticos
│   ├── /src
│   │   ├── /components    # Componentes reutilizables
│   │   ├── /pages         # Páginas de la aplicación
│   │   ├── /hooks         # Custom hooks
│   │   ├── /stores        # Estado global (Zustand)
│   │   ├── /services      # Servicios API
│   │   ├── /utils         # Utilidades
│   │   └── /styles        # Estilos globales
├── /backend               # API Node.js
│   ├── /src
│   │   ├── /controllers   # Controladores
│   │   ├── /models        # Modelos Prisma
│   │   ├── /routes        # Rutas API
│   │   ├── /middlewares   # Middlewares
│   │   ├── /services      # Lógica de negocio
│   │   └── /utils         # Utilidades
├── /agents                # Definiciones de agentes OpenClaw
├── /scripts              # Scripts de automatización
├── .env.example          # Variables de entorno
├── docker-compose.yml    # Orquestación Docker
└── README.md            # Documentación principal
```

### 2.3 Modelo de Datos

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Preferencias de usuario
  preferences   UserPreferences?
  tasks         Task[]
  habits        Habit[]
  reminders     Reminder[]
  achievements  Achievement[]
}

model UserPreferences {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Personalización visual
  theme       String   @default("light") // light, dark, high-contrast
  fontSize    Int      @default(16)
  reduceMotion Boolean @default(false)
  
  // Preferencias de notificación
  notificationTypes Json // { push: boolean, email: boolean, whatsapp: boolean }
  quietHours       Json // { start: "22:00", end: "08:00" }
  
  // Estrategias TDAH
  pomodoroDuration  Int    @default(25)
  breakDuration     Int    @default(5)
  chunkingEnabled   Boolean @default(true)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Task {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  title       String
  description String?
  priority    Int      @default(2) // 1: alta, 2: media, 3: baja
  status      String   @default("pending") // pending, in-progress, completed, cancelled
  
  // Desglose de tareas (chunking)
  isChunked   Boolean  @default(false)
  parentTaskId String?  // Para subtareas
  subtasks    Task[]   @relation("TaskSubtasks")
  
  // Fechas
  dueDate     DateTime?
  estimatedDuration Int? // en minutos
  timeSpent   Int      @default(0)
  
  // Categorización
  tags        String[]
  category    String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Habit {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  name        String
  description String?
  frequency   String   // daily, weekly, monthly
  streak      Int      @default(0)
  bestStreak  Int      @default(0)
  
  // Tracking
  tracking    HabitTracking[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Reminder {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  title       String
  message     String
  type        String   // task, habit, custom
  relatedId   String?  // ID de tarea/hábito relacionado
  
  // Programación
  schedule    Json     // { cron: "0 9 * * *", timezone: "America/Santiago" }
  nextTrigger DateTime
  
  // Canales
  channels    Json     // { push: boolean, email: boolean, whatsapp: boolean }
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 3. Sistema de Agentes OpenClaw (15 Agentes)

### 3.1 Estructura de Agentes

```
/agents
├── /souls                 # Definiciones de "almas"/personalidades
│   ├── coordinator.json
│   ├── researcher.json
│   ├── designer.json
│   └── ...
├── /definitions          # Definiciones completas de agentes
│   ├── coordinator.json
│   ├── researcher.json
│   ├── frontend-dev.json
│   └── ...
└── souls.json           # Mapeo de almas a agentes
```

### 3.2 Los 15 Agentes Especializados

#### 1. **Coordinador General** (`coordinator`)
- **Alma:** Líder estratégico, organizado, empático
- **Responsabilidades:** Supervisión general, asignación de tareas, coordinación entre agentes
- **Habilidades:** Toma de decisiones, priorización, resolución de conflictos

#### 2. **Investigador Científico** (`researcher`)
- **Alma:** Analítico, basado en evidencia, curioso
- **Responsabilidades:** Investigación continua sobre TDAH, análisis de nuevas estrategias
- **Habilidades:** Búsqueda de información, síntesis, evaluación crítica

#### 3. **Diseñador UX/UI** (`designer`)
- **Alma:** Creativo, empático, detallista
- **Responsabilidades:** Diseño de interfaces, experiencia de usuario, accesibilidad
- **Habilidades:** Diseño centrado en el usuario, principios de neurodiversidad

#### 4. **Desarrollador Frontend** (`frontend-dev`)
- **Alma:** Técnico, meticuloso, orientado a detalles
- **Responsabilidades:** Implementación de interfaz, componentes React, PWA
- **Habilidades:** React, TypeScript, Tailwind, accesibilidad web

#### 5. **Desarrollador Backend** (`backend-dev`)
- **Alma:** Lógico, estructurado, eficiente
- **Responsabilidades:** API, base de datos, lógica de servidor
- **Habilidades:** Node.js, Express, Prisma, autenticación

#### 6. **Especialista en Integraciones** (`integration-specialist`)
- **Alma:** Conectivo, pragmático, solucionador de problemas
- **Responsabilidades:** Integraciones con WhatsApp/Telegram, APIs externas
- **Habilidades:** APIs REST, webhooks, mensajería

#### 7. **Especialista en Recordatorios** (`reminder-specialist`)
- **Alma:** Atento, persistente, organizado
- **Responsabilidades:** Sistema de notificaciones, recordatorios inteligentes
- **Habilidades:** Programación de tareas, notificaciones push, cron jobs

#### 8. **Analista de Datos** (`data-analyst`)
- **Alma:** Analítico, intuitivo, orientado a patrones
- **Responsabilidades:** Análisis de uso, métricas, optimización
- **Habilidades:** Análisis de datos, visualización, SQL

#### 9. **Redactor de Contenidos** (`content-writer`)
- **Alma:** Comunicativo, empático, claro
- **Responsabilidades:** Contenido psicoeducativo, mensajes motivacionales
- **Habilidades:** Redacción, psicología educativa, tono apropiado

#### 10. **Tester de Calidad** (`quality-tester`)
- **Alma:** Metódico, crítico, exhaustivo
- **Responsabilidades:** Testing, control de calidad, reporte de bugs
- **Habilidades:** Testing manual/automático, debugging, UX testing

#### 11. **Experto en SEO/Accesibilidad** (`seo-accessibility`)
- **Alma:** Técnico, inclusivo, optimizador
- **Responsabilidades:** SEO, accesibilidad WCAG, performance
- **Habilidades:** SEO técnico, ARIA, performance web

#### 12. **Community Manager** (`community-manager`)
- **Alma:** Social, empático, comunicativo
- **Responsabilidades:** Comunidad de usuarios, feedback, soporte
- **Habilidades:** Comunicación, gestión de comunidades, soporte

#### 13. **Abogado/Asesor Legal** (`legal-advisor`)
- **Alma:** Precavido, ético, conocedor
- **Responsabilidades:** Cumplimiento legal, privacidad, términos
- **Habilidades:** GDPR, protección de datos, términos de servicio

#### 14. **DevOps** (`devops`)
- **Alma:** Automatizador, eficiente, escalable
- **Responsabilidades:** Despliegue, CI/CD, infraestructura
- **Habilidades:** Docker, GitHub Actions, hosting cloud

#### 15. **Soporte Técnico** (`support-technician`)
- **Alma:** Paciente, resolutivo, claro
- **Responsabilidades:** Soporte a usuarios, troubleshooting
- **Habilidades:** Soporte técnico, comunicación clara, resolución de problemas

### 3.3 Orquestación de Agentes

```javascript
// scripts/orquestador.js
const { spawnAgent } = require('@openclaw/sdk');

class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
  }
  
  async spawnAgent(agentType, task, context) {
    const agentConfig = await this.loadAgentConfig(agentType);
    return await spawnAgent({
      agentId: agentType,
      task: task,
      context: context,
      workspace: '/neuroasistente-tdah'
    });
  }
  
  async coordinateDevelopment() {
    // Flujo de desarrollo típico
    const research = await this.spawnAgent('researcher', 
      'Investigar últimas estrategias para gestión del tiempo en TDAH');
    
    const design = await this.spawnAgent('designer',
      'Diseñar interfaz basada en investigación', {
        researchFindings: research.results
      });
    
    const frontend = await this.spawnAgent('frontend-dev',
      'Implementar diseño en React', {
        designSpecs: design.specifications
      });
    
    // ... más agentes según necesidad
  }
}
```

---

## 4. Funcionalidades Clave del Dashboard

### 4.1 Vista "Hoy" (Pantalla Principal)
- **Tareas prioritarias del día** (máximo 5)
- **Temporizador Pomodoro integrado**
- **Hábitos a completar hoy**
- **Recordatorios próximos**
- **Logro del día** (motivacional)

### 4.2 Sistema de Tareas
- **Creación rápida** (menos de 3 clics)
- **Desglose automático** (sugiere dividir tareas grandes)
- **Priorización visual** (colores, íconos)
- **Estimación de tiempo** (con ajustes basados en historial)
- **Seguimiento de progreso**

### 4.3 Registro de Hábitos
- **Hábitos diarios/semanales**
- **Streaks visuales** (cadena de días)
- **Recordatorios contextuales**
- **Estadísticas simples**
- **Refuerzo positivo**

### 4.4 Sección de Logros
- **Logros completados** (visual tipo "medallas")
- **Progreso hacia metas**
- **Mensajes motivacionales personalizados**
- **Compartir logros** (opcional)

### 4.5 Integración con Mensajería
- **WhatsApp Business API** para recordatorios
- **Bot de Telegram** para interacción rápida
- **Notificaciones push** en dispositivo
- **Correos de resumen diario/semanal**

### 4.6 Personalización Avanzada
- **Temas:** Claro, oscuro, alto contraste
- **Tipografía:** Tamaños ajustables, fuentes legibles
- **Reducción de movimiento** (para sensibilidad visual)
- **Recordatorios personalizados** (canales, frecuencia)
- **Estrategias TDAH** (Pomodoro, chunking, etc.)

---

## 5. Wireframes y Prototipo de Baja Fidelidad

### 5.1 Layout Principal

```
┌─────────────────────────────────────────────────────┐
│ 🏠 NeuroAsistente TDAH        ⚙️ 👤              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🎯 HOY                                             │
│  ┌────────────────────────────────────────────┐     │
│  │ ⏱️ Pomodoro: 25:00 [▶] [⏸️] [⏹️]          │     │
│  │                                            │     │
│  │ 📋 TAREAS PRIORITARIAS                     │     │
│  │ • ✅ Revisar correos (10 min)              │     │
│  │ • 🔄 Preparar presentación (45 min)        │     │
│  │ • 💊 Tomar medicación                      │     │
│  │                                            │     │
│  │ 🏃 HÁBITOS DE HOY                          │     │
│  │ ☑️ Meditación 10 min      🔄 Ejercicio     │     │
│  │ ☑️ Agua 2L               🔄 Sueño 8h       │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  🎖️ LOGRO DEL DÍA                                  │
│  "¡Llevas 3 días seguidos completando tus tareas!"  │
│                                                      │
│  🔔 PRÓXIMOS RECORDATORIOS                          │
│  • 10:00 - Reunión equipo                           │
│  • 14:00 - Llamar al médico                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 5.2 Vista de Tareas

```
┌─────────────────────────────────────────────────────┐
│ ← Atrás   TAREAS   ＋ Nueva tarea                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🔍 Buscar tareas...                                │
│                                                      │
│  📅 HOY (3)                                         │
│  ┌────────────────────────────────────────────┐     │
│  │ • ✅ Revisar correos (10 min) [alta]       │     │
│  │ • 🔄 Preparar presentación (45 min) [alta] │     │
│  │ • 📝 Comprar supermercado [media]          │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  📅 MAÑANA (2)                                       │
│  ┌────────────────────────────────────────────┐     │
│  │ • 💼 Reunión con jefe [alta]               │     │
│  │ • 🏋️‍♂️ Gimnasio [baja]                     │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  📅 PRÓXIMA SEMANA (4)                              │
│  ┌────────────────────────────────────────────┐     │
│  │ • 📊 Reporte mensual                       │     │
│  │ • 🎂 Cumpleaños mamá                       │     │
│  │ • 🩺 Cita médico                           │     │
│  │ • 💰 Pagar cuentas                         │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  🏷️ FILTROS: Todas ｜ Pendientes ｜ Completadas     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 5.3 Vista de Hábitos

```
┌─────────────────────────────────────────────────────┐
│ ← Atrás   HÁBITOS   ＋ Nuevo hábito                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🔥 RACHA ACTUAL: 7 días                            │
│                                                      │
│  🏃 HÁBITOS DIARIOS                                 │
│  ┌────────────────────────────────────────────┐     │
│  │ 💊 Medicación      ✅ ✅ ✅ ✅ ✅ ✅ ✅    │     │
│  │ 💧 Agua 2L         ✅ ✅ 🔄 ✅ ✅ ✅ ✅    │     │
│  │ 🧘 Meditación      ✅ ✅ ✅ ✅ 🔄 ✅ ✅    │     │
│  │ 🏋️‍♂️ Ejercicio      ✅ 🔄 ✅ ✅ ✅ ✅ ✅    │     │
│  │ 📚 Lectura         ✅ ✅ ✅ ✅ ✅ 🔄 ✅    │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  📅 HÁBITOS SEMANALES                               │
│  ┌────────────────────────────────────────────┐     │
│  │ 🧹 Limpieza casa      [ ]                  │     │
│  │ 📞 Llamar familia     [ ]                  │     │
│  │ 🛒 Compras            [ ]                  │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  📊 ESTADÍSTICAS                                    │
│  • Mejor racha: 21 días (Meditación)                │
│  • Hábito más consistente: Medicación (100%)        │
│  • Necesita mejora: Ejercicio (85%)                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 5.4 Modal de Nueva Tarea

```
┌─────────────────────────────────────────────────────┐
│                ✏️ NUEVA TAREA                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Título: ________________________________          │
│                                                      │
│  Descripción (opcional):                            │
│  ┌────────────────────────────────────────────┐     │
│  │                                            │     │
│  │                                            │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ⏰ Fecha límite: Hoy ｜ Mañana ｜ Elegir fecha     │
│                                                      │
│  🎯 Prioridad: 🔴 Alta ｜ 🟡 Media ｜ 🟢 Baja       │
│                                                      │
│  ⚡ ¿Es una tarea grande? [ ] Dividir en pasos       │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │     [ Cancelar ]       [ Guardar ]         │     │
│  └────────────────────────────────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 5.5 Configuración/Personalización

```
┌─────────────────────────────────────────────────────┐
│ ← Atrás   CONFIGURACIÓN                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🎨 APARIENCIA                                       │
│  • Tema: ○ Claro ● Oscuro ○ Alto contraste          │
│  • Tamaño texto: 🔽 16px 🔼                         │
│  • Reducir animaciones: [✓]                         │
│                                                      │
│  ⏰ POMODORO                                         │
│  • Tiempo trabajo: 25 min 🔽🔼                      │
│  • Tiempo descanso: 5 min 🔽🔼                      │
│  • Sonido al terminar: [✓]                          │
│                                                      │
│  🔔 NOTIFICACIONES                                  │
│  • Recordatorios push: [✓]                          │
│  • Correos diarios: [ ]                             │
│  • WhatsApp: [ ] (Configurar)                       │
│  • Horario silencioso: 22:00 - 08:00                │
│                                                      │
│  🧠 ESTRATEGIAS TDAH                                │
│  • Desglose automático: [✓]                         │
│  • Recordatorios redundantes: [✓]                   │
│  • Feedback positivo: [✓]                           │
│                                                      │
│  🔒 PRIVACIDAD & SEGURIDAD                          │
│  • Cuenta: david@ejemplo.com                        │
│  • Exportar datos                                   │
│  • Eliminar cuenta                                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 6. Plan de Implementación - Fase 2 (MVP)

### 6.1 Sprint 1: Configuración Inicial (Semana 1)
1. **Setup del proyecto** (frontend + backend)
2. **Autenticación básica** (registro/login)
3. **Modelos de datos** iniciales
4. **Layout principal** con navegación

### 6.2 Sprint 2: Funcionalidades Core (Semana 2)
1. **CRUD de tareas** (crear, leer, actualizar, eliminar)
2. **Vista "Hoy"** con tareas prioritarias
3. **Temporizador Pomodoro** básico
4. **Sistema de recordatorios** simples

### 6.3 Sprint 3: Mejoras UX (Semana 3)
1. **Personalización** (tema, tamaños)
2. **Hábitos básicos** (seguimiento diario)
3. **Logros/motivación** (sistema simple)
4. **Responsive design** móvil/tablet

### 6.4 Sprint 4: Integraciones (Semana 4)
1. **Notificaciones push** (OneSignal)
2. **PWA features** (offline, install)
3. **API de WhatsApp** (recordatorios)
4. **Testing y bug fixing**

### 6.5 Sprint 5: Lanzamiento MVP (Semana 5)
1. **Deploy a producción** (Vercel + Railway)
2. **Documentación de usuario**
3. **Sistema de feedback**
4. **Análisis básico** (Plausible)

---

## 7. Consideraciones de Accesibilidad

### 7.1 Nivel WCAG 2.1 AA
- **Contraste:** Mínimo 4.5:1 para texto normal
- **Navegación por teclado:** Completa
- **Screen readers:** Compatible con NVDA/JAWS
- **Focus visible:** Claramente indicado

### 7.2 Especificaciones para Neurodiversidad
- **Sin parpadeos:** Evitar animaciones que puedan provocar seizures
- **Reducción de movimiento:** Opción para usuarios sensibles
- **Jerarquía visual clara:** Importancia visual = importancia semántica
- **Consistencia:** Patrones de interacción predecibles

### 7.3 Consideraciones Cognitivas
- **Instrucciones paso a paso:** Para tareas complejas
- **Confirmación de acciones:** Evitar borrados accidentales
- **Lenguaje claro:** Evitar jerga técnica
- **Ayuda contextual:** Disponible cuando se necesita

---

## 8. Métricas de Éxito

### 8.1 Métricas de Usuario
- **Retención diaria:** > 60% después de 30 días
- **Tareas completadas:** > 70% de las creadas
- **Hábitos mantenidos:** > 21 días de racha
- **Satisfacción (NPS):** > 50

### 8.2 Métricas Técnicas
- **Tiempo de carga:** < 3 segundos
- **Puntuación Lighthouse:** > 90
- **Tiempo activo:** > 15 minutos/día
- **Errores reportados:** < 1% de sesiones

### 8.3 Métricas de Impacto
- **Reducción estrés:** Reportada por usuarios
- **Mejora productividad:** Autoreportada
- **Adherencia tratamiento:** Mejora en seguimiento
- **Calidad de vida:** Mejora percibida

---

## 9. Próximos Pasos

1. **Crear repositorio GitHub** con estructura inicial
2. **Implementar definiciones de agentes** en `/agents/`
3. **Desarrollar script de orquestación** (`scripts/orquestador.js`)
4. **Comenzar Fase 2** (desarrollo MVP)
5. **Configurar CI/CD** (GitHub Actions)
6. **Preparar despliegue** (Vercel + Railway)

---

*Documento generado por los Agentes Arquitecto de Software y Diseñador UX/UI Especializado en Neurodivergencia*

**Estado:** Fase 1 completada ✅
**Siguiente:** Fase 2 - Desarrollo del MVP