Contexto y Misión Principal:

Actúa como un equipo multidisciplinar de 15 agentes autónomos de IA (utilizando diferentes "almas" o personalidades) para investigar, diseñar, desarrollar, desplegar y mantener un Dashboard Personalizado de Apoyo para el TDAH. El usuario (yo) tiene TDAH y necesita un sistema que le ayude a gestionar sus tareas diarias, recordatorios y seguimiento de hábitos, basado en un análisis profundo y continuo de las necesidades de la comunidad TDAH en internet.

Tu objetivo final es entregar un producto completamente funcional, alojado en GitHub, que se actualice automáticamente de forma mensual con nueva información relevante sobre TDAH. No debes hacer preguntas al usuario durante el proceso. Solo presentarás versiones completas y funcionales (MVP, versión 1.1, etc.) para su revisión y aprobación final. Tienes la capacidad de acceder a internet, ejecutar comandos, leer y escribir archivos, y utilizar la API de DeepSeek para razonamiento complejo.

Fase 0: Configuración Inicial y Análisis del Entorno TDAH (Investigación Autónoma)
Agente Asignado: "Investigador Científico" (Soul: Analítico, Basado en Evidencia).

Tarea: Realizar un análisis exhaustivo del estado del arte sobre TDAH en adultos, centrándote en las dificultades diarias, estrategias de afrontamiento y herramientas tecnológicas recomendadas.

Acciones Específicas:

Utiliza tu capacidad de búsqueda en internet para acceder a foros de habla hispana (como "TDAH España", "Reddit r/TDAH"), artículos de psicología, blogs especializados y guías clínicas.
Identifica las 10 necesidades principales de una persona con TDAH en su vida diaria (ej: gestión del tiempo, inicio de tareas, memoria de trabajo, regulación emocional).
Identifica las 5 estrategias de apoyo digital más recomendadas (ej: recordatorios visuales, desglose de tareas, temporizadores, refuerzo positivo).
Recopila una lista de 5 aplicaciones o herramientas existentes para TDAH y analiza sus puntos fuertes y débiles según las opiniones de usuarios reales.
Formato de Entrega: Un documento Markdown (docs/analisis_inicial_tdah.md) con los hallazgos estructurados en las secciones anteriores. Este documento será la base del diseño del dashboard.

Fase 1: Diseño del Dashboard y su Integración con Agentes
Agentes Asignados: "Arquitecto de Software" y "Diseñador UX/UI Especializado en Neurodivergencia".

Tarea: Basándote en el análisis de la Fase 0, diseña la arquitectura y la interfaz de usuario de un dashboard web progresivo (PWA) que sea minimalista, altamente personalizable y que minimice la sobrecarga cognitiva.

Arquitectura Propuesta:

Frontend: React o Vue.js con una interfaz basada en componentes simples y personalizables (modo claro/oscuro, tamaño de fuente ajustable).

Backend: Node.js + Express (o Python + FastAPI) para la lógica de servidor y la conexión con APIs.

Base de Datos: SQLite (para simplicidad) o MongoDB (si se prevé escalar).

Sistema de Agentes OpenClaw: Utilizarás la funcionalidad de agentes múltiples de OpenClaw. Definirás 15 agentes especializados, cada uno con un "alma" distinta, que se encargarán de diferentes aspectos del proyecto. Aquí tienes una propuesta inicial:

Coordinador General: Supervisa y asigna tareas a los demás agentes.
Investigador Científico: Análisis continuo de TDAH.
Diseñador UX/UI: Crea interfaces amigables.
Desarrollador Frontend: Implementa la interfaz.
Desarrollador Backend: Implementa la lógica del servidor.
Especialista en Integraciones: Conecta con WhatsApp/Telegram.
Especialista en Recordatorios: Gestiona el sistema de notificaciones.
Analista de Datos: Procesa la información de uso para mejorar.
Redactor de Contenidos: Crea mensajes motivacionales y psicoeducativos.
Tester de Calidad: Asegura que el software funciona sin errores.
Experto en SEO/Accesibilidad: Optimiza para buscadores y personas con discapacidad.
Community Manager: Gestiona la posible comunidad de usuarios.
Abogado/Asesor Legal: Verifica el cumplimiento de normativas de privacidad.
DevOps: Gestiona el despliegue en GitHub Pages/Vercel.
Soporte Técnico: Atiende posibles incidencias del usuario.
Funcionalidades Clave del Dashboard:

Vista de "Hoy": Muestra solo las tareas prioritarias del día, con un temporizador Pomodoro integrado.
Registro de Hábitos: Seguimiento simple de hábitos diarios (sueño, medicación, ejercicio).
Sección de "Logros": Refuerzo positivo visual.
Integración con Mensajería: El dashboard debe poder enviar recordatorios a través de un grupo de WhatsApp o un bot de Telegram. Para ello, deberás investigar e implementar la mejor solución (por ejemplo, usando la API de WhatsApp Business, o creando un bot de Telegram con python-telegram-bot).
Formato de Entrega: Un Documento de Arquitectura de Software (docs/arquitectura_dashboard.md) y un prototipo de baja fidelidad (wireframes) en formato Markdown o imagen.

Fase 2: Desarrollo del MVP (Producto Mínimo Viable)
Agentes Asignados: "Desarrollador Frontend", "Desarrollador Backend", "Especialista en Integraciones".

Tarea: Construir una primera versión funcional del dashboard que incluya las características esenciales definidas en la Fase 1. El código debe ser limpio, bien comentado y seguir las mejores prácticas.

Estructura del Proyecto en GitHub:

Inicializa un repositorio local y conéctalo a un repositorio remoto en GitHub (usando tus credenciales ya configuradas).

Crea una estructura de carpetas clara:

text
/neuroasistente-tdah
├── /docs                # Documentación del proyecto
├── /frontend            # Código del frontend (React/Vue)
├── /backend             # Código del backend (Node/Python)
├── /agents              # Definiciones de los 15 agentes OpenClaw
├── /scripts             # Scripts de automatización
├── .env.example         # Variables de entorno de ejemplo
├── README.md            # Descripción del proyecto
└── package.json         # Dependencias
Integración con OpenClaw:

Crea un archivo agents/souls.json que defina el "alma" y las instrucciones específicas para cada uno de los 15 agentes. Utiliza el formato que OpenClaw espera para la definición de agentes.

Crea un script (scripts/orquestador.js) que utilice la API de OpenClaw para invocar a los agentes según sea necesario durante el desarrollo.

Formato de Entrega: El código fuente completo del MVP, subido al repositorio de GitHub. Un archivo README.md con instrucciones claras para instalar y ejecutar el proyecto localmente.

Fase 3: Sistema de Investigación Continua y Actualización Mensual
Agentes Asignados: "Investigador Científico", "Analista de Datos", "DevOps".

Tarea: Implementar un mecanismo automatizado que, una vez al mes, realice las siguientes acciones:

Búsqueda de Novedades: Utiliza tu capacidad de navegación web para buscar nuevos estudios, artículos o debates relevantes sobre TDAH publicados en el último mes. Utiliza palabras clave como "TDAH adultos 2024 2025", "nuevas estrategias TDAH", "tecnología y TDAH".
Análisis y Síntesis: Procesa la información recopilada y genera un resumen de las 3-5 novedades más importantes.
Actualización del Dashboard: Basándote en este análisis, propón e implementa una pequeña mejora o nueva funcionalidad en el dashboard. Por ejemplo: un nuevo tipo de recordatorio, un nuevo consejo en la sección de logros, o un ajuste en la interfaz basado en nuevas investigaciones sobre accesibilidad cognitiva.
Actualización del Repositorio: Realiza un commit y un push de los cambios al repositorio de GitHub, con un mensaje de commit descriptivo (ej: feat: Actualización mensual - Nuevo recordatorio basado en estudio X).
Implementación Técnica:

Utiliza GitHub Actions para programar la ejecución de un script (scripts/actualizacion_mensual.js) el primer día de cada mes.

Este script invocará a los agentes de OpenClaw correspondientes para realizar la investigación y la actualización.

Formato de Entrega: El archivo de workflow de GitHub Actions (.github/workflows/actualizacion-mensual.yml) y el script de actualización.

Fase 4: Despliegue Automático y Presentación de Versiones Completas
Agente Asignado: "DevOps".

Tarea: Configurar el despliegue automático del dashboard en un servicio de hosting gratuito (como Vercel, Netlify o GitHub Pages) cada vez que se realice un push a la rama principal (main o master).

Formato de Entrega: La URL pública del dashboard desplegado. Cuando el despliegue esté completo y verificado, presentarás al usuario un informe final con:

Enlace al repositorio de GitHub.

Enlace al dashboard en vivo.

Un resumen de las funcionalidades implementadas.

Instrucciones para que el usuario pueda configurar su propio grupo de WhatsApp/Telegram y conectar el dashboard.

Instrucciones Finales para OpenClaw:

Autonomía Total: Trabaja de manera independiente, resolviendo cualquier problema técnico que surja utilizando tus capacidades de búsqueda y razonamiento.

Comunicación Mínima: Solo te comunicarás con el usuario para presentar los hitos completos (Fin de Fase 1, Fase 2, etc.) y para pedir su aprobación antes de continuar. No harás preguntas intermedias.

Prioridad en la Accesibilidad: Cada decisión de diseño y desarrollo debe estar justificada por el análisis inicial del TDAH.

Uso de DeepSeek: Para tareas que requieran razonamiento complejo (análisis de textos científicos, generación de contenido psicoeducativo), utiliza el modelo deepseek-chat a través de su API.

Comienza de inmediato con la Fase 0. Esperaré tu primer informe completo con el análisis inicial del TDAH.
