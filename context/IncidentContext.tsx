import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  IncidentReport,
  IncidentStatus,
  SeverityLevel,
  NewIncidentPayload,
} from "../types";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";
import { addLog } from "../services/logService";

const POLL_MS = 30_000;
const CACHE_KEY = "guardng_incidents_cache";

interface IncidentContextType {
  incidents: IncidentReport[];
  addReport: (report: NewIncidentPayload | IncidentReport) => Promise<void>;
  updateIncidentStatus: (id: string, status: IncidentStatus) => Promise<void>;
  stats: {
    total: number;
    resolved: number;
    critical: number;
    active: number;
  };
}

const IncidentContext = createContext<IncidentContextType | undefined>(
  undefined
);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const { user, role } = useAuth();

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get<IncidentReport[]>("/incidents");
      setIncidents(data);
      // Offline-first: last good response survives restarts (read cache;
      // the write outbox lands in Phase 3)
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        /* storage full/unavailable — cache is best-effort */
      }
    } catch {
      // Offline or server unreachable — keep showing what we have
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIncidents([]);
      return;
    }

    // Serve cached data instantly, then revalidate
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setIncidents(JSON.parse(cached));
    } catch {
      /* corrupt cache — ignore */
    }
    refresh();

    // Poll instead of websockets: kinder to 2G connections and batteries,
    // and survives proxies. Refresh on focus for snappy resume.
    const interval = setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refresh]);

  const addReport = async (report: NewIncidentPayload | IncidentReport) => {
    const created = await api.post<IncidentReport>("/incidents", report);
    // Show immediately; the next poll reconciles
    setIncidents((prev) => [created, ...prev]);
  };

  const updateIncidentStatus = async (id: string, status: IncidentStatus) => {
    try {
      const updated = await api.patch<IncidentReport>(
        `/incidents/${id}/status`,
        { status }
      );
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      await addLog(
        "Status Update",
        `Changed Incident #${id.substring(0, 6)} to "${status}"`,
        role === "admin" ? "Admin" : role === "agency" ? "Agency" : "System",
        "edit"
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const stats = {
    total: incidents.length,
    resolved: incidents.filter((i) => i.status === IncidentStatus.Resolved)
      .length,
    critical: incidents.filter((i) => i.severity === SeverityLevel.Critical)
      .length,
    active: incidents.filter((i) => i.status !== IncidentStatus.Resolved)
      .length,
  };

  return (
    <IncidentContext.Provider
      value={{ incidents, addReport, updateIncidentStatus, stats }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context)
    throw new Error("useIncidents must be used within an IncidentProvider");
  return context;
};
