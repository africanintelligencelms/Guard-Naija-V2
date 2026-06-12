/**
 * Cloud Functions for GuardNG.
 * All Gemini API calls are proxied server-side — the API key is never exposed to the client.
 */

import { setGlobalOptions } from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: 'europe-west1', // Closest stable region to Nigeria
});

// Import and export all Cloud Functions
export { analyzeIncident } from './analyzeIncident';
export { safetyChat } from './safetyChat';
export { onIncidentWrite } from './statsAggregation';
export { refreshNews } from './refreshNews';

// Health check function (simple HTTP endpoint)
export { helloWorld } from './helloWorld';

logger.info('GuardNG Cloud Functions initialized', {
  region: 'europe-west1',
  functions: ['analyzeIncident', 'safetyChat', 'onIncidentWrite', 'refreshNews'],
});
