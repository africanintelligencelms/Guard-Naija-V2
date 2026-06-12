import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as logger from 'firebase-functions/logger';

const geminiKey = defineSecret('GEMINI_API_KEY');

/**
 * Callable Cloud Function to analyze incident descriptions using Gemini.
 * This proxies the Gemini API server-side, keeping the API key secure.
 * Never expose the API key to the client.
 *
 * Usage from client:
 * const analyzeIncident = httpsCallable(functions, 'analyzeIncident');
 * const result = await analyzeIncident({
 *   description: 'Robbery at local market',
 *   type: 'theft',
 *   location: 'Lagos'
 * });
 */
export const analyzeIncident = onCall(
  { secrets: [geminiKey], region: 'europe-west1' },
  async (request) => {
    try {
      // Validate authentication
      if (!request.auth) {
        throw new Error('Unauthenticated call to analyzeIncident');
      }

      const { description, type, location } = request.data;

      // Validate input
      if (!description || typeof description !== 'string') {
        throw new Error('Missing or invalid description');
      }
      if (description.length > 5000) {
        throw new Error('Description exceeds 5000 characters');
      }

      // Initialize Gemini with server-side key
      const genAI = new GoogleGenerativeAI(geminiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build the prompt for incident categorization
      const prompt = `You are a security incident categorizer. Analyze the following incident report and provide:
1. Primary category (one of: theft, violence, accident, fraud, cybercrime, harassment, other)
2. Severity level (low, medium, high, critical)
3. Recommended actions (2-3 short bullet points)
4. Key details extracted (list key facts)

Incident Report:
Type: ${type || 'unknown'}
Location: ${location || 'not provided'}
Description: ${description}

Respond in JSON format with keys: category, severity, actions (array), keyDetails (array)`;

      // Call Gemini
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Attempt to parse JSON response
      let analysis;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```json\n?([^`]+)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        analysis = JSON.parse(jsonString);
      } catch (parseError) {
        logger.warn('Failed to parse Gemini response as JSON', {
          response: responseText,
        });
        // Return raw response if JSON parsing fails
        analysis = { rawResponse: responseText };
      }

      logger.info('Incident analyzed successfully', {
        incidentType: type,
        category: analysis.category,
        severity: analysis.severity,
      });

      return {
        success: true,
        analysis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in analyzeIncident', { error });
      // Don't expose internal error details to client
      throw new Error('Failed to analyze incident. Please try again.');
    }
  }
);
