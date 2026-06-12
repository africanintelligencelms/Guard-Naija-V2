import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getFirestore } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';

const geminiKey = defineSecret('GEMINI_API_KEY');

/**
 * Scheduled Cloud Function: runs every 6 hours to fetch and cache safety news.
 * Clients read this cached doc instead of calling Gemini directly,
 * eliminating per-user API costs and enabling offline news delivery.
 *
 * Writes to: newsCache/latest with:
 * - news (array of news items)
 * - tips (array of safety tips)
 * - lastUpdated
 */
export const refreshNews = onSchedule(
  {
    schedule: '0 */6 * * *', // Every 6 hours
    timeZone: 'Africa/Lagos',
    region: 'europe-west1',
    secrets: [geminiKey],
  },
  async () => {
    const db = getFirestore();
    const newsRef = db.collection('newsCache').doc('latest');

    try {
      const genAI = new GoogleGenerativeAI(geminiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a safety news curator for Nigeria.
      
Provide 5 recent safety-related news items or tips for Nigerian citizens in JSON format:
{
  "news": [
    { "title": "...", "description": "...", "date": "YYYY-MM-DD" }
  ],
  "tips": [
    { "title": "...", "content": "..." }
  ]
}

Focus on:
- Road safety
- Personal security
- Cybersecurity awareness
- Emergency preparedness
- Community safety initiatives

Keep language simple and actionable. Include real Nigerian context.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      let newsData;
      try {
        const jsonMatch = responseText.match(/```json\n?([^`]+)\n?```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseText;
        newsData = JSON.parse(jsonString);
      } catch (parseError) {
        logger.warn('Failed to parse news response as JSON', {
          response: responseText,
        });
        newsData = {
          news: [{ title: 'Safety Update', description: responseText, date: new Date().toISOString().split('T')[0] }],
          tips: [],
        };
      }

      // Write to Firestore
      await newsRef.set(
        {
          news: newsData.news || [],
          tips: newsData.tips || [],
          lastUpdated: new Date(),
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
        },
        { merge: true }
      );

      logger.info('News cache refreshed', {
        newsCount: newsData.news?.length || 0,
        tipsCount: newsData.tips?.length || 0,
      });
    } catch (error) {
      logger.error('Error refreshing news', { error });
      // Don't throw — cache refresh is non-critical
    }
  }
);
