import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as logger from 'firebase-functions/logger';

const geminiKey = defineSecret('GEMINI_API_KEY');

const SAFETY_SYSTEM_PROMPT = `You are SafetyChat, an AI assistant for GuardNG (a Nigerian citizen safety reporting app).
Your role is to:
1. Provide safety tips and emergency response guidance
2. Help users understand how to report incidents
3. Offer mental health support resources
4. Answer questions about personal safety in Nigeria
5. Provide hotline numbers: Police (112), Fire (199), Ambulance (112)

Always be empathetic, non-judgmental, and culturally sensitive to the Nigerian context.
Never provide medical diagnosis. Always recommend professional help for serious situations.
Keep responses concise and plain-language (many users have basic English literacy).`;

/**
 * Callable Cloud Function for the SafetyChat AI assistant.
 * This proxies Gemini conversations server-side with a fixed system prompt.
 * Never expose the API key to the client.
 *
 * Usage from client:
 * const safetyChat = httpsCallable(functions, 'safetyChat');
 * const result = await safetyChat({
 *   message: 'What should I do if I witness a robbery?',
 *   conversationId: 'user-uuid'
 * });
 */
export const safetyChat = onCall(
  { secrets: [geminiKey], region: 'europe-west1' },
  async (request) => {
    try {
      // Validate authentication
      if (!request.auth) {
        throw new Error('Unauthenticated call to safetyChat');
      }

      const { message, conversationId } = request.data;

      // Validate input
      if (!message || typeof message !== 'string') {
        throw new Error('Missing or invalid message');
      }
      if (message.length > 1000) {
        throw new Error('Message exceeds 1000 characters');
      }

      // Initialize Gemini with server-side key
      const genAI = new GoogleGenerativeAI(geminiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Start a chat session with safety guidelines
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
        systemInstruction: SAFETY_SYSTEM_PROMPT,
      });

      // Send user message and get response
      const response = await chat.sendMessage(message);
      const reply = response.response.text();

      logger.info('SafetyChat message processed', {
        conversationId,
        messageLength: message.length,
        responseLength: reply.length,
      });

      return {
        success: true,
        reply,
        conversationId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in safetyChat', { error });
      // Don't expose internal error details to client
      throw new Error('Failed to process message. Please try again.');
    }
  }
);
