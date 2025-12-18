import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { LogEntry } from "../types";

const LOGS_COLLECTION = "audit_logs";

export const addLog = async (
  action: string,
  details: string,
  role: string,
  type: LogEntry["type"]
) => {
  try {
    await addDoc(collection(db, LOGS_COLLECTION), {
      action,
      details,
      role,
      type,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error adding log:", error);
  }
};

export const subscribeToLogs = (
  callback: (logs: LogEntry[]) => void,
  limitCount: number = 20
) => {
  const q = query(
    collection(db, LOGS_COLLECTION),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogEntry[];
    callback(logs);
  });
};

export const getAllLogs = async (): Promise<LogEntry[]> => {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogEntry[];
  } catch (error) {
    console.error("Error fetching all logs:", error);
    return [];
  }
};
