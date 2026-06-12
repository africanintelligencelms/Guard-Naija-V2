import { api } from "./api";
import { AIAnalysisResult, SecurityNewsItem } from "../types";

/**
 * AI features are proxied through the GuardNG API (OpenRouter server-side).
 * No model API keys ever ship in this bundle. Every call degrades
 * gracefully — AI is an enhancement, never a blocker.
 */

export const analyzeIncidentDescription = async (
  description: string
): Promise<AIAnalysisResult | null> => {
  try {
    return await api.post<AIAnalysisResult>("/ai/analyze", { description });
  } catch (error) {
    console.warn("AI analysis unavailable:", error);
    return null;
  }
};

export const sendSafetyChatMessage = async (
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string | null> => {
  try {
    const { reply } = await api.post<{ reply: string }>("/ai/chat", {
      messages,
    });
    return reply;
  } catch (error) {
    console.warn("Safety chat unavailable:", error);
    return null;
  }
};

export const fetchLiveSecurityNews = async (): Promise<SecurityNewsItem[]> => {
  try {
    return await api.get<SecurityNewsItem[]>("/news");
  } catch (error) {
    console.warn("News unavailable:", error);
    return [];
  }
};
