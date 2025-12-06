import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult, IncidentType, SeverityLevel, SecurityNewsItem } from "../types";

// Helper to get safe API key
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const analyzeIncidentDescription = async (description: string): Promise<GeminiAnalysisResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API Key not found. Returning mock analysis.");
    // Mock fallback for development if key is missing
    return {
      suggestedType: IncidentType.SuspiciousActivity,
      severityScore: 5,
      severityLevel: SeverityLevel.Medium,
      summary: "Analysis unavailable (Missing Key).",
      keywords: ["pending"]
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following security incident description provided by a citizen in Nigeria. 
      Categorize it, determine severity (1-10), and extract keywords.
      Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedType: {
              type: Type.STRING,
              enum: Object.values(IncidentType),
              description: "The most fitting category for the incident."
            },
            severityScore: {
              type: Type.NUMBER,
              description: "Severity from 1 (Low) to 10 (Critical)."
            },
            summary: {
              type: Type.STRING,
              description: "A concise 10-word summary of the incident."
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key entities or threats mentioned."
            }
          },
          required: ["suggestedType", "severityScore", "summary", "keywords"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);

    // Map numeric score to Enum
    let severityLevel = SeverityLevel.Low;
    if (data.severityScore >= 8) severityLevel = SeverityLevel.Critical;
    else if (data.severityScore >= 6) severityLevel = SeverityLevel.High;
    else if (data.severityScore >= 4) severityLevel = SeverityLevel.Medium;

    return {
      suggestedType: data.suggestedType as IncidentType,
      severityScore: data.severityScore,
      severityLevel,
      summary: data.summary,
      keywords: data.keywords
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};

export const fetchLiveSecurityNews = async (): Promise<SecurityNewsItem[]> => {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Use Google Search Grounding to get real news
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find the latest 3 major security incidents or news reports in Nigeria from the last 24 hours. Focus on kidnapping, banditry, or government security operations. Provide a headline and the specific news source name for each.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const items: SecurityNewsItem[] = [];
    
    // Extract Grounding Metadata (Source URLs)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Parse the text to create somewhat structured data, linked with grounding chunks
    // Note: Since we can't force JSON with Search Tool easily in one go without losing grounding sometimes, 
    // we will parse the response or map grounding chunks directly if the text is simple.
    // Strategy: Map grounding chunks directly to items for accuracy of links.

    groundingChunks.forEach((chunk: any, index: number) => {
       if (chunk.web) {
           items.push({
               id: `news-${index}`,
               headline: chunk.web.title || "Security Update",
               source: "Online Media",
               url: chunk.web.uri,
               time: "Recent"
           });
       }
    });

    // Deduplicate items based on URL
    const uniqueItems = Array.from(new Map(items.map(item => [item.url, item])).values()).slice(0, 5);
    
    return uniqueItems;

  } catch (error) {
    console.error("Failed to fetch live news:", error);
    return [];
  }
};