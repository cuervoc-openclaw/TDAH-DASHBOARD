#!/usr/bin/env node

/**
 * Sistema de reportes por WhatsApp para NeuroAsistente TDAH
 * Envía notificaciones automáticas del estado del proyecto
 */

const fs = require('fs');
const path = require('path');

class WhatsAppReporter {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.reportFile = path.join(this.projectRoot, 'reports', 'latest-report.json');
    this.ensureReportsDir();
  }

  ensureReportsDir() {
    const reportsDir = path.join(this.projectRoot, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
  }

  generateDeployReport(deployUrl, status, commitHash, commitMessage) {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'NeuroAsistente TDAH',
      status: status,
      deployUrl: deployUrl,
      commit: {
        hash: commitHash || 'N/A',
        message: commitMessage || 'N/A'
      },
      features: [
        'Pomodoro Timer',
        'Gestión de Tareas',
        'Seguimiento de Hábitos',
        'PWA Instalable',
        'Diseño Responsive'
      ],
      nextSteps: [
        'Probar interfaz en móvil',
        'Configurar recordatorios',
        'Personalizar temas',
        'Agregar más hábitos'
      ]
    };

    // Guardar reporte
    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    
    return report;
  }

  generateWhatsAppMessage(report) {
    const emoji = report.status === 'success' ? '✅' : '⚠️';
    const date = new Date(report.timestamp).toLocaleDateString('es-ES');
    const time = new Date(report.timestamp).toLocaleTimeString('es-ES');
    
    return `
${emoji} *REPORTE NEUROASISTENTE TDAH*
────────────────────
📅 ${date} - ${time}

📊 *Estado:* ${report.status === 'success' ? 'ÉXITO' : 'REVISAR'}

🔗 *URL:* ${report.deployUrl}

📝 *Último cambio:*
${report.commit.message}

🎯 *Funcionalidades listas:*
${report.features.map(f => `• ${f}`).join('\n')}

🚀 *Próximos pasos:*
${report.nextSteps.map(s => `• ${s}`).join('\n')}

💡 *Nota:* Este es un reporte automático.
El proyecto se actualiza con cada push a GitHub.
────────────────────
    `.trim();
  }

  generateErrorReport(error, context) {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'NeuroAsistente TDAH',
      status: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        context: context
      },
      troubleshooting: [
        'Revisar logs en GitHub Actions',
        'Verificar dependencias',
        'Probar build localmente',
        'Contactar soporte si persiste'
      ]
    };

    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    
    return `
⚠️ *ERROR EN DEPLOY*
────────────────────
📅 ${new Date().toLocaleDateString('es-ES')}

❌ *Problema:* ${error.message}

🔧 *Contexto:* ${context}

🛠️ *Solución sugerida:*
${report.troubleshooting.map(t => `• ${t}`).join('\n')}

📋 *Logs:* Revisar GitHub Actions
────────────────────
    `.trim();
  }

  generateDailyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'NeuroAsistente TDAH',
      type: 'daily',
      stats: {
        daysActive: 1,
        totalCommits: this.getCommitCount(),
        lastDeploy: this.getLastDeployTime(),
        featuresCompleted: 5,
        featuresPending: 3
      },
      message: '¡NeuroAsistente TDAH sigue activo y mejorando!'
    };

    return `
📊 *REPORTE DIARIO*
────────────────────
🎯 NeuroAsistente TDAH

📈 *Estadísticas:*
• Días activos: ${report.stats.daysActive}
• Commits totales: ${report.stats.totalCommits}
• Último deploy: ${report.stats.lastDeploy}
• Funcionalidades: ${report.stats.featuresCompleted}/8

💡 ${report.message}

🚀 *Recordatorio:* Puedes probar la app en:
https://cuervoc-openclaw.github.io/TDAH-DASHBOARD/
────────────────────
    `.trim();
  }

  getCommitCount() {
    try {
      const gitDir = path.join(this.projectRoot, '.git');
      if (fs.existsSync(gitDir)) {
        const result = require('child_process').execSync('git rev-list --count HEAD', { cwd: this.projectRoot });
        return parseInt(result.toString().trim());
      }
    } catch (error) {
      // Silently fail
    }
    return 0;
  }

  getLastDeployTime() {
    try {
      if (fs.existsSync(this.reportFile)) {
        const lastReport = JSON.parse(fs.readFileSync(this.reportFile, 'utf8'));
        return new Date(lastReport.timestamp).toLocaleDateString('es-ES');
      }
    } catch (error) {
      // Silently fail
    }
    return 'Nunca';
  }

  // Método para integrar con OpenClaw WhatsApp
  sendToOpenClaw(message) {
    console.log('📱 Mensaje para WhatsApp:');
    console.log(message);
    console.log('\n💡 Para enviar automáticamente, configurar:');
    console.log('1. WhatsApp gateway en OpenClaw');
    console.log('2. Webhook en GitHub Actions');
    console.log('3. Integración continua');
    
    // En un entorno real, esto se conectaría a la API de OpenClaw
    return { success: true, message: 'Reporte generado para WhatsApp' };
  }
}

// Uso del reporter
if (require.main === module) {
  const reporter = new WhatsAppReporter();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'deploy-success':
      const url = args[1] || 'https://cuervoc-openclaw.github.io/TDAH-DASHBOARD/';
      const commitHash = args[2] || 'N/A';
      const commitMessage = args[3] || 'Actualización automática';
      
      const report = reporter.generateDeployReport(url, 'success', commitHash, commitMessage);
      const message = reporter.generateWhatsAppMessage(report);
      reporter.sendToOpenClaw(message);
      break;
      
    case 'deploy-error':
      const error = new Error(args[1] || 'Error desconocido');
      const context = args[2] || 'Deploy automático';
      const errorMessage = reporter.generateErrorReport(error, context);
      reporter.sendToOpenClaw(errorMessage);
      break;
      
    case 'daily':
      const dailyMessage = reporter.generateDailyReport();
      reporter.sendToOpenClaw(dailyMessage);
      break;
      
    default:
      console.log('Uso: node whatsapp-reporter.js [comando]');
      console.log('Comandos:');
      console.log('  deploy-success [url] [commit-hash] [commit-message]');
      console.log('  deploy-error [error-message] [context]');
      console.log('  daily');
  }
}

module.exports = WhatsAppReporter;