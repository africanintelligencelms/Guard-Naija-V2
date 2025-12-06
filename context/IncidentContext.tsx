
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IncidentReport, IncidentStatus, IncidentType, SeverityLevel } from '../types';
import { MOCK_INCIDENTS } from '../constants';

interface IncidentContextType {
  incidents: IncidentReport[];
  addReport: (report: IncidentReport) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  stats: {
    total: number;
    resolved: number;
    critical: number;
    active: number;
  };
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage or fall back to mock
  useEffect(() => {
    const stored = localStorage.getItem('guard_nigeria_incidents');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
            setIncidents(parsed);
        } else {
            setIncidents(MOCK_INCIDENTS);
        }
      } catch (e) {
        setIncidents(MOCK_INCIDENTS);
      }
    } else {
      setIncidents(MOCK_INCIDENTS);
    }
    setIsLoaded(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('guard_nigeria_incidents', JSON.stringify(incidents));
    }
  }, [incidents, isLoaded]);

  // Simulate Live Feed (WebSocket/Polling)
  useEffect(() => {
    if (!isLoaded) return;

    // Simulate a new report coming in every 30-60 seconds
    const interval = setInterval(() => {
      const randomLat = 6 + Math.random() * 6; // Approx Lat range for Nigeria 
      const randomLng = 3 + Math.random() * 10; // Approx Lng range for Nigeria
      
      const types = Object.values(IncidentType);
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const severities = Object.values(SeverityLevel);
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];

      const newReport: IncidentReport = {
        id: Math.random().toString(36).substr(2, 9),
        type: randomType,
        description: `Live Report: Suspected activity detected near sector ${Math.floor(Math.random() * 100)}.`,
        location: {
          lat: randomLat,
          lng: randomLng,
          address: `Remote Location (${randomLat.toFixed(2)}, ${randomLng.toFixed(2)})`
        },
        severity: randomSeverity,
        timestamp: Date.now(),
        status: IncidentStatus.Submitted,
        isAnonymous: true
      };

      // 30% chance to add a new incident
      if (Math.random() > 0.7) {
         setIncidents(prev => [newReport, ...prev]);
         // Optional: Add a toast notification logic here if we had a toast system
         console.log("New Live Incident Received:", newReport.id);
      }

    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isLoaded]);

  const addReport = (report: IncidentReport) => {
    setIncidents(prev => [report, ...prev]);
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
  };

  const stats = {
    total: incidents.length,
    resolved: incidents.filter(i => i.status === IncidentStatus.Resolved).length,
    critical: incidents.filter(i => i.severity === SeverityLevel.Critical).length, 
    active: incidents.filter(i => i.status !== IncidentStatus.Resolved).length,
  };

  return (
    <IncidentContext.Provider value={{ incidents, addReport, updateIncidentStatus, stats }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) throw new Error('useIncidents must be used within an IncidentProvider');
  return context;
};
