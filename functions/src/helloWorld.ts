import { onRequest } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';

/**
 * Simple HTTP endpoint for health checks and testing.
 */
export const helloWorld = onRequest((request, response) => {
  logger.info('helloWorld called', { method: request.method });
  response.set('Access-Control-Allow-Origin', '*');
  response.json({
    status: 'ok',
    message: 'GuardNG Cloud Functions are running',
    timestamp: new Date().toISOString(),
  });
});
