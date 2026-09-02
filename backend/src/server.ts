import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSocketServer } from './shared/socket/socketServer.js';
import { startLockTimeoutJob } from './shared/jobs/lockTimeoutJob.js';
import { logger } from './shared/logger/logger.js';

const httpServer = createServer(app);

// Inicializar Socket.io em tempo real
initSocketServer(httpServer);

// Iniciar Job de timeout de locks (45 min)
startLockTimeoutJob();

httpServer.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`[DOMUS Master Backend] Servidor HTTP & WebSocket escutando em 0.0.0.0:${env.PORT} (${env.NODE_ENV})`);
});

