import { api } from "./api";
import { LogEntry } from "../types";

export const addLog = async (
  action: string,
  details: string,
  role: string,
  type: LogEntry["type"]
) => {
  try {
    await api.post("/logs", { action, details, role, type });
  } catch (error) {
    console.error("Error adding log:", error);
  }
};

/**
 * Same signature as the old Firestore subscription so callers don't change:
 * fetches immediately, then polls; returns an unsubscribe function.
 */
export const subscribeToLogs = (
  callback: (logs: LogEntry[]) => void,
  limitCount: number = 20
) => {
  let active = true;
  const load = async () => {
    try {
      const logs = await api.get<LogEntry[]>(`/logs?limit=${limitCount}`);
      if (active) callback(logs);
    } catch {
      // offline / not admin — keep last data
    }
  };
  load();
  const interval = setInterval(load, 30_000);
  return () => {
    active = false;
    clearInterval(interval);
  };
};

export const getAllLogs = async (): Promise<LogEntry[]> => {
  try {
    return await api.get<LogEntry[]>("/logs?limit=500");
  } catch (error) {
    console.error("Error fetching all logs:", error);
    return [];
  }
};
