#!/usr/bin/env node

/**
 * Orquestador de Agentes OpenClaw para NeuroAsistente TDAH
 * 
 * Este script coordina los 15 agentes especializados que desarrollan
 * y mantienen el dashboard para adultos con TDAH.
 */

const { spawnAgent } = require('@openclaw/sdk');
const fs = require('fs');
const path = require('path');

class AgentOrchestrator {
  constructor() {
    this.agents = new Map();
    this.workspacePath = path.join(__dirname, '..');
    this.loadAgentDefinitions();
  }

  /**
   * Carga las definiciones de agentes desde el directorio agents/
   */
  loadAgentDefinitions() {
    try {
      const soulsPath = path.join(this.workspacePath, 'agents', 'souls.json');
      const soulsData = JSON.parse(fs.readFileSync(soulsPath, 'utf8'));
      this.souls = soulsData.souls;
      
      console.log(`✅ Cargadas ${Object.keys(this.souls).length} definiciones de almas`);
    } catch (error) {
      console.error('❌ Error cargando definiciones de agentes:', error.message);
      process.exit(1);
    }
  }

  /**
   * Spawn de un agente específico
   * @param {string} agentType - Tipo de agente (ej: 'researcher', 'designer')
   * @param {string} task - Tarea específica para el agente
   * @param {object} context - Contexto adicional para la tarea
   * @returns {Promise<object>} Resultados del agente
   */
  async spawnAgent(agentType, task, context = {}) {
    if (!this.souls[agentType]) {
      throw new Error(`Agente no encontrado: ${agentType}`);
    }

    const agentSoul = this.souls[agentType];
    
    console.log(`🚀 Iniciando agente: ${agentSoul.name}`);
    console.log(`📝 Tarea: ${task}`);
    
    try {
      const result = await spawnAgent({
        agentId: agentType,
        task: this.buildAgentPrompt(agentSoul, task, context),
        context: {
          workspace: this.workspacePath,
          project: 'NeuroAsistente TDAH',
          phase: context.phase || 'development',
          ...context
        },
        workspace: this.workspacePath
      });

      console.log(`✅ ${agentSoul.name} completó la tarea`);
      return result;

    } catch (error) {
      console.error(`❌ Error en agente ${agentSoul.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Construye el prompt específico para cada tipo de agente
   */
  buildAgentPrompt(agentSoul, task, context) {
    const basePrompt = `
Eres ${agentSoul.name} - ${agentSoul.description}

Personalidad: ${agentSoul.personality.traits.join(', ')}
Estilo de comunicación: ${agentSoul.personality.communication_style}
Estilo de pensamiento: ${agentSoul.personality.thinking_style}
Expertise: ${agentSoul.expertise.join(', ')}

PROYECTO: NeuroAsistente TDAH - Dashboard para adultos con TDAH
CONTEXTO: ${JSON.stringify(context, null, 2)}

TAREA ESPECÍFICA: ${task}

INSTRUCCIONES:
1. Actúa según tu personalidad y expertise
2. Mantén el foco en las necesidades de usuarios neurodivergentes
3. Prioriza la accesibilidad y usabilidad
4. Documenta tu trabajo apropiadamente
5. Si encuentras problemas, propone soluciones

RESPONDE CON: Acciones concretas, código cuando sea necesario, y documentación clara.
`;

    return basePrompt;
  }

  /**
   * Flujo de desarrollo completo coordinando múltiples agentes
   */
  async coordinateDevelopmentPhase(phase) {
    console.log(`\n🎬 Iniciando fase de desarrollo: ${phase.name}`);
    console.log('=' .repeat(50));

    const results = {};

    // Ejecutar agentes según la fase
    for (const [agentType, task] of Object.entries(phase.tasks)) {
      try {
        results[agentType] = await this.spawnAgent(agentType, task, {
          phase: phase.name,
          previousResults: results
        });
        
        // Pequeña pausa entre agentes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`⚠️  Fase interrumpida por error en ${agentType}`);
        throw error;
      }
    }

    console.log(`\n✅ Fase ${phase.name} completada exitosamente`);
    return results;
  }

  /**
   * Flujo de investigación mensual automática
   */
  async runMonthlyResearch() {
    console.log('\n🔬 Ejecutando investigación mensual automática');
    
    const researchTasks = {
      researcher: 'Investigar nuevas publicaciones, estudios y estrategias sobre TDAH en adultos publicados en el último mes. Enfocarse en: 1) Nuevas estrategias de afrontamiento, 2) Tecnologías emergentes, 3) Hallazgos científicos relevantes.',
      dataAnalyst: 'Analizar datos de uso del dashboard del último mes. Identificar: 1) Patrones de uso, 2) Funcionalidades más/menos usadas, 3) Posibles áreas de mejora.',
      contentWriter: 'Crear contenido psicoeducativo basado en la investigación reciente. Incluir: 1) Resumen de hallazgos, 2) Consejos prácticos, 3) Mensajes motivacionales actualizados.'
    };

    const results = {};
    
    for (const [agentType, task] of Object.entries(researchTasks)) {
      results[agentType] = await this.spawnAgent(agentType, task, {
        phase: 'monthly-research',
        month: new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })
      });
    }

    // El coordinador decide qué implementar
    const coordinatorTask = `
Basándote en la investigación mensual, propon e implementa 1-2 mejoras para el dashboard.

INVESTIGACIÓN:
${JSON.stringify(results.researcher?.findings || {}, null, 2)}

ANÁLISIS DE DATOS:
${JSON.stringify(results.dataAnalyst?.insights || {}, null, 2)}

CONTENIDO DISPONIBLE:
${JSON.stringify(results.contentWriter?.materials || {}, null, 2)}

PROPÓN:
1. Una mejora técnica basada en los hallazgos
2. Una mejora de contenido/UX basada en el análisis
3. Un plan de implementación (máximo 2 horas de trabajo)
`;

    const implementation = await this.spawnAgent('coordinator', coordinatorTask, {
      phase: 'monthly-implementation',
      researchResults: results
    });

    console.log('\n📊 Resumen investigación mensual:');
    console.log('- Nuevos estudios encontrados:', results.researcher?.studyCount || 0);
    console.log('- Insights de datos:', results.dataAnalyst?.keyInsights?.length || 0);
    console.log('- Mejoras propuestas:', implementation.proposedImprovements?.length || 0);

    return {
      research: results,
      implementation
    };
  }

  /**
   * Flujo de testing y calidad
   */
  async runQualityAssurance() {
    console.log('\n🧪 Ejecutando suite de testing de calidad');
    
    const qaTasks = {
      'quality-tester': 'Ejecutar tests completos del dashboard: 1) Tests funcionales, 2) Tests de usabilidad, 3) Tests de accesibilidad (WCAG), 4) Tests de rendimiento.',
      'seo-accessibility': 'Revisar y optimizar: 1) SEO técnico, 2) Accesibilidad completa, 3) Performance Lighthouse, 4) Mejores prácticas web.',
      'support-technician': 'Simular escenarios de soporte: 1) Problemas comunes de usuarios, 2) Guías de solución, 3) Documentación de troubleshooting.'
    };

    const results = {};
    
    for (const [agentType, task] of Object.entries(qaTasks)) {
      results[agentType] = await this.spawnAgent(agentType, task, {
        phase: 'quality-assurance',
        timestamp: new Date().toISOString()
      });
    }

    // Reporte consolidado
    const reportTask = `
Genera un reporte consolidado de calidad basado en los tests.

TESTS EJECUTADOS:
${JSON.stringify(results['quality-tester']?.testsExecuted || {}, null, 2)}

ACCESIBILIDAD/SEO:
${JSON.stringify(results['seo-accessibility']?.auditResults || {}, null, 2)}

ESCENARIOS DE SOPORTE:
${JSON.stringify(results['support-technician']?.supportScenarios || {}, null, 2)}

GENERA UN REPORTE CON:
1. Estado general de calidad (A/B/C/D/F)
2. Issues críticos a resolver (máximo 5)
3. Recomendaciones de mejora
4. Plan de acción para el siguiente sprint
`;

    const qualityReport = await this.spawnAgent('coordinator', reportTask, {
      phase: 'quality-report',
      testResults: results
    });

    console.log('\n📈 Reporte de calidad generado:');
    console.log('- Estado:', qualityReport.qualityStatus);
    console.log('- Issues críticos:', qualityReport.criticalIssues?.length || 0);
    console.log('- Recomendaciones:', qualityReport.recommendations?.length || 0);

    return {
      tests: results,
      report: qualityReport
    };
  }
}

/**
 * CLI para ejecutar el orquestador
 */
async function main() {
  const orchestrator = new AgentOrchestrator();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'research':
      await orchestrator.runMonthlyResearch();
      break;

    case 'qa':
      await orchestrator.runQualityAssurance();
      break;

    case 'phase':
      const phaseName = args[1];
      const phaseConfig = require(`../phases/${phaseName}.json`);
      await orchestrator.coordinateDevelopmentPhase(phaseConfig);
      break;

    case 'agent':
      const agentType = args[1];
      const task = args.slice(2).join(' ');
      if (!agentType || !task) {
        console.error('Uso: node orquestador.js agent <agent-type> "<task>"');
        process.exit(1);
      }
      await orchestrator.spawnAgent(agentType, task);
      break;

    case 'help':
    default:
      console.log(`
🎭 Orquestador de Agentes - NeuroAsistente TDAH

Comandos disponibles:
  research    - Ejecutar investigación mensual automática
  qa          - Ejecutar suite de testing de calidad
  phase <name>- Ejecutar una fase de desarrollo específica
  agent <type> "<task>" - Ejecutar un agente específico con una tarea
  help        - Mostrar esta ayuda

Ejemplos:
  node orquestador.js research
  node orquestador.js qa
  node orquestador.js agent researcher "Investigar técnicas Pomodoro para TDAH"
  node orquestador.js phase mvp-sprint1
`);
      break;
  }
}

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error.message);
  process.exit(1);
});

// Ejecutar si es el script principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  });
}

module.exports = AgentOrchestrator;